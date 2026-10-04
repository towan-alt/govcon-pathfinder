import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { buildSchedule } from "../_shared/training-templates.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const db = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const UUID = /^[0-9a-f-]{36}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    const sb = db();
    const now = new Date();

    switch (b.action) {
      case "register": {
        const firstName = String(b.firstName ?? "").trim().slice(0, 80);
        const email = String(b.email ?? "").trim().toLowerCase().slice(0, 255);
        const phone = String(b.phone ?? "").trim().slice(0, 30) || null;
        const type = b.sessionType;
        if (!firstName || !EMAIL.test(email)) return json({ error: "Name and a valid email are required." }, 400);
        if (!["showing", "live", "instant"].includes(type)) return json({ error: "Invalid session" }, 400);
        let start = type === "instant" ? now : new Date(String(b.sessionStart));
        if (isNaN(start.getTime())) return json({ error: "Invalid session time" }, 400);
        if (start.getTime() < now.getTime() - 10 * 60000 || start.getTime() > now.getTime() + 15 * 86400000) {
          return json({ error: "That session time is no longer available." }, 400);
        }
        if (type === "instant") start = now;
        const origin = /^https?:\/\/[^\s/]+$/.test(String(b.origin ?? "")) ? String(b.origin) : "https://gogovcon.com";
        const sms = Boolean(b.smsConsent) && Boolean(phone);

        const { data: reg, error } = await sb.from("training_registrations").insert({
          first_name: firstName, email, phone, sms_consent: sms, session_type: type,
          session_start: start.toISOString(), site_origin: origin,
          source: String(b.source ?? "").slice(0, 120) || null, device: String(b.device ?? "").slice(0, 20) || null,
        }).select("id").single();
        if (error) throw error;

        const rows = buildSchedule(type, start, now, sms).map((m) => ({ ...m, registration_id: reg.id }));
        if (rows.length) await sb.from("training_messages").insert(rows);
        return json({ id: reg.id });
      }
      case "get": {
        if (!UUID.test(String(b.id))) return json({ error: "Invalid" }, 400);
        const { data } = await sb.from("training_registrations")
          .select("id, first_name, session_type, session_start, attended_at, max_progress_pct, cta_clicked_at")
          .eq("id", b.id).maybeSingle();
        return data ? json(data) : json({ error: "Not found" }, 404);
      }
      case "progress": {
        if (!UUID.test(String(b.id))) return json({ error: "Invalid" }, 400);
        const seconds = Math.max(0, Math.min(Number(b.seconds) || 0, 7200));
        const pct = Math.max(0, Math.min(Math.round(Number(b.pct) || 0), 100));
        const { data } = await sb.from("training_registrations").select("watch_seconds, max_progress_pct, attended_at").eq("id", b.id).maybeSingle();
        if (!data) return json({ error: "Not found" }, 404);
        await sb.from("training_registrations").update({
          watch_seconds: Math.max(data.watch_seconds, Math.round(seconds)),
          max_progress_pct: Math.max(data.max_progress_pct, pct),
          attended_at: data.attended_at ?? now.toISOString(),
        }).eq("id", b.id);
        return json({ ok: true });
      }
      case "cta": {
        if (!UUID.test(String(b.id))) return json({ error: "Invalid" }, 400);
        await sb.from("training_registrations").update({ cta_clicked_at: now.toISOString() }).eq("id", b.id).is("cta_clicked_at", null);
        return json({ ok: true });
      }
      case "assessment":
      case "checkout": {
        const email = String(b.email ?? "").trim().toLowerCase();
        if (!EMAIL.test(email)) return json({ ok: true });
        const patch = b.action === "assessment"
          ? {
            assessment_completed_at: now.toISOString(),
            assessment_score: Math.max(0, Math.min(Number(b.score) || 0, 100)),
            assessment_tier: String(b.tier ?? "").slice(0, 40) || null,
            assessment_gap: String(b.gap ?? "").slice(0, 40) || null,
          }
          : { checkout_started_at: now.toISOString() };
        await sb.from("training_registrations").update(patch).ilike("email", email);
        return json({ ok: true });
      }
      case "unsubscribe": {
        if (!UUID.test(String(b.token))) return json({ error: "Invalid link" }, 400);
        const { data } = await sb.from("training_registrations").update({ unsubscribed_at: now.toISOString() })
          .eq("unsub_token", b.token).select("email").maybeSingle();
        if (!data) return json({ error: "Invalid link" }, 404);
        await sb.from("training_registrations").update({ unsubscribed_at: now.toISOString() }).ilike("email", data.email).is("unsubscribed_at", null);
        return json({ ok: true });
      }
      case "stats": {
        // Aggregate counts only, no personal data.
        const days = [7, 30, 90, 365].includes(Number(b.days)) ? Number(b.days) : 30;
        const since = new Date(now.getTime() - days * 86400000).toISOString();
        const { data: regs } = await sb.from("training_registrations")
          .select("session_type, attended_at, max_progress_pct, cta_clicked_at, assessment_completed_at, checkout_started_at, purchased_at")
          .gte("created_at", since).limit(10000);
        const types = ["showing", "live", "instant"] as const;
        const empty = () => ({ registered: 0, attended: 0, watched50: 0, cta: 0, assessment: 0, checkout: 0, purchased: 0 });
        const byType: Record<string, ReturnType<typeof empty>> = { all: empty() };
        types.forEach((t) => (byType[t] = empty()));
        for (const r of regs ?? []) {
          for (const k of ["all", r.session_type]) {
            const c = byType[k];
            if (!c) continue;
            c.registered++;
            if (r.attended_at) c.attended++;
            if (r.max_progress_pct >= 50) c.watched50++;
            if (r.cta_clicked_at) c.cta++;
            if (r.assessment_completed_at) c.assessment++;
            if (r.checkout_started_at) c.checkout++;
            if (r.purchased_at) c.purchased++;
          }
        }
        const { data: msgs } = await sb.from("training_messages")
          .select("template_key, sent_template, channel, status").eq("sequence", "training").gte("created_at", since).neq("status", "queued").limit(20000);
        const messages: Record<string, { sent: number; skipped: number; failed: number }> = {};
        for (const m of msgs ?? []) {
          const k = `${m.sent_template ?? m.template_key} (${m.channel})`;
          messages[k] ??= { sent: 0, skipped: 0, failed: 0 };
          messages[k][m.status as "sent" | "skipped" | "failed"]++;
        }
        return json({ byType, messages });
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("training error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
