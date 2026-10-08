import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getSamgovApiKey } from "../_shared/samgov-key.ts";

// Manual, admin-only SAM.gov opportunity retrieval. Step-based so the page can show progress:
// start -> naics (once per active code) -> finish. The API key never leaves this function.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_REQUESTS_PER_RUN = 300;
const MAX_PAGES_PER_NAICS = 40;
const UUID = /^[0-9a-f-]{36}$/i;

const ERRORS: Record<string, string> = {
  auth: "Your SAM.gov API key is invalid or expired. Please update the API key in SAM.gov API settings.",
  bad_request: "SAM.gov rejected the request. Please check the search configuration.",
  rate_limit: "SAM.gov API rate limit reached. Please try again later.",
  unavailable: "SAM.gov is currently unavailable. Please try again later.",
  no_key: "Configure a SAM.gov API key before fetching opportunities.",
};
const kindFor = (s: number) => (s === 401 || s === 403 ? "auth" : s === 429 ? "rate_limit" : s >= 500 || s === 0 ? "unavailable" : "bad_request");
const FATAL = new Set(["auth", "rate_limit", "no_key"]);

const mdy = (iso: string) => { const [y, m, d] = iso.split("-"); return `${m}/${d}/${y}`; };
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

// deno-lint-ignore no-explicit-any
function normalize(o: any) {
  const path: string = o.fullParentPathName ?? "";
  const parts = path.split(".").map((s: string) => s.trim()).filter(Boolean);
  // deno-lint-ignore no-explicit-any
  const poc = Array.isArray(o.pointOfContact) ? o.pointOfContact.map((p: any) => ({
    type: p?.type ?? null, full_name: p?.fullName ?? null, email: p?.email ?? null, phone: p?.phone ?? null,
  })) : [];
  const deadline = o.responseDeadLine ? new Date(o.responseDeadLine) : null;
  return {
    notice_id: String(o.noticeId),
    solicitation_number: o.solicitationNumber ?? null,
    title: o.title ?? null,
    posted_date: o.postedDate ? String(o.postedDate).slice(0, 10) : null,
    response_deadline: deadline && !isNaN(deadline.getTime()) ? deadline.toISOString() : null,
    naics_code: o.naicsCode ?? null,
    type: o.type ?? null,
    type_of_set_aside: o.typeOfSetAside ?? null,
    type_of_set_aside_description: o.typeOfSetAsideDescription ?? null,
    active: o.active ?? null,
    organization: parts[parts.length - 1] ?? null,
    full_parent_path_name: path || null,
    department: parts[0] ?? null,
    sub_tier: parts[1] ?? null,
    office: parts.length > 2 ? parts[parts.length - 1] : null,
    description: o.description ?? null,
    ui_link: o.uiLink ?? null,
    point_of_contact: poc,
    raw_data: o,
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
      const key = await getSamgovApiKey(db);
      if (!key) return json({ error: ERRORS.no_key, kind: "no_key" }, 400);
      const { data: s } = await db.from("samgov_settings").select("default_date_range,custom_posted_from,custom_posted_to").eq("id", 1).single();
      let from: string, to: string;
      if (s!.default_date_range === "custom") {
        if (!s!.custom_posted_from || !s!.custom_posted_to) return json({ error: "Set Posted From and Posted To in Search Settings." }, 400);
        from = s!.custom_posted_from; to = s!.custom_posted_to;
        const span = (Date.parse(to) - Date.parse(from)) / 86400000;
        if (span < 0 || span > 365) return json({ error: "Custom range must be between 0 and 365 days." }, 400);
      } else {
        const days = Number(s!.default_date_range) || 7;
        to = isoDay(new Date()); from = isoDay(new Date(Date.now() - days * 86400000));
      }
      const { data: codes } = await db.from("samgov_naics").select("code,description").eq("active", true).order("code");
      if (!codes?.length) return json({ error: "Add at least one active NAICS code before fetching." }, 400);
      const { data: run, error } = await db.from("samgov_fetch_runs").insert({
        date_from: from, date_to: to, naics_codes_requested: codes.map((c) => c.code),
      }).select("id,started_at").single();
      if (error) throw error;
      return json({ run_id: run.id, date_from: from, date_to: to, naics: codes });
    }

    const runId = String(body.run_id ?? "");
    if (!UUID.test(runId)) return json({ error: "Invalid run" }, 400);
    const { data: run } = await db.from("samgov_fetch_runs").select("*").eq("id", runId).single();
    if (!run || run.status !== "running") return json({ error: "Run is not active." }, 400);

    if (action === "naics") {
      const code = String(body.code ?? "");
      if (!/^\d{2,6}$/.test(code) || !run.naics_codes_requested.includes(code)) return json({ error: "Invalid NAICS" }, 400);
      const key = await getSamgovApiKey(db);
      if (!key) return json({ error: ERRORS.no_key, kind: "no_key" }, 400);
      const { data: s } = await db.from("samgov_settings").select("results_per_request,auto_pagination").eq("id", 1).single();
      const limit = Math.min(Math.max(s!.results_per_request, 1), 1000);

      let requests = 0, received = 0, created = 0, updated = 0, dupes = 0, offset = 0;
      let errorKind: string | null = null;
      for (let page = 0; page < MAX_PAGES_PER_NAICS; page++) {
        if (run.total_api_requests + requests >= MAX_REQUESTS_PER_RUN) { errorKind = errorKind ?? "request_cap"; break; }
        const params = new URLSearchParams({
          api_key: key, postedFrom: mdy(run.date_from), postedTo: mdy(run.date_to), ncode: code,
          limit: String(limit), offset: String(offset),
        });
        let status = 0;
        // deno-lint-ignore no-explicit-any
        let payload: any = null;
        try {
          const r = await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`, { signal: AbortSignal.timeout(30000) });
          status = r.status;
          if (r.ok) payload = await r.json(); else await r.body?.cancel();
        } catch { status = 0; }
        requests++;
        if (!payload) {
          errorKind = kindFor(status);
          console.warn("samgov fetch error", { status, naics: code, at: new Date().toISOString() });
          break;
        }
        const items = Array.isArray(payload.opportunitiesData) ? payload.opportunitiesData.filter((o: { noticeId?: string }) => o?.noticeId) : [];
        received += items.length;
        if (items.length) {
          const rows = items.map(normalize);
          const ids = [...new Set(rows.map((r: { notice_id: string }) => r.notice_id))];
          const { data: existing } = await db.from("samgov_opportunities").select("notice_id,last_seen_at").in("notice_id", ids);
          const seen = new Map((existing ?? []).map((e) => [e.notice_id, e.last_seen_at]));
          const now = new Date().toISOString();
          const unique = new Map<string, ReturnType<typeof normalize>>();
          for (const r of rows) {
            if (unique.has(r.notice_id)) { dupes++; continue; }
            const prev = seen.get(r.notice_id);
            if (prev && prev >= run.started_at) dupes++;
            else if (prev) updated++;
            else created++;
            unique.set(r.notice_id, r);
          }
          const { error } = await db.from("samgov_opportunities")
            .upsert([...unique.values()].map((r) => ({ ...r, last_seen_at: now })), { onConflict: "notice_id" });
          if (error) { console.error("samgov upsert failed", { code: error.code }); errorKind = "storage"; break; }
        }
        const total = Number(payload.totalRecords ?? 0);
        offset += limit;
        if (!s!.auto_pagination || items.length < limit || offset >= total) break;
      }

      const patch = {
        total_api_requests: run.total_api_requests + requests,
        total_records_received: run.total_records_received + received,
        new_opportunities: run.new_opportunities + created,
        updated_opportunities: run.updated_opportunities + updated,
        duplicate_records: run.duplicate_records + dupes,
        error_count: run.error_count + (errorKind ? 1 : 0),
        error_message: errorKind ? (ERRORS[errorKind] ?? (errorKind === "request_cap" ? "Safety limit of API requests reached for this fetch." : "Some results could not be saved.")) : run.error_message,
      };
      await db.from("samgov_fetch_runs").update(patch).eq("id", runId);
      return json({ ...patch, error_kind: errorKind, fatal: errorKind ? FATAL.has(errorKind) || errorKind === "request_cap" : false, message: errorKind ? patch.error_message : null });
    }

    if (action === "finish") {
      const failed = Boolean(body.failed);
      const status = failed && run.total_records_received === 0 ? "failed" : run.error_count > 0 || failed ? "completed_with_errors" : "completed";
      const { data } = await db.from("samgov_fetch_runs").update({ status, completed_at: new Date().toISOString() }).eq("id", runId).select("*").single();
      return json(data);
    }

    return json({ error: "Invalid action" }, 400);
  } catch (e) {
    console.error("samgov-fetch error", { category: e instanceof Error ? e.name : "unknown" });
    return json({ error: "Something went wrong." }, 500);
  }
});
