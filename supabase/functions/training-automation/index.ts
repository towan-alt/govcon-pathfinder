import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash, timingSafeEqual } from "node:crypto";
import { authenticateCronRequest } from "../_shared/cron-auth.ts";

/** Same pattern as _shared/cron-auth.ts; uses the managed cron secret when present, else TRAINING_CRON_SECRET. */
function authenticate(req: Request): Response | null {
  if (Deno.env.get("LOVABLE_CRON_SECRET")) {
    const managed = authenticateCronRequest(req);
    if (!managed) return null;
  }
  const secret = Deno.env.get("TRAINING_CRON_SECRET");
  if (!secret) return new Response("Server configuration error", { status: 500 });
  const token = /^Bearer ([^\s,]+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  if (!token) return new Response("Unauthorized", { status: 401 });
  const d = (v: string) => createHash("sha256").update(v, "utf8").digest();
  return timingSafeEqual(d(token), d(secret)) ? null : new Response("Unauthorized", { status: 401 });
}
import { EMAIL_FROM, emailFor, renderEmail, smsFor, type Ctx } from "../_shared/training-templates.ts";

const TZ = "America/New_York";

function label(d: Date) {
  const day = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" }).format(d);
  const t = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);
  return `${day} at ${t} ET`;
}

function e164(phone: string | null): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return phone.trim().startsWith("+") && d.length >= 10 ? `+${d}` : null;
}

type Reg = {
  id: string; first_name: string; email: string; phone: string | null; sms_consent: boolean; session_type: string;
  session_start: string; attended_at: string | null; max_progress_pct: number; assessment_completed_at: string | null;
  assessment_score: number | null; assessment_tier: string | null; assessment_gap: string | null;
  purchased_at: string | null; unsubscribed_at: string | null; unsub_token: string; site_origin: string | null;
};

/** Resolve a scheduled key into the concrete template to send, or a skip reason. */
function resolve(key: string, r: Reg, now: number): { template?: string; skip?: string } {
  if (r.purchased_at) return { skip: "purchased" };
  if (r.unsubscribed_at) return { skip: "unsubscribed" };
  const start = new Date(r.session_start).getTime();
  switch (key) {
    case "reminder_24h": case "reminder_1h": case "starting_15m":
      if (now > start) return { skip: "session started" };
      return { template: key };
    case "live_now":
      if (r.attended_at) return { skip: "already attended" };
      if (now > start + 30 * 60000) return { skip: "stale" };
      return { template: key };
    case "post_session":
      if (!r.attended_at) return { template: "post_noshow" };
      return { template: r.max_progress_pct >= 50 ? "post_attended_high" : "post_attended_low" };
    case "day1":
      return { template: r.assessment_completed_at ? "day1_tier" : "day1_score" };
    case "day2_replay_expiring":
      if (r.max_progress_pct >= 95) return { skip: "finished video" };
      return { template: key };
    default:
      return { template: key };
  }
}

Deno.serve(async (req) => {
  const denied = authenticate(req);
  if (denied) return denied;

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const twSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twFrom = Deno.env.get("TWILIO_FROM_NUMBER");
  const now = Date.now();

  const { data: due, error } = await sb.from("training_messages")
    .select("id, channel, template_key, send_at, registration_id, training_registrations(*)")
    .eq("status", "queued").lte("send_at", new Date(now).toISOString()).order("send_at").limit(100);
  if (error) return new Response(error.message, { status: 500 });

  // Track whether a registration already got an SMS so STOP language goes on the first one.
  let sent = 0, skipped = 0, failed = 0;
  for (const m of due ?? []) {
    const r = m.training_registrations as unknown as Reg;
    const finish = async (status: string, reason: string | null, template?: string) => {
      await sb.from("training_messages").update({ status, status_reason: reason, sent_template: template ?? null, processed_at: new Date().toISOString() }).eq("id", m.id);
      if (status === "sent") sent++; else if (status === "skipped") skipped++; else failed++;
    };
    if (!r) { await finish("skipped", "registration missing"); continue; }
    // Any purchase under this email stops the sequence.
    if (!r.purchased_at) {
      const { data: p } = await sb.from("training_registrations").select("id").ilike("email", r.email).not("purchased_at", "is", null).limit(1);
      if (p?.length) r.purchased_at = new Date().toISOString();
    }
    const { template, skip } = resolve(m.template_key, r, now);
    if (skip || !template) { await finish("skipped", skip ?? "no template"); continue; }

    const origin = r.site_origin ?? "https://gogovcon.com";
    const ctx: Ctx = {
      firstName: r.first_name,
      sessionLabel: r.session_type === "instant" ? "right now (instant access)" : label(new Date(r.session_start)),
      watchUrl: `${origin}/training/watch?r=${r.id}`,
      assessmentUrl: `${origin}/assessment`,
      reviewUrl: `${origin}/readiness-review`,
      pickUrl: `${origin}/training#register`,
      tier: r.assessment_tier, gap: r.assessment_gap, score: r.assessment_score,
    };

    try {
      if (m.channel === "email") {
        if (!resendKey) { await finish("skipped", "not configured", template); continue; }
        const e = emailFor(template, ctx);
        if (!e) { await finish("skipped", "no template", template); continue; }
        const unsub = `${origin}/unsubscribe?t=${r.unsub_token}`;
        const { html, text } = renderEmail(e, unsub);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": m.id },
          body: JSON.stringify({ from: EMAIL_FROM, to: [r.email], subject: e.subject, html, text, headers: { "List-Unsubscribe": `<${unsub}>` } }),
        });
        if (!res.ok) { await finish("failed", `resend ${res.status}: ${(await res.text()).slice(0, 200)}`, template); continue; }
        await finish("sent", null, template);
      } else {
        if (!r.sms_consent) { await finish("skipped", "no sms consent", template); continue; }
        if (!twSid || !twToken || !twFrom) { await finish("skipped", "not configured", template); continue; }
        const to = e164(r.phone);
        if (!to) { await finish("skipped", "invalid phone", template); continue; }
        let body = smsFor(template, ctx);
        if (!body) { await finish("skipped", "no template", template); continue; }
        const { count } = await sb.from("training_messages").select("id", { count: "exact", head: true })
          .eq("registration_id", r.id).eq("channel", "sms").eq("status", "sent");
        if (!count && !/STOP/.test(body)) body = `${body} Reply STOP to opt out`;
        if (body.length > 160) body = body.slice(0, 160);
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twSid}/Messages.json`, {
          method: "POST",
          headers: { Authorization: `Basic ${btoa(`${twSid}:${twToken}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ From: twFrom, To: to, Body: body }),
        });
        if (!res.ok) { await finish("failed", `twilio ${res.status}: ${(await res.text()).slice(0, 200)}`, template); continue; }
        await finish("sent", null, template);
      }
    } catch (e) {
      await finish("failed", e instanceof Error ? e.message.slice(0, 200) : "error", template);
    }
  }
  return new Response(JSON.stringify({ processed: due?.length ?? 0, sent, skipped, failed }), { headers: { "Content-Type": "application/json" } });
});
