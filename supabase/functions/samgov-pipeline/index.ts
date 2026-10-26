import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createHash, timingSafeEqual } from "node:crypto";
import { authorizeSamgovAdmin } from "../_shared/samgov-admin.ts";
import { getSamgovApiKey } from "../_shared/samgov-key.ts";

// One-click resumable pipeline: fetch -> descriptions -> filter -> ai -> done.
// State lives in samgov_pipeline_runs; each "tick" (from the open page or the 1-minute cron)
// takes a lease and advances by calling the existing samgov-* functions with the service key.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const TICK_BUDGET_MS = 45_000;
const LEASE_MS = 90_000;
const STALE_MS = 30 * 60 * 1000;
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Run = Record<string, any>; // deno-lint-ignore no-explicit-any

async function call(fn: string, body: Record<string, unknown>) {
  try {
    const r = await fetch(`${SB_URL}/functions/v1/${fn}`, {
      method: "POST", headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: AbortSignal.timeout(120_000),
    });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data };
  } catch {
    return { status: 0, data: { error: "Service did not respond." } };
  }
}

async function cronAuthorized(req: Request, db: SupabaseClient) {
  const token = /^Bearer ([^\s,]+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  if (!token) return false;
  const { data } = await db.from("samgov_pipeline_secret").select("token").eq("id", 1).single();
  if (!data?.token) return false;
  const d = (v: string) => createHash("sha256").update(v, "utf8").digest();
  return timingSafeEqual(d(token), d(data.token));
}

/** Advances one run as far as the time budget allows. Returns the updated run. */
async function advance(db: SupabaseClient, run: Run): Promise<Run> {
  const t0 = Date.now();
  const st = { ...(run.state ?? {}) };
  const p: Run = { fetched: run.fetched, new_opportunities: run.new_opportunities, descriptions_fetched: run.descriptions_fetched,
    matched: run.matched, ai_scored: run.ai_scored, ai_skipped: run.ai_skipped, ai_failed: run.ai_failed, warnings: [...run.warnings] };
  let stage: string = run.stage;
  let status = "running";
  let errorMessage: string | null = null;
  const warn = (w: string) => { if (!p.warnings.includes(w)) p.warnings.push(w); };
  const fail = (m: string) => { status = "failed"; errorMessage = m; };
  const save = () => db.from("samgov_pipeline_runs").update({ stage, state: st, ...p, heartbeat_at: new Date().toISOString() }).eq("id", run.id);

  while (status === "running" && Date.now() - t0 < TICK_BUDGET_MS) {
    if (stage === "fetch") {
      if (!st.fetch_run) {
        const r = await call("samgov-fetch", { action: "start" });
        if (r.status !== 200) { fail(r.data.error ?? "Could not start the SAM.gov fetch."); break; }
        Object.assign(st, { fetch_run: r.data.run_id, naics: r.data.naics.map((n: { code: string }) => n.code), i: 0 });
      } else if (st.i < st.naics.length) {
        const r = await call("samgov-fetch", { action: "naics", run_id: st.fetch_run, code: st.naics[st.i] });
        if (r.status !== 200) { warn(r.data.error ?? `NAICS ${st.naics[st.i]} could not be fetched.`); st.i++; }
        else {
          p.fetched = r.data.total_records_received; p.new_opportunities = r.data.new_opportunities;
          if (r.data.message) warn(r.data.message);
          if (r.data.error_kind === "auth" || r.data.error_kind === "no_key") { await call("samgov-fetch", { action: "finish", run_id: st.fetch_run, failed: true }); fail(r.data.message); break; }
          st.i = r.data.fatal ? st.naics.length : st.i + 1;
        }
      } else {
        await call("samgov-fetch", { action: "finish", run_id: st.fetch_run });
        stage = "descriptions";
      }
    } else if (stage === "descriptions") {
      if (!st.desc_run) {
        const r = await call("samgov-descriptions", { action: "start", mode: "missing" });
        if (r.status === 409) { warn("Description retrieval was already running elsewhere; skipped this time."); stage = "filter"; continue; }
        if (r.status !== 200) { warn(r.data.error ?? "Descriptions could not be retrieved."); stage = "filter"; continue; }
        st.desc_run = r.data.id;
      } else {
        const r = await call("samgov-descriptions", { action: "batch", run_id: st.desc_run });
        if (r.status !== 200) { warn(r.data.error ?? "Description retrieval stopped early."); }
        else p.descriptions_fetched = r.data.fetched;
        if (r.status !== 200 || r.data.done) {
          if (r.data?.fatal) warn(r.data.error_message ?? "SAM.gov stopped description retrieval; remaining descriptions will retry next run.");
          await call("samgov-descriptions", { action: "finish", run_id: st.desc_run, failed: r.status !== 200 });
          stage = "filter";
        }
      }
    } else if (stage === "filter") {
      if (!st.filter_run) {
        const r = await call("samgov-filter", { action: "start", dry_run: false });
        if (r.status !== 200) { fail(r.data.error ?? "Rule filtering could not start."); break; }
        st.filter_run = r.data.id; st.after = null;
      } else {
        const r = await call("samgov-filter", { action: "batch", run_id: st.filter_run, after_id: st.after });
        if (r.status !== 200) { await call("samgov-filter", { action: "finish", run_id: st.filter_run, failed: true }); fail(r.data.error ?? "Rule filtering failed."); break; }
        st.after = r.data.next_after_id;
        if (r.data.done) {
          await call("samgov-filter", { action: "finish", run_id: st.filter_run });
          const { count } = await db.from("samgov_opportunities").select("id", { count: "exact", head: true }).eq("filter_status", "matched");
          p.matched = count ?? 0;
          stage = "ai";
        }
      }
    } else if (stage === "ai") {
      if (!st.ai_started) {
        const r = await call("samgov-ai", { action: "batch_start" });
        st.ai_started = true;
        if (r.status !== 200) { warn(`AI scoring skipped: ${r.data.error ?? "Claude is unavailable."}`); stage = "done"; continue; }
        Object.assign(st, { ai_run: r.data.run_id, ids: r.data.ids ?? [], j: 0 });
        p.ai_skipped = Math.max(p.matched - st.ids.length, 0);
        if (!st.ai_run) { stage = "done"; continue; }
      } else if (st.j < st.ids.length) {
        const r = await call("samgov-ai", { action: "batch_step", run_id: st.ai_run, id: st.ids[st.j] });
        st.j++;
        if (r.status === 200 && r.data.ok) p.ai_scored++;
        else { p.ai_failed++; if (r.data?.error) warn(`AI: ${r.data.error}`); }
        if (r.status !== 200 || r.data.stop) { p.ai_skipped += st.ids.length - st.j; st.j = st.ids.length; }
      } else {
        await call("samgov-ai", { action: "batch_finish", run_id: st.ai_run });
        stage = "done";
      }
    } else {
      status = p.warnings.length || p.ai_failed ? "completed_with_errors" : "completed";
    }
    await save();
  }

  const final: Run = { stage, state: st, ...p, status, heartbeat_at: new Date().toISOString(), lease_until: null };
  if (status !== "running") {
    Object.assign(final, { completed_at: new Date().toISOString(), error_message: errorMessage });
    await db.rpc("samgov_pipeline_arm", { _on: false }); // stop the background runner once drained
  }
  const { data } = await db.from("samgov_pipeline_runs").update(final).eq("id", run.id).select("*").single();
  return data ?? { ...run, ...final };
}

async function tick(db: SupabaseClient) {
  const now = new Date();
  const { data: run } = await db.from("samgov_pipeline_runs").select("*").eq("status", "running").order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (!run) { await db.rpc("samgov_pipeline_arm", { _on: false }); return null; }
  if (Date.parse(run.heartbeat_at) < now.getTime() - STALE_MS) {
    const { data } = await db.from("samgov_pipeline_runs").update({ status: "failed", error_message: "The run stalled and was stopped. Click the button to try again.", completed_at: now.toISOString(), lease_until: null }).eq("id", run.id).select("*").single();
    return data;
  }
  // Lease: only one worker advances a run at a time.
  const { data: leased } = await db.from("samgov_pipeline_runs").update({ lease_until: new Date(now.getTime() + LEASE_MS).toISOString() })
    .eq("id", run.id).or(`lease_until.is.null,lease_until.lt.${now.toISOString()}`).select("*").maybeSingle();
  if (!leased) return run;
  return await advance(db, leased);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  const service = createClient(SB_URL, SERVICE);
  if (action === "cron") {
    if (!(await cronAuthorized(req, service))) return json({ error: "Unauthorized" }, 401);
    try { const r = await tick(service); return json({ ok: true, run: r?.id ?? null }); }
    catch (e) { console.error("pipeline cron error", e instanceof Error ? e.message : e); return json({ error: "tick failed" }, 500); }
  }

  const authz = await authorizeSamgovAdmin(req);
  if ("status" in authz) return json({ error: authz.status === 401 ? "Unauthorized" : "Forbidden" }, authz.status);
  const db = authz.db;

  try {
    if (action === "status") {
      const { data } = await db.from("samgov_pipeline_runs").select("*").order("started_at", { ascending: false }).limit(1).maybeSingle();
      return json({ run: data });
    }
    if (action === "start") {
      const { data: live } = await db.from("samgov_pipeline_runs").select("id,heartbeat_at").eq("status", "running").limit(1).maybeSingle();
      if (live && Date.parse(live.heartbeat_at) > Date.now() - STALE_MS) return json({ error: "Fetch & Analyze is already running." }, 409);
      if (!(await getSamgovApiKey(db))) return json({ error: "Configure and enable a SAM.gov API key in the SAM.gov API tab first." }, 400);
      if (live) await db.from("samgov_pipeline_runs").update({ status: "failed", error_message: "Run stalled and was replaced.", completed_at: new Date().toISOString() }).eq("id", live.id);
      const { data, error } = await db.from("samgov_pipeline_runs").insert({}).select("*").single();
      if (error) throw error;
      await db.rpc("samgov_pipeline_arm", { _on: true }); // keeps advancing after the page closes
      return json({ run: data });
    }
    if (action === "tick") return json({ run: await tick(db) });
    return json({ error: "Invalid action" }, 400);
  } catch (e) {
    console.error("samgov-pipeline error", e instanceof Error ? e.message.slice(0, 60) : "unknown");
    return json({ error: "Something went wrong." }, 500);
  }
});
