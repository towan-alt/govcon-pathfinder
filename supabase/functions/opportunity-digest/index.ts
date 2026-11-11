import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash, timingSafeEqual } from "node:crypto";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { EMAIL_FROM, PUBLIC_SITE_URL } from "../_shared/training-templates.ts";
import { renderOpportunityReport, type ReportOpp } from "../_shared/opportunity-reports.ts";
import { nextReportAt, reportWindowDays, retryReportAt, unsentOpportunities } from "../_shared/opportunity-rules.ts";
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "Service unavailable" }, 503);
  const sb = createClient(url, key);
  const { data: secret } = await sb.from("opportunity_digest_secret").select("token").eq("id", 1).single();
  const token = /^Bearer ([^\s,]+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  const d = (v: string) => createHash("sha256").update(v, "utf8").digest();
  if (!secret || !token || !timingSafeEqual(d(token), d(secret.token))) return json({ error: "Unauthorized" }, 401);
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return json({ ok: true, skipped: "Email sending service is not configured" });
  const now = new Date(), stamp = now.toISOString();
  const { data: subs, error: subError } = await sb.from("opportunity_subscriptions").select("*").eq("status", "active").not("verified_at", "is", null).lte("next_send_at", stamp).order("next_send_at").limit(40);
  if (subError) return json({ error: subError.message }, 500);
  let sent = 0, empty = 0, failed = 0;
  for (const s of subs ?? []) {
    const { data: lease } = await sb.from("opportunity_subscriptions").update({ lease_until: new Date(now.getTime() + 300000).toISOString() }).eq("id", s.id).eq("status", "active").or(`lease_until.is.null,lease_until.lt.${stamp}`).select("id").maybeSingle();
    if (!lease) continue;
    try {
      let { data: delivery, error: deliveryError } = await sb.from("opportunity_report_sends").select("*").eq("subscription_id", s.id).in("status", ["pending", "failed"]).not("payload", "is", null).order("created_at").limit(1).maybeSingle();
      if (deliveryError) throw deliveryError;
      if (delivery?.retry_at && new Date(delivery.retry_at) > now) continue;
      if (!delivery) {
        const since = new Date(now.getTime() - reportWindowDays(s.frequency) * 86400000).toISOString();
        const { data: prior, error: priorError } = await sb.from("opportunity_report_sends").select("opportunity_ids").eq("subscription_id", s.id).eq("status", "sent");
        if (priorError) throw priorError;
        // Paginate before deduplication so previously sent rows cannot starve fresh matches.
        let opps: ReportOpp[] = [];
        for (let offset = 0; ; offset += 500) {
          let q = sb.from("samgov_opportunities").select("id,title,organization,full_parent_path_name,solicitation_number,notice_id,naics_code,type_of_set_aside_description,posted_date,response_deadline,computed_status,ai_score,description_text,description,ui_link,active,first_seen_at")
            .gte("first_seen_at", since).gt("response_deadline", stamp).or("active.is.null,active.eq.Yes").order("ai_score", { ascending: false, nullsFirst: false }).order("first_seen_at", { ascending: false }).order("id").range(offset, offset + 499);
          if (s.naics_codes.length) q = q.in("naics_code", s.naics_codes);
          if (s.min_ai_score != null) q = q.gte("ai_score", s.min_ai_score);
          const { data: rows, error } = await q;
          if (error) throw error;
          const matches = (rows ?? []).filter((o) => !s.keywords.length || s.keywords.some((k: string) => `${o.title ?? ""} ${o.description_text ?? ""}`.toLowerCase().includes(k.toLowerCase())));
          opps.push(...unsentOpportunities(matches, (prior ?? []).flatMap((p) => p.opportunity_ids)));
          if ((rows?.length ?? 0) < 500) break;
        }
        if (!opps.length) {
          empty++;
          const { error } = await sb.from("opportunity_subscriptions").update({ next_send_at: nextReportAt(s.frequency, now) }).eq("id", s.id);
          if (error) throw error;
          continue;
        }
        const manageUrl = `${PUBLIC_SITE_URL}/opportunity-reports?t=${s.unsub_token}`;
        const prefsLine = [s.naics_codes.length ? `NAICS ${s.naics_codes.join(", ")}` : "all NAICS", s.keywords.length ? `keywords: ${s.keywords.join(", ")}` : null, s.min_ai_score != null ? `AI fit ${s.min_ai_score}+/10` : null].filter(Boolean).join(" · ");
        const payload = renderOpportunityReport({ frequency: s.frequency, opps, manageUrl, unsubUrl: `${manageUrl}&unsubscribe=1`, prefsLine });
        const result = await sb.from("opportunity_report_sends").insert({ subscription_id: s.id, report_type: s.frequency, opportunity_ids: opps.map((o) => o.id), status: "pending", payload }).select("*").single();
        if (result.error || !result.data) throw result.error ?? new Error("Could not create report delivery");
        delivery = result.data;
      }
      const { data: current } = await sb.from("opportunity_subscriptions").select("status,verified_at,email").eq("id", s.id).single();
      if (!current || current.status !== "active" || !current.verified_at || current.email !== s.email) continue;
      const attempts = delivery.attempts + 1;
      // Keep payload and idempotency key unchanged across retries, including ambiguous timeouts.
      const { error: attemptError } = await sb.from("opportunity_report_sends").update({ attempts, retry_at: retryReportAt(attempts, now) }).eq("id", delivery.id);
      if (attemptError) throw attemptError;
      let providerError: string | null = null;
      try {
        const r = await fetch("https://api.resend.com/emails", { method: "POST", signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": delivery.idempotency_key }, body: JSON.stringify({ from: EMAIL_FROM, to: [s.email], ...delivery.payload }) });
        if (!r.ok) providerError = `[${r.status}] ${await r.text()}`;
      } catch (e) { providerError = String(e); }
      if (providerError) {
        failed++;
        console.error("Opportunity report delivery failed", delivery.id, providerError);
        const { error } = await sb.from("opportunity_report_sends").update({ status: "failed", error: providerError, retry_at: retryReportAt(attempts, now) }).eq("id", delivery.id);
        if (error) throw error;
        continue;
      }
      const { error: historyError } = await sb.from("opportunity_report_sends").update({ status: "sent", sent_at: stamp, error: null, retry_at: null }).eq("id", delivery.id);
      if (historyError) throw historyError;
      const { error: sentError } = await sb.from("opportunity_subscriptions").update({ last_sent_at: stamp, next_send_at: nextReportAt(s.frequency, now) }).eq("id", s.id);
      if (sentError) throw sentError;
      sent++;
    } catch (e) { failed++; console.error("Report processing failed", s.id, e); }
    finally { const { error } = await sb.from("opportunity_subscriptions").update({ lease_until: null }).eq("id", s.id); if (error) console.error("Report lease release failed", error.message); }
  }
  return json({ ok: true, due: subs?.length ?? 0, sent, empty, failed });
});
