import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { EMAIL_FROM, PUBLIC_SITE_URL } from "../_shared/training-templates.ts";

/** Public endpoint for opportunity report subscriptions: subscribe, verify, manage, update, pause/resume, unsubscribe. */
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Prefs = z.object({
  frequency: z.enum(["daily", "weekly"]),
  naics_codes: z.array(z.string().regex(/^\d{2,6}$/)).max(20).default([]),
  keywords: z.array(z.string().min(1).max(60)).max(20).default([]),
  min_ai_score: z.number().int().min(1).max(10).nullable().default(null),
});
const SubscribeBody = Prefs.extend({ email: z.string().email().max(255) });
const TokenBody = z.object({ token: z.string().uuid() });
const UpdateBody = TokenBody.extend({ prefs: Prefs });

type Supa = ReturnType<typeof createClient>;

async function sendVerification(email: string, verifyToken: string) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return { sent: false as const, reason: "not_configured" };
  const url = `${PUBLIC_SITE_URL}/opportunity-reports?verify=${verifyToken}`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [email],
      subject: "Confirm your GoGovCon opportunity reports",
      html: `<p style="font-family:Arial,sans-serif;font-size:15px">Thanks for subscribing to GoGovCon opportunity reports. Confirm your email to start receiving them:</p><p><a href="${url}" style="display:inline-block;background:#B79B44;color:#231F20;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;font-family:Arial,sans-serif">Confirm my subscription</a></p><p style="font-family:Arial,sans-serif;font-size:12px;color:#555">If you did not request this, you can ignore this email.</p>`,
      text: `Confirm your GoGovCon opportunity reports subscription: ${url}\n\nIf you did not request this, ignore this email.`,
    }),
  });
  return r.ok ? { sent: true as const } : { sent: false as const, reason: `resend ${r.status}` };
}

const publicSub = (s: Record<string, unknown>) => ({
  email: s.email, status: s.status, frequency: s.frequency,
  naics_codes: s.naics_codes, keywords: s.keywords, min_ai_score: s.min_ai_score,
  verified: Boolean(s.verified_at), last_sent_at: s.last_sent_at, created_at: s.created_at,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const action = String(body.action ?? "");
  const sb: Supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (action === "subscribe") {
    const parsed = SubscribeBody.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { email, frequency, naics_codes, keywords, min_ai_score } = parsed.data;
    const { data: existing } = await sb.from("opportunity_subscriptions").select("id, status, verify_token").eq("email", email).maybeSingle();
    if (existing?.status === "unsubscribed") {
      // Resubscribing after unsubscribe: reactivate only after fresh verification.
      await sb.from("opportunity_subscriptions").update({ status: "pending", verified_at: null, frequency, naics_codes, keywords, min_ai_score }).eq("id", existing.id);
    } else if (existing) {
      await sb.from("opportunity_subscriptions").update({ frequency, naics_codes, keywords, min_ai_score }).eq("id", existing.id);
    } else {
      const { error } = await sb.from("opportunity_subscriptions").insert({ email, frequency, naics_codes, keywords, min_ai_score });
      if (error) return json({ error: "Could not save the subscription." }, 500);
    }
    const { data: sub } = await sb.from("opportunity_subscriptions").select("verify_token, verified_at").eq("email", email).single();
    if (sub?.verified_at) return json({ ok: true, alreadyVerified: true, message: "Your preferences were updated. Your subscription is already active." });
    const v = await sendVerification(email, sub!.verify_token);
    return json({
      ok: true, emailSent: v.sent,
      message: v.sent
        ? "Check your inbox to confirm your subscription."
        : "Your subscription was saved, but the confirmation email could not be sent yet. Please try subscribing again later.",
    });
  }

  if (action === "verify") {
    const parsed = TokenBody.safeParse(body);
    if (!parsed.success) return json({ error: "Invalid token" }, 400);
    const { data: sub } = await sb.from("opportunity_subscriptions").select("id, status").eq("verify_token", parsed.data.token).maybeSingle();
    if (!sub) return json({ error: "This confirmation link is invalid or has already been replaced." }, 404);
    await sb.from("opportunity_subscriptions").update({ status: "active", verified_at: new Date().toISOString() }).eq("id", sub.id);
    return json({ ok: true, message: "Your subscription is confirmed. Your first report will arrive on the next scheduled run." });
  }

  // Token-gated management actions (unsub_token acts as the manage link).
  const parsed = TokenBody.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid token" }, 400);
  const { data: sub } = await sb.from("opportunity_subscriptions").select("*").eq("unsub_token", parsed.data.token).maybeSingle();
  if (!sub) return json({ error: "This subscription link is invalid." }, 404);

  if (action === "manage") return json({ ok: true, subscription: publicSub(sub) });

  if (action === "update") {
    const p = UpdateBody.safeParse(body);
    if (!p.success) return json({ error: p.error.flatten().fieldErrors }, 400);
    await sb.from("opportunity_subscriptions").update(p.data.prefs).eq("id", sub.id);
    return json({ ok: true, message: "Your preferences were updated." });
  }

  if (action === "pause" || action === "resume") {
    if (sub.status === "unsubscribed") return json({ error: "This subscription has ended. Subscribe again to restart it." }, 400);
    await sb.from("opportunity_subscriptions").update({ status: action === "pause" ? "paused" : "active" }).eq("id", sub.id);
    return json({ ok: true, message: action === "pause" ? "Your reports are paused." : "Your reports have resumed." });
  }

  if (action === "unsubscribe") {
    await sb.from("opportunity_subscriptions").update({ status: "unsubscribed" }).eq("id", sub.id);
    return json({ ok: true, message: "You have been unsubscribed from opportunity reports." });
  }

  return json({ error: "Unknown action" }, 400);
});
