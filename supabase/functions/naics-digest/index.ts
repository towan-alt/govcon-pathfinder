import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash, timingSafeEqual } from "node:crypto";
import { EMAIL_FROM } from "../_shared/training-templates.ts";
import { fetchOpps, renderNaicsEmail } from "../_shared/naics.ts";

/** Weekly NAICS digest: new open SAM.gov notices from the last 7 days for each active subscriber. Runs from pg_cron. */
const BATCH = 40;
const SITE = "https://gogovcon.com";

function auth(req: Request): Response | null {
  const secret = Deno.env.get("TRAINING_CRON_SECRET");
  if (!secret) return new Response("Server configuration error", { status: 500 });
  const token = /^Bearer ([^\s,]+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  if (!token) return new Response("Unauthorized", { status: 401 });
  const d = (v: string) => createHash("sha256").update(v, "utf8").digest();
  return timingSafeEqual(d(token), d(secret)) ? null : new Response("Unauthorized", { status: 401 });
}
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  const denied = auth(req);
  if (denied) return denied;
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const samKey = Deno.env.get("SAM_GOV_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!samKey || !resendKey) return json({ ok: true, skipped: "not configured" });

  const now = new Date();
  // Single-flight lease.
  const { data: lock } = await sb.from("naics_digest_state")
    .update({ locked_until: new Date(now.getTime() + 10 * 60000).toISOString(), last_run_at: now.toISOString() })
    .eq("id", 1).or(`locked_until.is.null,locked_until.lt.${now.toISOString()}`).select("paused_reason").maybeSingle();
  if (!lock) return json({ ok: true, skipped: "locked" });
  const release = (paused_reason: string | null = lock.paused_reason) =>
    sb.from("naics_digest_state").update({ locked_until: null, paused_reason }).eq("id", 1);

  const probe = !!lock.paused_reason; // paused on credits/permissions: try one item only
  const cutoff = new Date(now.getTime() - 6 * 86400000).toISOString();
  const { data: subs } = await sb.from("naics_subscriptions").select("id, first_name, email, naics, unsub_token, send_count")
    .is("unsubscribed_at", null).or(`last_sent_at.is.null,last_sent_at.lt.${cutoff}`)
    .order("last_sent_at", { ascending: true, nullsFirst: true }).limit(probe ? 1 : BATCH);

  let sent = 0, empty = 0, failed = 0;
  const cache = new Map<string, Awaited<ReturnType<typeof fetchOpps>>>();
  for (const s of subs ?? []) {
    let res = cache.get(s.naics);
    if (!res) { res = await fetchOpps(samKey, s.naics, 7); cache.set(s.naics, res); }
    if (!res.ok) {
      console.error(`SAM.gov failed [${res.status}] for ${s.naics}: ${res.text}`);
      if (res.status === 429) break; // rate limited: resume next week's run / next invocation
      failed++;
      await sb.from("naics_subscriptions").update({ last_status: `sam ${res.status}` }).eq("id", s.id);
      continue;
    }
    const stamp = { last_sent_at: now.toISOString() };
    if (!res.opps.length) { empty++; await sb.from("naics_subscriptions").update({ ...stamp, last_status: "no new" }).eq("id", s.id); continue; }
    const intro = `Here ${res.opps.length === 1 ? "is 1 new open federal opportunity" : `are ${res.opps.length} new open federal opportunities`} posted on SAM.gov this week for NAICS ${s.naics}, soonest deadline first.`;
    const { html, text } = renderNaicsEmail({
      first: s.first_name, intro, opps: res.opps, scheduleUrl: `${SITE}/readiness-review`,
      unsubUrl: `${SITE}/unsubscribe?s=n&t=${s.unsub_token}`,
      footerLine: "You're receiving this weekly report because you requested a NAICS opportunity report on GoGovCon.",
    });
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `digest-${s.id}-${now.toISOString().slice(0, 10)}` },
      body: JSON.stringify({ from: EMAIL_FROM, to: [s.email], subject: `This week's federal opportunities for NAICS ${s.naics}`, html, text }),
    });
    if (r.status === 402 || r.status === 403) { await release(`resend ${r.status}`); return json({ ok: false, paused: true, sent }); }
    if (r.status === 429) break;
    if (!r.ok) { failed++; await sb.from("naics_subscriptions").update({ last_status: `resend ${r.status}` }).eq("id", s.id); continue; }
    sent++;
    await sb.from("naics_subscriptions").update({ ...stamp, last_status: "sent", send_count: s.send_count + 1 }).eq("id", s.id);
  }
  await release(probe && sent > 0 ? null : lock.paused_reason);

  return json({ ok: true, sent, empty, failed, batch: subs?.length ?? 0 });
});
