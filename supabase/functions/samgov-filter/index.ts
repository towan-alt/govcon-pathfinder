import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Phase 3 rule-based filtering: naics_match OR keyword_match, read from the /samgov config tables.
// Step-based (start -> batch... -> finish) so the page shows progress. Dry runs never write results.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BATCH = 200;
const STALE_MS = 2 * 60 * 1000;
const UUID = /^[0-9a-f-]{36}$/i;

type Config = {
  naics: Set<string>;
  keywords: { keyword: string; group: string }[];
  fields: { title: boolean; description: boolean; additional: boolean; solicitation: boolean };
  caseInsensitive: boolean; partial: boolean; version: string;
};

async function loadConfig(db: SupabaseClient): Promise<Config> {
  const [n, g, k, s] = await Promise.all([
    db.from("samgov_naics").select("code").eq("active", true),
    db.from("samgov_keyword_groups").select("id,name").eq("active", true),
    db.from("samgov_keywords").select("keyword,group_id").eq("active", true),
    db.from("samgov_settings").select("match_title,match_description,match_additional_description,match_solicitation_information,case_insensitive,partial_phrase_matching").eq("id", 1).single(),
  ]);
  if (n.error || g.error || k.error || s.error || !s.data) throw new Error("config_load_failed");
  const groups = new Map((g.data ?? []).map((x) => [x.id, x.name]));
  const keywords = (k.data ?? []).filter((x) => groups.has(x.group_id) && x.keyword.trim())
    .map((x) => ({ keyword: x.keyword.trim(), group: groups.get(x.group_id)! }))
    .sort((a, b) => (a.group + a.keyword).localeCompare(b.group + b.keyword));
  const naics = [...new Set((n.data ?? []).map((x) => x.code.trim()))].sort();
  const st = s.data;
  const cfg = {
    naics, keywords,
    fields: { title: st.match_title, description: st.match_description, additional: st.match_additional_description, solicitation: st.match_solicitation_information },
    caseInsensitive: st.case_insensitive, partial: st.partial_phrase_matching,
  };
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(cfg)));
  const version = [...new Uint8Array(digest)].slice(0, 6).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { ...cfg, naics: new Set(naics), version };
}

const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "" && !/^https?:\/\/\S+$/i.test(v.trim());
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// deno-lint-ignore no-explicit-any
function evaluate(raw: any, naicsCol: string | null, cfg: Config) {
  if (!raw || typeof raw !== "object") throw new Error("malformed_record");
  const codes = new Set<string>();
  for (const c of [naicsCol, raw.naicsCode, ...(Array.isArray(raw.naicsCodes) ? raw.naicsCodes : [])]) {
    if (c != null && String(c).trim()) codes.add(String(c).trim());
  }
  const matchedNaics = [...codes].find((c) => cfg.naics.has(c)) ?? null;

  // Each searchable field is tracked separately so match reasons name the field that produced them.
  const fields: [string, unknown][] = [];
  if (cfg.fields.title) fields.push(["title", raw.title]);
  if (cfg.fields.description) fields.push(["description", desc.status === "fetched" ? desc.text : raw.description]);
  if (cfg.fields.additional) {
    fields.push(["additional_description", raw.additionalInfoLink]);
    fields.push(["additional_description", raw.additionalInfo?.content]);
  }
  if (cfg.fields.solicitation) {
    fields.push(["solicitation_number", raw.solicitationNumber], ["notice_type", raw.type], ["notice_type", raw.baseType],
      ["set_aside", raw.typeOfSetAsideDescription], ["classification_code", raw.classificationCode], ["agency", raw.fullParentPathName]);
  }
  const hays = fields.filter(([, v]) => isText(v)).map(([f, v]) => {
    const t = (v as string).replace(/\s+/g, " ");
    return [f, cfg.caseInsensitive ? t.toLowerCase() : t] as const;
  });

  const kws = new Set<string>(); const groups = new Set<string>();
  const where: Record<string, string[]> = {};
  for (const { keyword, group } of cfg.keywords) {
    const kw = cfg.caseInsensitive ? keyword.toLowerCase() : keyword;
    const re = cfg.partial ? null : new RegExp(`(^|[^\\p{L}\\p{N}])${esc(kw)}($|[^\\p{L}\\p{N}])`, "u");
    for (const [f, hay] of hays) {
      if (re ? re.test(hay) : hay.includes(kw)) {
        kws.add(keyword); groups.add(group);
        (where[keyword] ??= []).includes(f) || where[keyword].push(f);
      }
    }
  }
  const naics_match = matchedNaics !== null;
  const keyword_match = kws.size > 0;
  // Missing description text is not a confirmed non-match while retrieval is still possible.
  const descPending = cfg.fields.description && ["pending", "retry_pending", "failed"].includes(desc.status);
  return {
    naics_match, matched_naics_code: matchedNaics, keyword_match,
    matched_keywords: [...kws], matched_keyword_groups: [...groups], keyword_match_fields: where,
    filter_status: naics_match || keyword_match ? "matched" : descPending ? "filter_incomplete" : "not_matched",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return json({ error: "Unauthorized" }, 401);
  const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: isAdmin } = await db.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  try {
    if (action === "start") {
      const dry = Boolean(body.dry_run);
      const cutoff = new Date(Date.now() - STALE_MS).toISOString();
      const { data: active } = await db.from("samgov_filter_runs").select("id,heartbeat_at").eq("status", "running");
      if ((active ?? []).some((r) => r.heartbeat_at > cutoff)) return json({ error: "A filter run is already in progress. Please wait for it to finish." }, 409);
      if (active?.length) await db.from("samgov_filter_runs").update({ status: "failed", error_message: "Run stopped before finishing.", completed_at: new Date().toISOString() }).in("id", active.map((r) => r.id));

      const cfg = await loadConfig(db);
      const { count } = await db.from("samgov_opportunities").select("id", { count: "exact", head: true });
      const { data: run, error } = await db.from("samgov_filter_runs")
        .insert({ dry_run: dry, config_version: cfg.version, total_opportunities: count ?? 0 }).select("*").single();
      if (error) throw error;
      return json(run);
    }

    const runId = String(body.run_id ?? "");
    if (!UUID.test(runId)) return json({ error: "Invalid run" }, 400);
    const { data: run } = await db.from("samgov_filter_runs").select("*").eq("id", runId).single();
    if (!run || run.status !== "running") return json({ error: "Run is not active." }, 400);

    if (action === "batch") {
      const after = typeof body.after_id === "string" && UUID.test(body.after_id) ? body.after_id : null;
      const cfg = await loadConfig(db);
      if (cfg.version !== run.config_version) {
        await db.from("samgov_filter_runs").update({ status: "failed", error_message: "Filter settings changed during the run. Please run it again.", completed_at: new Date().toISOString() }).eq("id", runId);
        return json({ error: "Filter settings changed during the run. Please run it again." }, 409);
      }
      let q = db.from("samgov_opportunities").select("id,naics_code,raw_data").order("id").limit(BATCH);
      if (after) q = q.gt("id", after);
      const { data: rows, error } = await q;
      if (error) throw error;

      const now = new Date().toISOString();
      const c = { naics_only: 0, keyword_only: 0, both_match: 0, neither: 0, failed: 0 };
      const groups = new Map<string, { patch: Record<string, unknown>; ids: string[] }>();
      const failures: string[] = [];
      for (const r of rows ?? []) {
        let patch: Record<string, unknown>;
        try {
          const e = evaluate(r.raw_data, r.naics_code, cfg);
          if (e.naics_match && e.keyword_match) c.both_match++;
          else if (e.naics_match) c.naics_only++;
          else if (e.keyword_match) c.keyword_only++;
          else c.neither++;
          patch = { ...e, filter_error: null };
        } catch (err) {
          c.failed++;
          const msg = err instanceof Error ? err.message : "unknown_error";
          failures.push(r.id);
          patch = { filter_status: "filter_failed", naics_match: null, matched_naics_code: null, keyword_match: null, matched_keywords: [], matched_keyword_groups: [], filter_error: msg };
        }
        const key = JSON.stringify(patch);
        if (!groups.has(key)) groups.set(key, { patch, ids: [] });
        groups.get(key)!.ids.push(r.id);
      }

      if (!run.dry_run) {
        for (const { patch, ids } of groups.values()) {
          const { error: upErr } = await db.from("samgov_opportunities")
            .update({ ...patch, filtered_at: now, filter_config_version: cfg.version }).in("id", ids);
          if (upErr) { console.error("samgov filter write failed", { code: upErr.code }); throw new Error("write_failed"); }
        }
      }

      const patch = {
        processed: run.processed + (rows?.length ?? 0),
        naics_only: run.naics_only + c.naics_only, keyword_only: run.keyword_only + c.keyword_only,
        both_match: run.both_match + c.both_match, neither: run.neither + c.neither, failed: run.failed + c.failed,
        heartbeat_at: now,
        error_message: c.failed ? `${run.failed + c.failed} record(s) could not be evaluated and were marked filter_failed.` : run.error_message,
      };
      const { data: updated } = await db.from("samgov_filter_runs").update(patch).eq("id", runId).select("*").single();
      const last = rows?.length ? rows[rows.length - 1].id : null;
      return json({ ...updated, next_after_id: rows && rows.length === BATCH ? last : null, done: !rows || rows.length < BATCH });
    }

    if (action === "finish") {
      const status = body.failed ? "failed" : run.failed > 0 ? "completed_with_errors" : "completed";
      const { data } = await db.from("samgov_filter_runs").update({ status, completed_at: new Date().toISOString(), ...(body.failed && !run.error_message ? { error_message: "The run stopped before finishing." } : {}) })
        .eq("id", runId).select("*").single();
      return json(data);
    }

    return json({ error: "Invalid action" }, 400);
  } catch (e) {
    console.error("samgov-filter error", { category: e instanceof Error ? e.message.slice(0, 40) : "unknown" });
    return json({ error: "Filtering failed. Please try again." }, 500);
  }
});
