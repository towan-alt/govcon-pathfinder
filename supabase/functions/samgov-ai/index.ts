import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptKey, encryptKey } from "../_shared/samgov-key.ts";

// Admin-only Claude AI fit scoring. The Anthropic key is stored encrypted and never returned or logged.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const ACTIONS = ["status", "save_key", "test", "disable", "enable", "score_one", "batch_start", "batch_step", "batch_finish"] as const;
type Action = typeof ACTIONS[number];
const MODELS = ["claude-haiku-5-5", "claude-sonnet-5-5"];
const PROVIDER = "anthropic";
const STALE_MS = 3 * 60 * 1000;
const UUID = /^[0-9a-f-]{36}$/i;

const sha = async (s: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);

const TOOL = {
  name: "record_fit_evaluation",
  description: "Record the structured fit evaluation of the opportunity for IGS.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["fit_score", "fit_category", "rationale", "strengths", "risks", "recommended_action", "confidence"],
    properties: {
      fit_score: { type: "integer", minimum: 1, maximum: 10 },
      fit_category: { type: "string", enum: ["Strong Fit", "Moderate Fit", "Low Fit"] },
      rationale: { type: "string" },
      strengths: { type: "array", items: { type: "string" } },
      risks: { type: "array", items: { type: "string" } },
      recommended_action: { type: "string" },
      confidence: { type: "string", enum: ["High", "Medium", "Low"] },
    },
  },
};

type Analysis = { fit_score: number; fit_category: string; rationale: string; strengths: string[]; risks: string[]; recommended_action: string; confidence: string };

function validate(x: unknown): Analysis | null {
  if (!x || typeof x !== "object") return null;
  const a = x as Record<string, unknown>;
  const score = Number(a.fit_score);
  if (!Number.isInteger(score) || score < 1 || score > 10) return null;
  const strs = (v: unknown) => Array.isArray(v) && v.every((s) => typeof s === "string") ? (v as string[]).slice(0, 10).map((s) => s.slice(0, 500)) : null;
  const strengths = strs(a.strengths); const risks = strs(a.risks);
  if (typeof a.rationale !== "string" || !strengths || !risks || typeof a.recommended_action !== "string") return null;
  const conf = ["High", "Medium", "Low"].includes(String(a.confidence)) ? String(a.confidence) : "Low";
  // Category is derived from the score so it can never disagree with the bands.
  const fit_category = score >= 8 ? "Strong Fit" : score >= 5 ? "Moderate Fit" : "Low Fit";
  return { fit_score: score, fit_category, rationale: a.rationale.slice(0, 3000), strengths, risks, recommended_action: a.recommended_action.slice(0, 500), confidence: conf };
}

class ApiError extends Error { constructor(public status: number, msg: string) { super(msg); } }

async function anthropic(key: string, body: Record<string, unknown>) {
  let attempt = 0;
  while (true) {
    let r: Response;
    try {
      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(90000),
      });
    } catch { throw new ApiError(0, "Could not reach Anthropic."); }
    if (r.ok) return await r.json();
    const retryable = r.status === 429 || r.status === 529 || r.status >= 500;
    let msg = `Anthropic error ${r.status}`;
    try { const b = await r.json(); if (b?.error?.type) msg = `${r.status} ${b.error.type}`; } catch { /* ignore */ }
    if (!retryable || attempt >= 3) {
      if (r.status === 401) msg = "Invalid Anthropic API key.";
      else if (r.status === 429) msg = "Anthropic rate limit reached. Try again later.";
      else if (r.status === 404) msg = "Selected Claude model is not available for this API key.";
      throw new ApiError(r.status, msg);
    }
    const ra = Number(r.headers.get("retry-after"));
    const wait = Number.isFinite(ra) && ra > 0 ? Math.min(ra * 1000, 30000) : Math.min(1000 * 2 ** attempt + Math.random() * 500, 15000);
    await r.body?.cancel().catch(() => {});
    await new Promise((res) => setTimeout(res, wait));
    attempt++;
  }
}

async function getKey(admin: SupabaseClient): Promise<string | null> {
  const { data } = await admin.from("samgov_api_credentials").select("api_key_encrypted,is_active").eq("provider", PROVIDER).maybeSingle();
  if (!data || !data.is_active) return null;
  return decryptKey(data.api_key_encrypted);
}

const OPP_SEL = "id,notice_id,title,solicitation_number,naics_code,type,type_of_set_aside_description,full_parent_path_name,organization,office,posted_date,response_deadline,description_status,description_text,filter_status,raw_data,ai_status,ai_input_hash,ai_profile_hash,ai_model";

function oppText(o: Record<string, any>) {
  const raw = o.raw_data ?? {};
  const pop = raw.placeOfPerformance ? JSON.stringify(raw.placeOfPerformance).slice(0, 500) : "Not listed";
  const desc = o.description_status === "fetched" && o.description_text ? String(o.description_text).slice(0, 20000) : null;
  return {
    limited: !desc,
    text: [
      `Title: ${o.title ?? "Not listed"}`,
      `Notice ID: ${o.notice_id}`,
      `Solicitation number: ${o.solicitation_number ?? "Not listed"}`,
      `Agency: ${o.full_parent_path_name ?? o.organization ?? "Not listed"}`,
      `Office: ${o.office ?? "Not listed"}`,
      `NAICS: ${o.naics_code ?? "Not listed"}`,
      `Classification code: ${raw.classificationCode ?? "Not listed"}`,
      `Notice type: ${o.type ?? "Not listed"}`,
      `Set-aside: ${o.type_of_set_aside_description ?? "None listed"}`,
      `Posted: ${o.posted_date ?? "Not listed"}`,
      `Response deadline: ${o.response_deadline ?? "Not listed"}`,
      `Place of performance: ${pop}`,
      `Full description: ${desc ?? "NOT AVAILABLE. Only the summary fields above are known."}`,
    ].join("\n"),
  };
}

const SYSTEM = `You evaluate federal contract opportunities for fit with one company, IGS, using only the capability profile provided.
Rules:
- Use only facts in the profile and the opportunity. Never invent certifications, set-aside eligibility, clearances, contract vehicles, or past performance.
- If a requirement (certification, set-aside status, clearance, location, size standard) is unknown, list it under risks as needing human verification.
- If the full description is not available, say the evaluation is based on limited information and set confidence to Low.
Criteria: relevance to IGS services; alignment with demonstrated experience; government contracting and past-performance fit; contract requirements and apparent eligibility; geographic suitability; risks or capability gaps.
Score 1-10: 8-10 Strong Fit, 5-7 Moderate Fit, 1-4 Low Fit. Record the result with the record_fit_evaluation tool.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: u, error: uErr } = await userClient.auth.getUser();
  if (uErr || !u.user) return json({ error: "Unauthorized" }, 401);
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "") as Action;
  if (!ACTIONS.includes(action)) return json({ error: "Invalid action" }, 400);

  const status = async () => {
    const { data } = await admin.from("samgov_api_credentials").select("api_key_last4,is_active,last_test_status,last_tested_at").eq("provider", PROVIDER).maybeSingle();
    return data ? { configured: true, ...data } : { configured: false };
  };

  const loadConfig = async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      admin.from("samgov_settings").select("ai_scoring_enabled,ai_model,ai_max_per_run").eq("id", 1).single(),
      admin.from("samgov_ai_profile").select("profile_text").eq("id", 1).single(),
    ]);
    const profile = p?.profile_text ?? "";
    const model = MODELS.includes(s?.ai_model) ? s!.ai_model : MODELS[0];
    return { enabled: Boolean(s?.ai_scoring_enabled), model, max: s?.ai_max_per_run ?? 20, profile, profileHash: await sha(profile) };
  };

  // Scores one opportunity, saving results and history. Failures never touch the opportunity's other fields.
  const scoreOne = async (key: string, cfg: Awaited<ReturnType<typeof loadConfig>>, id: string, runId: string | null) => {
    const { data: o } = await admin.from("samgov_opportunities").select(OPP_SEL).eq("id", id).maybeSingle();
    if (!o) return { ok: false, error: "Opportunity not found." };
    if (o.filter_status !== "matched") return { ok: false, error: "Only opportunities that pass the NAICS or keyword filter can be scored." };
    const { limited, text } = oppText(o);
    const inputHash = await sha(text + cfg.model + cfg.profileHash);
    await admin.from("samgov_opportunities").update({ ai_status: "pending", ai_error: null }).eq("id", id);
    try {
      const res = await anthropic(key, {
        model: cfg.model, max_tokens: 1500, system: SYSTEM,
        tools: [TOOL], tool_choice: { type: "tool", name: TOOL.name },
        messages: [{ role: "user", content: `IGS CAPABILITY PROFILE:\n${cfg.profile}\n\nOPPORTUNITY:\n${text}` }],
      });
      const block = (res.content ?? []).find((c: any) => c.type === "tool_use");
      const analysis = validate(block?.input);
      const usage = { input_tokens: res.usage?.input_tokens ?? 0, output_tokens: res.usage?.output_tokens ?? 0 };
      if (!analysis) throw Object.assign(new ApiError(200, "Claude returned an invalid evaluation."), { usage });
      if (limited && !analysis.risks.some((r) => /limited information/i.test(r))) analysis.risks.push("Limited information: full description not available; verify details manually.");
      const now = new Date().toISOString();
      await admin.from("samgov_opportunities").update({
        ai_status: "scored", ai_score: analysis.fit_score, ai_category: analysis.fit_category, ai_analysis: { ...analysis, usage },
        ai_error: null, ai_model: cfg.model, ai_scored_at: now, ai_profile_hash: cfg.profileHash, ai_input_hash: inputHash, ai_limited_info: limited,
      }).eq("id", id);
      await admin.from("samgov_ai_evaluations").insert({ opportunity_id: id, run_id: runId, status: "scored", fit_score: analysis.fit_score, fit_category: analysis.fit_category, analysis, model: cfg.model, profile_hash: cfg.profileHash, input_hash: inputHash, limited_info: limited, ...usage });
      return { ok: true, score: analysis.fit_score, ...usage };
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Scoring failed.";
      const usage = (e as any)?.usage ?? { input_tokens: 0, output_tokens: 0 };
      console.warn("samgov-ai score failed", { status: e instanceof ApiError ? e.status : 0 });
      await admin.from("samgov_opportunities").update({ ai_status: "failed", ai_error: msg }).eq("id", id);
      await admin.from("samgov_ai_evaluations").insert({ opportunity_id: id, run_id: runId, status: "failed", error: msg, model: cfg.model, profile_hash: cfg.profileHash, input_hash: inputHash, limited_info: limited, ...usage });
      return { ok: false, error: msg, fatal: e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404 || e.status === 429), ...usage };
    }
  };

  const busyRun = async () => {
    const { data } = await admin.from("samgov_ai_runs").select("id,heartbeat_at").eq("status", "running");
    const live = (data ?? []).filter((r) => Date.now() - new Date(r.heartbeat_at).getTime() < STALE_MS);
    const stale = (data ?? []).filter((r) => !live.includes(r)).map((r) => r.id);
    if (stale.length) await admin.from("samgov_ai_runs").update({ status: "abandoned", finished_at: new Date().toISOString() }).in("id", stale);
    return live[0] ?? null;
  };

  try {
    if (action === "status") return json(await status());

    if (action === "save_key") {
      const key = typeof body.api_key === "string" ? body.api_key.trim() : "";
      if (key.length < 20 || key.length > 300 || /\s/.test(key)) return json({ error: "Please enter a valid Anthropic API key." }, 400);
      const { error } = await admin.from("samgov_api_credentials").upsert({
        provider: PROVIDER, api_key_encrypted: await encryptKey(key), api_key_last4: key.slice(-4),
        is_active: true, last_test_status: "not_tested", last_tested_at: null,
      }, { onConflict: "provider" });
      if (error) return json({ error: "Could not save the key." }, 500);
      return json(await status());
    }

    if (action === "disable" || action === "enable") {
      await admin.from("samgov_api_credentials").update({ is_active: action === "enable" }).eq("provider", PROVIDER);
      return json(await status());
    }

    if (action === "test") {
      const { data: c } = await admin.from("samgov_api_credentials").select("api_key_encrypted").eq("provider", PROVIDER).maybeSingle();
      if (!c) return json({ error: "No Anthropic API key configured." }, 400);
      const key = await decryptKey(c.api_key_encrypted);
      const cfg = await loadConfig();
      let ok = false; let message = "Connected to Anthropic.";
      try {
        await anthropic(key, { model: cfg.model, max_tokens: 5, messages: [{ role: "user", content: "Reply OK." }] });
        ok = true;
      } catch (e) { message = e instanceof ApiError ? e.message : "Connection failed."; }
      await admin.from("samgov_api_credentials").update({ last_test_status: ok ? "success" : "failed", last_tested_at: new Date().toISOString() }).eq("provider", PROVIDER);
      return json({ ok, message, ...(await status()) });
    }

    // Scoring actions
    const cfg = await loadConfig();
    if (!cfg.enabled) return json({ error: "AI fit scoring is disabled. Enable it in Claude AI Settings." }, 400);
    const key = await getKey(admin);
    if (!key) return json({ error: "Add and enable an Anthropic API key in Claude AI Settings first." }, 400);

    if (action === "score_one") {
      const id = String(body.id ?? "");
      if (!UUID.test(id)) return json({ error: "Invalid opportunity." }, 400);
      if (await busyRun()) return json({ error: "A batch scoring run is in progress. Try again when it finishes." }, 409);
      const { data: run } = await admin.from("samgov_ai_runs").insert({ mode: "single", queued: 1, model: cfg.model }).select("id").single();
      const r = await scoreOne(key, cfg, id, run!.id);
      await admin.from("samgov_ai_runs").update({
        status: "completed", scored: r.ok ? 1 : 0, failed: r.ok ? 0 : 1, input_tokens: r.input_tokens ?? 0, output_tokens: r.output_tokens ?? 0,
        error_message: r.ok ? null : r.error, finished_at: new Date().toISOString(),
      }).eq("id", run!.id);
      return r.ok ? json(r) : json({ error: r.error }, 400);
    }

    if (action === "batch_start") {
      if (await busyRun()) return json({ error: "Another scoring run is already in progress." }, 409);
      const force = body.force === true;
      const { data: rows } = await admin.from("samgov_opportunities").select(OPP_SEL).eq("filter_status", "matched").order("response_deadline", { ascending: true, nullsFirst: false }).limit(1000);
      const ids: string[] = [];
      for (const o of rows ?? []) {
        if (ids.length >= cfg.max) break;
        if (!force && o.ai_status === "scored") {
          const h = await sha(oppText(o).text + cfg.model + cfg.profileHash);
          if (h === o.ai_input_hash) continue; // unchanged content and config
        }
        ids.push(o.id);
      }
      if (!ids.length) return json({ run_id: null, ids: [] });
      const { data: run } = await admin.from("samgov_ai_runs").insert({ queued: ids.length, model: cfg.model }).select("id").single();
      return json({ run_id: run!.id, ids });
    }

    const runId = String(body.run_id ?? "");
    if (!UUID.test(runId)) return json({ error: "Invalid run." }, 400);
    const { data: run } = await admin.from("samgov_ai_runs").select("*").eq("id", runId).maybeSingle();
    if (!run || run.status !== "running") return json({ error: "This run is no longer active." }, 409);

    if (action === "batch_step") {
      const id = String(body.id ?? "");
      if (!UUID.test(id)) return json({ error: "Invalid opportunity." }, 400);
      await admin.from("samgov_ai_runs").update({ heartbeat_at: new Date().toISOString() }).eq("id", runId);
      const r = await scoreOne(key, cfg, id, runId);
      const patch: Record<string, unknown> = {
        scored: run.scored + (r.ok ? 1 : 0), failed: run.failed + (r.ok ? 0 : 1),
        input_tokens: run.input_tokens + (r.input_tokens ?? 0), output_tokens: run.output_tokens + (r.output_tokens ?? 0), heartbeat_at: new Date().toISOString(),
      };
      if (r.fatal) Object.assign(patch, { status: "stopped", error_message: r.error, finished_at: new Date().toISOString() });
      await admin.from("samgov_ai_runs").update(patch).eq("id", runId);
      return json({ ...r, stop: Boolean(r.fatal) });
    }

    // batch_finish
    const { data: done } = await admin.from("samgov_ai_runs").update({ status: "completed", finished_at: new Date().toISOString() }).eq("id", runId).select("*").single();
    return json(done);
  } catch (e) {
    console.error("samgov-ai error", { category: e instanceof Error ? e.message.slice(0, 40) : "unknown" });
    return json({ error: "Something went wrong." }, 500);
  }
});
