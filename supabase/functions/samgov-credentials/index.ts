import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { decryptKey, encryptKey } from "../_shared/samgov-key.ts";

// Admin-only management of the SAM.gov API key. The full key is never returned or logged.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const ACTIONS = ["status", "save", "test", "disable", "enable"] as const;
type Action = typeof ACTIONS[number];

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

  const sel = "api_key_last4,is_active,last_test_status,last_tested_at,updated_at";
  const status = async () => {
    const { data } = await admin.from("samgov_api_credentials").select(sel).eq("provider", "samgov").maybeSingle();
    return data ? { configured: true, ...data } : { configured: false };
  };

  try {
    if (action === "status") return json(await status());

    if (action === "save") {
      const key = typeof body.api_key === "string" ? body.api_key.trim() : "";
      if (key.length < 16 || key.length > 200 || /\s/.test(key)) return json({ error: "Please enter a valid SAM.gov API key." }, 400);
      const row = {
        provider: "samgov", api_key_encrypted: await encryptKey(key), api_key_last4: key.slice(-4),
        is_active: true, last_test_status: "not_tested", last_tested_at: null,
      };
      const { error } = await admin.from("samgov_api_credentials").upsert(row, { onConflict: "provider" });
      if (error) { console.error("samgov save failed", { code: error.code }); return json({ error: "Could not save the key." }, 500); }
      return json(await status());
    }

    if (action === "disable" || action === "enable") {
      const { error } = await admin.from("samgov_api_credentials").update({ is_active: action === "enable" }).eq("provider", "samgov");
      if (error) return json({ error: "Could not update the key." }, 500);
      return json(await status());
    }

    // test
    const { data: cred } = await admin.from("samgov_api_credentials").select("api_key_encrypted").eq("provider", "samgov").maybeSingle();
    if (!cred) return json({ error: "No API key configured." }, 400);
    const key = await decryptKey(cred.api_key_encrypted);
    const fmt = (d: Date) => `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;
    const to = new Date(); const from = new Date(Date.now() - 7 * 86400000);
    const params = new URLSearchParams({ api_key: key, postedFrom: fmt(from), postedTo: fmt(to), limit: "1", offset: "0" });
    let ok = false; let httpStatus = 0;
    try {
      const r = await fetch(`https://api.sam.gov/opportunities/v2/search?${params}`, { signal: AbortSignal.timeout(20000) });
      httpStatus = r.status; ok = r.ok; await r.body?.cancel();
    } catch { httpStatus = 0; }
    if (!ok) console.warn("samgov key test failed", { status: httpStatus, at: new Date().toISOString() });
    await admin.from("samgov_api_credentials").update({ last_test_status: ok ? "success" : "failed", last_tested_at: new Date().toISOString() }).eq("provider", "samgov");
    return json({ ok, ...(await status()) });
  } catch (e) {
    console.error("samgov-credentials error", { category: e instanceof Error ? e.message.slice(0, 40) : "unknown" });
    return json({ error: "Something went wrong." }, 500);
  }
});
