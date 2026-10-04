import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  buildAssessmentSchedule, CONSENT_TEXT, CONSENT_VERSION, GAP_SECTION, PILLAR_ACTIONS, PILLAR_NAMES, PILLAR_ORDER, PILLAR_SUB,
  REPORT_OFFER, statusFor, TIER_PARAGRAPH, type PillarKey,
} from "../_shared/assessment-templates.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIERS = ["Foundation", "Positioning", "Bid Ready"];
const str = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const now = new Date();

    switch (b.action) {
      case "submit": {
        const first_name = str(b.firstName, 80), last_name = str(b.lastName, 80) || null;
        const email = str(b.email, 255).toLowerCase();
        const phone = str(b.phone, 30) || null;
        if (!first_name || !EMAIL.test(email)) return json({ error: "Name and a valid email are required." }, 400);
        const score = Math.max(0, Math.min(Math.round(Number(b.score) || 0), 100));
        const tier = TIERS.includes(b.tier) ? b.tier : null;
        const gap = PILLAR_ORDER.includes(b.gap) ? (b.gap as PillarKey) : null;
        if (!tier || !gap) return json({ error: "Invalid result" }, 400);
        const pillars: Record<string, number> = {};
        for (const k of PILLAR_ORDER) pillars[k] = Math.max(0, Math.min(Math.round(Number(b.pillars?.[k]) || 0), 100));
        const answers = (Array.isArray(b.answers) ? b.answers : []).slice(0, 20)
          .map((a: { question?: unknown; answer?: unknown }) => ({ question: str(a?.question, 200), answer: str(a?.answer, 200) }));
        const origin = /^https?:\/\/[^\s/]+$/.test(String(b.origin ?? "")) ? String(b.origin) : "https://gogovcon.com";
        const sms = Boolean(phone);

        // Permanent consent log.
        await sb.from("consent_log").insert({
          email, phone, email_consent: true, sms_consent: sms, consent_text: CONSENT_TEXT, consent_version: CONSENT_VERSION,
          consent_at: now.toISOString(), page_url: str(b.pageUrl, 500) || null,
          user_agent: str(req.headers.get("user-agent"), 500) || null,
          ip: (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("cf-connecting-ip") || null,
        });

        const { data: row, error } = await sb.from("assessment_results").insert({
          first_name, last_name, email, phone, sms_consent: sms, score, tier, pillars, gap, answers, site_origin: origin,
        }).select("id, report_token").single();
        if (error) throw error;

        // Retake: send the new report only; the existing sequence keeps going with the newest result.
        const { count } = await sb.from("training_messages").select("id", { count: "exact", head: true })
          .eq("sequence", "assessment").eq("assessment_email", email);
        const sched = buildAssessmentSchedule(now, sms).filter((m) => !count || m.template_key === "e0");
        await sb.from("training_messages").insert(sched.map((m) => ({ ...m, sequence: "assessment", assessment_email: email })));
        return json({ token: row.report_token });
      }
      case "report": {
        const t = str(b.token, 100);
        if (!/^[0-9a-f]{48}$/.test(t)) return json({ error: "Invalid" }, 404);
        const { data } = await sb.from("assessment_results")
          .select("id, first_name, last_name, score, tier, pillars, gap, answers, created_at, report_views").eq("report_token", t).maybeSingle();
        if (!data) return json({ error: "Not found" }, 404);
        await sb.from("assessment_results").update({ report_views: data.report_views + 1 }).eq("id", data.id);
        const gap = data.gap as PillarKey;
        const pillars = data.pillars as Record<PillarKey, number>;
        return json({
          first_name: data.first_name, score: data.score, tier: data.tier, gap, gapName: PILLAR_NAMES[gap],
          created_at: data.created_at, answers: data.answers,
          tierParagraph: TIER_PARAGRAPH[data.tier] ?? "",
          pillars: PILLAR_ORDER.map((k) => {
            const v = pillars[k] ?? 0; const st = statusFor(v);
            return { key: k, name: PILLAR_NAMES[k], sub: PILLAR_SUB[k], score: v, status: st, action: PILLAR_ACTIONS[k][st], isGap: k === gap };
          }),
          gapSection: GAP_SECTION[gap], offer: REPORT_OFFER,
        });
      }
      case "unsubscribe": {
        const t = str(b.token, 60);
        if (!/^[0-9a-f-]{36}$/i.test(t)) return json({ error: "Invalid link" }, 400);
        const { data } = await sb.from("assessment_results").select("email").eq("unsub_token", t).maybeSingle();
        if (!data) return json({ error: "Invalid link" }, 404);
        await sb.from("assessment_results").update({ unsubscribed_at: now.toISOString() }).ilike("email", data.email).is("unsubscribed_at", null);
        await sb.from("training_registrations").update({ unsubscribed_at: now.toISOString() }).ilike("email", data.email).is("unsubscribed_at", null);
        return json({ ok: true });
      }
      case "stats": {
        const days = [7, 30, 90, 365].includes(Number(b.days)) ? Number(b.days) : 30;
        const since = new Date(now.getTime() - days * 86400000).toISOString();
        const { data: msgs } = await sb.from("training_messages").select("template_key, channel, status")
          .eq("sequence", "assessment").gte("created_at", since).neq("status", "queued").limit(20000);
        const messages: Record<string, { sent: number; skipped: number; failed: number }> = {};
        for (const m of msgs ?? []) {
          const k = `${m.template_key} (${m.channel})`;
          messages[k] ??= { sent: 0, skipped: 0, failed: 0 };
          messages[k][m.status as "sent" | "skipped" | "failed"]++;
        }
        const { data: res } = await sb.from("assessment_results").select("email, report_views, purchased_at").gte("created_at", since).limit(10000);
        const views = (res ?? []).reduce((s, r) => s + r.report_views, 0);
        const purchased = new Set((res ?? []).filter((r) => r.purchased_at).map((r) => r.email.toLowerCase())).size;
        return json({ messages, reportViews: views, results: res?.length ?? 0, purchased });
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error("assessment error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
