import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getSamgovApiKey } from "../_shared/samgov-key.ts";

// Retrieves full SAM.gov notice descriptions server-side in bounded batches with explicit continuation:
// start(mode) -> batch... -> finish. Only the official noticedesc endpoint is ever requested.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BATCH = 12;
const CONCURRENCY = 3;
const MAX_BYTES = 2_000_000;
const MAX_TEXT = 200_000;
const TIMEOUT_MS = 20_000;
const STALE_MS = 2 * 60 * 1000;
const UUID = /^[0-9a-f-]{36}$/i;
const ALLOWED_HOST = "api.sam.gov";
const ALLOWED_PATHS = new Set(["/prod/opportunities/v1/noticedesc", "/opportunities/v1/noticedesc"]);

/** Validates a description URL and returns a clean credential-free source URL, or null. */
function validate(raw: unknown): { source: string; noticeId: string } | null {
  if (typeof raw !== "string") return null;
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (u.protocol !== "https:" || u.hostname !== ALLOWED_HOST || u.port || u.username || u.password) return null;
  if (!ALLOWED_PATHS.has(u.pathname)) return null;
  const id = u.searchParams.get("noticeid") ?? "";
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) return null;
  const clean = new URL(`https://${ALLOWED_HOST}${u.pathname}`);
  clean.searchParams.set("noticeid", id);
  return { source: clean.toString(), noticeId: id };
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "-", mdash: "-", rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', bull: "•", hellip: "..." };
function decodeEntities(s: string) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}
function htmlToText(html: string) {
  let s = html.replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|nav|header|footer|noscript|iframe|svg|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/(p|div|li|h[1-6]|tr|table|section|article|ul|ol|blockquote)>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  return normalizeText(s);
}
const normalizeText = (s: string) => s.replace(/\r\n?/g, "\n").replace(/[ \t\f\v\u00a0]+/g, " ")
  .split("\n").map((l) => l.trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();

async function readLimited(r: Response): Promise<string | null> {
  const reader = r.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const all = new Uint8Array(size); let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.length; }
  return new TextDecoder().decode(all);
}

type Outcome =
  | { status: "fetched"; text: string }
  | { status: "unavailable" | "failed" | "retry_pending"; error: string; fatal?: "auth" | "rate_limit" };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchDescription(source: string, key: string): Promise<Outcome> {
  const target = new URL(source); target.searchParams.set("api_key", key);
  let last: Outcome = { status: "retry_pending", error: "SAM.gov is temporarily unavailable." };
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await sleep(attempt * 1500);
    let r: Response;
    try {
      r = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: "application/json, text/html, text/plain" } });
    } catch (e) {
      last = { status: "retry_pending", error: e instanceof DOMException && e.name === "TimeoutError" ? "Request timed out." : "Network error reaching SAM.gov." };
      continue;
    }
    if (r.status >= 300 && r.status < 400) { await r.body?.cancel(); return { status: "failed", error: "SAM.gov redirected the request; redirects are not followed." }; }
    if (r.status === 401 || r.status === 403) { await r.body?.cancel(); return { status: "failed", error: "SAM.gov API key was rejected.", fatal: "auth" }; }
    if (r.status === 404) { await r.body?.cancel(); return { status: "unavailable", error: "Description not found on SAM.gov." }; }
    if (r.status === 429) { await r.body?.cancel(); last = { status: "retry_pending", error: "SAM.gov rate limit reached.", fatal: "rate_limit" }; continue; }
    if (r.status >= 500) { await r.body?.cancel(); last = { status: "retry_pending", error: `SAM.gov server error (${r.status}).` }; continue; }
    if (!r.ok) { await r.body?.cancel(); return { status: "failed", error: `Unexpected SAM.gov response (${r.status}).` }; }

    const type = (r.headers.get("content-type") ?? "").toLowerCase();
    const disp = (r.headers.get("content-disposition") ?? "").toLowerCase();
    if (disp.includes("attachment") || /(pdf|octet-stream|zip|msword|officedocument|image\/)/.test(type)) {
      await r.body?.cancel();
      return { status: "unavailable", error: "Description is a file download, not text." };
    }
    const body = await readLimited(r);
    if (body === null) return { status: "failed", error: "Description exceeded the size limit." };

    let content = body;
    if (type.includes("json") || /^\s*[{[]/.test(body)) {
      try {
        const parsed = JSON.parse(body);
        const d = typeof parsed === "string" ? parsed : parsed?.description ?? parsed?.content ?? null;
        if (d == null) return { status: "unavailable", error: "SAM.gov returned no description." };
        if (typeof d !== "string") return { status: "failed", error: "Unexpected description format." };
        content = d;
      } catch { return { status: "failed", error: "Could not parse the SAM.gov response." }; }
    }
    const text = (/<[a-z][\s\S]*>/i.test(content) ? htmlToText(content) : normalizeText(decodeEntities(content))).slice(0, MAX_TEXT);
    if (!text) return { status: "unavailable", error: "Description is empty." };
    return { status: "fetched", text };
  }
  return last;
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
  const statusesFor = (mode: string) => (mode === "failed" ? ["failed"] : ["pending", "retry_pending"]);

  try {
    if (action === "start") {
      const mode = body.mode === "failed" ? "failed" : "missing";
      const key = await getSamgovApiKey(db);
      if (!key) return json({ error: "Configure and enable a SAM.gov API key first." }, 400);
      const cutoff = new Date(Date.now() - STALE_MS).toISOString();
      const { data: active } = await db.from("samgov_description_runs").select("id,heartbeat_at").eq("status", "running");
      if ((active ?? []).some((r) => r.heartbeat_at > cutoff)) return json({ error: "Description retrieval is already running." }, 409);
      if (active?.length) await db.from("samgov_description_runs").update({ status: "stopped", error_message: "Run stopped before finishing.", completed_at: new Date().toISOString() }).in("id", active.map((r) => r.id));
      const { count } = await db.from("samgov_opportunities").select("id", { count: "exact", head: true }).in("description_status", statusesFor(mode));
      const { data: run, error } = await db.from("samgov_description_runs").insert({ mode, total: count ?? 0 }).select("*").single();
      if (error) throw error;
      return json(run);
    }

    const runId = String(body.run_id ?? "");
    if (!UUID.test(runId)) return json({ error: "Invalid run" }, 400);
    const { data: run } = await db.from("samgov_description_runs").select("*").eq("id", runId).single();
    if (!run || run.status !== "running") return json({ error: "Run is not active." }, 400);

    if (action === "batch") {
      const key = await getSamgovApiKey(db);
      if (!key) return json({ error: "Configure and enable a SAM.gov API key first." }, 400);
      // Skip rows already attempted in this run, so retry_pending rows don't loop within one run.
      const { data: rows, error } = await db.from("samgov_opportunities")
        .select("id,description")
        .in("description_status", statusesFor(run.mode))
        .or(`description_attempted_at.is.null,description_attempted_at.lt.${run.started_at}`)
        .order("first_seen_at").limit(BATCH);
      if (error) throw error;

      const c = { fetched: 0, unavailable: 0, failed: 0, retry_pending: 0 };
      let fatal: string | null = null;
      const queue = [...(rows ?? [])];
      const worker = async () => {
        while (queue.length && !fatal) {
          const row = queue.shift()!;
          const now = new Date().toISOString();
          const v = validate(row.description);
          let patch: Record<string, unknown>;
          if (!v) {
            patch = { description_status: "unavailable", description_error: row.description ? "Description link is not an approved SAM.gov endpoint." : "No description link provided.", description_source_url: null };
            c.unavailable++;
          } else {
            const o = await fetchDescription(v.source, key);
            if (o.status === "fetched") {
              patch = { description_status: "fetched", description_text: o.text, description_fetched_at: now, description_error: null, description_source_url: v.source };
              c.fetched++;
            } else {
              patch = { description_status: o.status, description_error: o.error, description_source_url: v.source };
              c[o.status]++;
              if (o.fatal) fatal = o.fatal;
            }
          }
          const { data: cur } = await db.from("samgov_opportunities").select("description_attempts").eq("id", row.id).single();
          await db.from("samgov_opportunities").update({ ...patch, description_attempted_at: now, description_attempts: (cur?.description_attempts ?? 0) + 1 }).eq("id", row.id);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));

      const processed = c.fetched + c.unavailable + c.failed + c.retry_pending;
      const msg = fatal === "auth" ? "Your SAM.gov API key is invalid or expired. Please update it in SAM.gov API settings."
        : fatal === "rate_limit" ? "SAM.gov rate limit reached. Remaining descriptions are marked to retry later." : run.error_message;
      const { data: updated } = await db.from("samgov_description_runs").update({
        processed: run.processed + processed, fetched: run.fetched + c.fetched, unavailable: run.unavailable + c.unavailable,
        failed: run.failed + c.failed, retry_pending: run.retry_pending + c.retry_pending,
        heartbeat_at: new Date().toISOString(), error_message: msg,
      }).eq("id", runId).select("*").single();
      if (c.failed) console.warn("samgov description failures", { count: c.failed, at: new Date().toISOString() });
      return json({ ...updated, done: !rows || rows.length < BATCH || Boolean(fatal), fatal });
    }

    if (action === "finish") {
      const status = body.failed ? "failed" : run.error_message ? "stopped" : run.failed || run.retry_pending ? "completed_with_errors" : "completed";
      const { data } = await db.from("samgov_description_runs").update({ status, completed_at: new Date().toISOString() }).eq("id", runId).select("*").single();
      return json(data);
    }

    return json({ error: "Invalid action" }, 400);
  } catch (e) {
    console.error("samgov-descriptions error", { category: e instanceof Error ? e.message.slice(0, 40) : "unknown" });
    return json({ error: "Description retrieval failed. Please try again." }, 500);
  }
});
