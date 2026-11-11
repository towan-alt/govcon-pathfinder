import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash, timingSafeEqual } from "node:crypto";
import { EMAIL_FROM, PUBLIC_SITE_URL } from "../_shared/training-templates.ts";
import { renderOpportunityReport, type ReportOpp } from "../_shared/opportunity-reports.ts";

/** Hourly runner: sends daily/weekly personalized opportunity reports to verified subscribers.
 *  Authenticated by the token in public.opportunity_digest_secret (pg_cron passes it as bearer). */
const BATCH = 40;
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: secret } = await sb.from("opportunity_digest_secret").select("token").eq("id", 1).single();
  const token = /^Bearer ([^\s,]+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  const d = (v: string) => createHash("sha256").update(v, "utf8").digest();
  if (!secret || !token || !timingSafeEqual(d(token), d(secret.token))) return json({ error: "Unauthorized" }, 401);

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return json({ ok: true, skipped: "resend not configured" });

  const now = new Date();
  const { data: subs } = await sb.from("opportunity_subscriptions")
    .select("id, email, frequency, naics_codes, keywords, min_ai_score, unsub_token, last_sent_at")
    .eq("status", "active").not("verified_at", "is", null)
    .order("last_sent_at", { ascending: true, nullsFirst: true }).limit(200);

  const due = (subs ?? []).filter((s) => {
    if (!s.last_sent_at) return true;
    const gap = now.getTime() - new Date(s.last_sent_at).getTime();
    return s.frequency === "daily" ? gap >= 23 * 3600000 : gap >= 6.5 * 86400000;
  }).slice(0, BATCH);

  let sent = 0, empty = 0, failed = 0, skipped = 0;
  for (const s of due) {
    const windowDays = s.frequency === "daily" ? 1 : 7;
    const since = new Date(now.getTime() - windowDays * 86400000).toISOString();

    let q = sb.from("samgov_opportunities")
      .select("id, title, organization, full_parent_path_name, solicitation_number, notice_id, naics_code, type_of_set_aside_description, posted_date, response_deadline, computed_status, ai_score, description_text, description, ui_link")
      .eq("computed_status", "active")
      .gte("first_seen_at", since)
      .order("ai_score", { ascending: false, nullsFirst: false })
      .order("response_deadline", { ascending: true, nullsFirst: false })
      .limit(25);
    if (s.naics_codes?.length) q = q.in("naics_code", s.naics_codes);
    if (s.min_ai_score != null) q = q.gte("ai_score", s.min_ai_score);
    if (s.keywords?.length) {
      const safe = s.keywords.map((k: string) => k.replace(/[%,()"]/g, " ").trim()).filter(Boolean);
      if (safe.length) q = q.or(safe.flatMap((k: string) => [`title.ilike.%${k}%`, `description_text.ilike.%${k}%`]).join(","));
    }
    const { data: opps, error } = await q;
    if (error) { failed++; console.error(`query failed for ${s.id}: ${error.message}`); continue; }

    // Exclude opportunities already sent to this subscriber.
    const { data: prior } = await sb.from("opportunity_report_sends").select("opportunity_ids").eq("subscription_id", s.id).eq("status", "sent");
    const alreadySent = new Set((prior ?? []).flatMap((r) => r.opportunity_ids ?? []));
    const fresh = ((opps ?? []) as ReportOpp[]).filter((o) => !alreadySent.has(o.id));

    if (!fresh.length) {
      empty++;
      await sb.from("opportunity_subscriptions").update({ last_sent_at: now.toISOString() }).eq("id", s.id);
      continue;
    }

    const manageUrl = `${PUBLIC_SITE_URL}/opportunity-reports?t=${s.unsub_token}`;
    const prefsLine = [
      s.naics_codes?.length ? `NAICS ${s.naics_codes.join(", ")}` : "all NAICS",
      s.keywords?.length ? `keywords: ${s.keywords.join(", ")}` : null,
      s.min_ai_score != null ? `AI fit ${s.min_ai_score}+/10` : null,
    ].filter(Boolean).join(" · ");
    const { subject, html, text } = renderOpportunityReport({ frequency: s.frequency, opps: fresh, manageUrl, unsubUrl: manageUrl, prefsLine });

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `oppdigest-${s.id}-${now.toISOString().slice(0, 10)}` },
      body: JSON.stringify({ from: EMAIL_FROM, to: [s.email], subject, html, text }),
    });
    if (r.status === 429) { skipped++; break; }
    if (!r.ok) {
      failed++;
      await sb.from("opportunity_report_sends").insert({ subscription_id: s.id, report_type: s.frequency, opportunity_ids: fresh.map((o) => o.id), status: "failed", error: `resend ${r.status}` });
      continue;
    }
    sent++;
    await sb.from("opportunity_report_sends").insert({ subscription_id: s.id, report_type: s.frequency, opportunity_ids: fresh.map((o) => o.id), status: "sent" });
    await sb.from("opportunity_subscriptions").update({ last_sent_at: now.toISOString() }).eq("id", s.id);
  }

  return json({ ok: true, due: due.length, sent, empty, failed, skipped });
});
