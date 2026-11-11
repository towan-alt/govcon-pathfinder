import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { EMAIL_FROM, PUBLIC_SITE_URL } from "../_shared/training-templates.ts";
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const Prefs = z.object({ frequency: z.enum(["daily", "weekly"]), naics_codes: z.array(z.string().regex(/^\d{2,6}$/)).max(20).default([]), keywords: z.array(z.string().trim().min(1).max(60)).max(20).default([]), min_ai_score: z.number().int().min(1).max(10).nullable().default(null) });
const Email = z.string().trim().toLowerCase().email().max(255);
async function sendVerification(email: string, token: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const url = `${PUBLIC_SITE_URL}/opportunity-reports?verify=${token}`;
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `verify-${token}` }, body: JSON.stringify({ from: EMAIL_FROM, to: [email], subject: "Confirm your GoGovCon opportunity reports", html: `<p>Confirm your email to receive GoGovCon opportunity reports:</p><p><a href="${url}">Confirm my subscription</a></p><p>This link expires in 24 hours. If you did not request this, ignore this email.</p>`, text: `Confirm your subscription: ${url}\nThis link expires in 24 hours.` }) });
  if (!r.ok) console.error("Verification delivery failed", r.status, await r.text());
  return r.ok;
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json();
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Service unavailable" }, 503);
    const sb = createClient(url, key);
    const bearer = req.headers.get("authorization")?.replace(/^Bearer /, "");
    const { data: auth } = bearer ? await sb.auth.getUser(bearer) : { data: { user: null } };
    const user = auth.user;
    const action = body.action;
    const { data: settings } = await sb.from("samgov_settings").select("ai_scoring_enabled").eq("id", 1).maybeSingle();
    if (action === "config") return json({ ai_enabled: Boolean(settings?.ai_scoring_enabled) });
    const validatePrefs = (input: unknown) => {
      const p = Prefs.parse(input);
      if (!settings?.ai_scoring_enabled) p.min_ai_score = null;
      return p;
    };
    const save = async (id: string, values: Record<string, unknown>) => {
      const { error } = await sb.from("opportunity_subscriptions").update(values).eq("id", id);
      if (error) throw new Error("Could not save subscription changes.");
    };
    if (action === "subscribe") {
      const email = Email.parse(body.email), prefs = validatePrefs(body);
      const { data: existing, error: lookupError } = await sb.from("opportunity_subscriptions").select("*").eq("email", email).maybeSingle();
      if (lookupError) throw new Error("Could not look up subscription.");
      const ownsEmail = Boolean(user?.email_confirmed_at && user.email?.toLowerCase() === email);
      // Never let an anonymous email-only submission modify an existing subscription.
      if (existing && !(ownsEmail && (!existing.user_id || existing.user_id === user?.id))) {
        if (existing.status === "pending") await sendVerification(email, existing.verify_token);
        return json({ ok: true, message: "If confirmation is needed, check your inbox. Existing subscribers can use their management link to change preferences." });
      }
      if (ownsEmail) {
        const { data: owned } = await sb.from("opportunity_subscriptions").select("id").eq("user_id", user?.id).maybeSingle();
        if (owned && owned.id !== existing?.id) return json({ error: "Manage your existing account subscription instead." }, 409);
      }
      const values = { email, ...prefs, user_id: ownsEmail ? user?.id : null, status: ownsEmail ? "active" : "pending", verified_at: ownsEmail ? new Date().toISOString() : null, verify_token: crypto.randomUUID(), verify_expires_at: new Date(Date.now() + 86400000).toISOString(), next_send_at: new Date().toISOString() };
      const { data: sub, error } = existing ? await sb.from("opportunity_subscriptions").update(values).eq("id", existing.id).select("*").single() : await sb.from("opportunity_subscriptions").insert(values).select("*").single();
      if (error || !sub) throw new Error("Could not save subscription.");
      const sent = ownsEmail ? false : await sendVerification(email, sub.verify_token);
      return json({ ok: true, emailSent: sent, message: ownsEmail ? "Your subscription is active." : sent ? "Check your inbox to confirm your subscription." : "Subscription saved. Email confirmation is unavailable until the sending service is configured; reports will not send before verification." });
    }
    if (action === "verify") {
      const token = z.string().uuid().parse(body.token);
      const { data: sub } = await sb.from("opportunity_subscriptions").select("*").eq("verify_token", token).maybeSingle();
      if (!sub || sub.status !== "pending" || new Date(sub.verify_expires_at).getTime() < Date.now()) return json({ error: "This confirmation link has expired or already been used." }, 400);
      await save(sub.id, { status: "active", verified_at: new Date().toISOString(), verify_token: crypto.randomUUID(), next_send_at: new Date().toISOString() });
      return json({ ok: true, message: "Your subscription is confirmed." });
    }
    let sub;
    if (body.token) {
      const token = z.string().uuid().parse(body.token);
      const result = await sb.from("opportunity_subscriptions").select("*").eq("unsub_token", token).maybeSingle(); sub = result.data;
    } else {
      if (!user) return json({ error: "Sign in to manage your subscription." }, 401);
      const owned = await sb.from("opportunity_subscriptions").select("*").eq("user_id", user.id).maybeSingle(); sub = owned.data;
      if (!sub && user.email_confirmed_at && user.email) {
        const guest = await sb.from("opportunity_subscriptions").select("*").eq("email", user.email.toLowerCase()).is("user_id", null).maybeSingle();
        sub = guest.data;
        if (sub) await save(sub.id, { user_id: user.id });
      }
    }
    if (!sub) return action === "manage" && user ? json({ subscription: null }) : json({ error: "Subscription not found." }, 404);
    if (action === "opportunity") {
      const id = z.string().uuid().parse(body.id);
      const { data: history } = await sb.from("opportunity_report_sends").select("id").eq("subscription_id", sub.id).eq("status", "sent").contains("opportunity_ids", [id]).limit(1);
      if (!history?.length) return json({ error: "Opportunity not included in your reports." }, 403);
      const { data: opportunity } = await sb.from("samgov_opportunities").select("title,organization,notice_id,solicitation_number,naics_code,type_of_set_aside_description,posted_date,response_deadline,active,ai_score,description_text,ui_link").eq("id", id).single();
      return json({ opportunity });
    }
    if (action === "manage") {
      const { data: history } = await sb.from("opportunity_report_sends").select("id,report_type,status,created_at,sent_at,attempts,error").eq("subscription_id", sub.id).order("created_at", { ascending: false }).limit(10);
      return json({ subscription: { email: sub.email, status: sub.status, frequency: sub.frequency, naics_codes: sub.naics_codes, keywords: sub.keywords, min_ai_score: sub.min_ai_score, verified: Boolean(sub.verified_at), last_sent_at: sub.last_sent_at, next_send_at: sub.next_send_at, created_at: sub.created_at }, history });
    }
    if (action === "update") {
      const prefs = validatePrefs(body.prefs), email = body.email ? Email.parse(body.email) : sub.email;
      if (email !== sub.email) {
        const token = crypto.randomUUID();
        await save(sub.id, { ...prefs, email, status: "pending", verified_at: null, verify_token: token, verify_expires_at: new Date(Date.now() + 86400000).toISOString(), next_send_at: new Date().toISOString() });
        const sent = await sendVerification(email, token);
        return json({ message: sent ? "Confirm your new email address to restart reports." : "Email updated; delivery is paused until the new address can be confirmed." });
      }
      await save(sub.id, { ...prefs, next_send_at: new Date().toISOString() });
      return json({ message: "Your preferences were updated." });
    }
    if (["pause", "resume", "unsubscribe"].includes(action)) {
      if (action === "resume" && (!sub.verified_at || sub.status === "unsubscribed")) return json({ error: "Confirm or resubscribe before resuming reports." }, 400);
      await save(sub.id, { status: action === "pause" ? "paused" : action === "resume" ? "active" : "unsubscribed", ...(action === "resume" ? { next_send_at: new Date().toISOString() } : {}) });
      return json({ message: action === "pause" ? "Your reports are paused." : action === "resume" ? "Your reports have resumed." : "You have been unsubscribed." });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "Enter valid preferences: up to 20 NAICS codes (2-6 digits), 20 keywords, and a score from 1 to 10." }, 400);
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "Request failed" }, 500);
  }
});
