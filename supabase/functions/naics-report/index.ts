import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { EMAIL_FROM } from "../_shared/training-templates.ts";
import { fetchOpps, renderNaicsEmail } from "../_shared/naics.ts";

/** Emails a list of open SAM.gov opportunities for one NAICS code and subscribes the person to the weekly digest. */
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f-]{36}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let id: string | null = null;
  try {
    const b = await req.json().catch(() => ({}));

    if (b.action === "unsubscribe") {
      const token = String(b.token ?? "");
      if (!UUID.test(token)) return json({ ok: false }, 400);
      const { data } = await sb.from("naics_subscriptions").update({ unsubscribed_at: new Date().toISOString() }).eq("unsub_token", token).select("id");
      return json({ ok: (data?.length ?? 0) > 0 });
    }

    const first = String(b.firstName ?? "").trim().slice(0, 80);
    const last = String(b.lastName ?? "").trim().slice(0, 80) || null;
    const email = String(b.email ?? "").trim().toLowerCase().slice(0, 255);
    const naics = String(b.naics ?? "").replace(/\D/g, "");
    if (!first || !EMAIL.test(email)) return json({ error: "Name and a valid email are required." }, 400);
    if (!/^\d{2,6}$/.test(naics)) return json({ error: "Enter a valid NAICS code (2 to 6 digits)." }, 400);
    const origin = /^https?:\/\/[^\s/]+$/.test(String(b.origin ?? "")) ? String(b.origin) : "https://gogovcon.com";
    const scheduleUrl = /^https:\/\//.test(String(b.scheduleUrl ?? "")) ? String(b.scheduleUrl) : `${origin}/readiness-review`;

    const { data: row, error } = await sb.from("naics_reports").insert({ first_name: first, last_name: last, email, naics }).select("id").single();
    if (error) throw error;
    id = row.id;
    // Weekly digest subscription (re-signing up re-activates it).
    const { data: sub } = await sb.from("naics_subscriptions")
      .upsert({ first_name: first, email, naics, unsubscribed_at: null }, { onConflict: "email,naics" })
      .select("unsub_token").single();
    const unsubUrl = sub ? `${origin}/unsubscribe?s=n&t=${sub.unsub_token}` : undefined;

    const done = (status: string, reason: string | null, count?: number) =>
      sb.from("naics_reports").update({ status, status_reason: reason, opportunity_count: count ?? null, sent_at: status === "sent" ? new Date().toISOString() : null }).eq("id", id!);

    const samKey = Deno.env.get("SAM_GOV_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!samKey || !resendKey) {
      await done("skipped", `not configured: ${[!samKey && "SAM_GOV_API_KEY", !resendKey && "RESEND_API_KEY"].filter(Boolean).join(", ")}`);
      return json({ ok: true, queued: false });
    }

    const res = await fetchOpps(samKey, naics, 90);
    if (!res.ok) {
      console.error(`SAM.gov failed [${res.status}]: ${res.text}`);
      await done("failed", `sam ${res.status}: ${res.text}`);
      return json({ error: "We couldn't reach SAM.gov right now. Please try again shortly." }, 502);
    }
    const opps = res.opps;
    const intro = opps.length
      ? `Here are ${opps.length} open federal opportunities posted on SAM.gov in the last 90 days for NAICS ${naics}, soonest deadline first. You'll also get new ones every Monday.`
      : `There are no open SAM.gov opportunities posted in the last 90 days for NAICS ${naics} right now. That's useful to know: it usually means buyers use a related code or a contract vehicle. Let's talk about where your work is actually being bought.`;
    const { html, text } = renderNaicsEmail({ first, intro, opps, scheduleUrl, unsubUrl, footerLine: "You requested this NAICS opportunity report on GoGovCon." });

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": id! },
      body: JSON.stringify({ from: EMAIL_FROM, to: [email], subject: `Open federal opportunities for NAICS ${naics}`, html, text }),
    });
    if (!r.ok) {
      const t = (await r.text()).slice(0, 200);
      console.error(`Resend failed [${r.status}]: ${t}`);
      await done("failed", `resend ${r.status}: ${t}`, opps.length);
      return json({ error: "We couldn't send your report right now. Please try again shortly." }, 502);
    }
    await done("sent", null, opps.length);
    await sb.from("naics_subscriptions").update({ last_sent_at: new Date().toISOString() }).eq("email", email).eq("naics", naics);
    return json({ ok: true, queued: true, count: opps.length });
  } catch (e) {
    console.error("naics-report error:", e instanceof Error ? e.message : String(e));
    if (id) await sb.from("naics_reports").update({ status: "failed", status_reason: "error" }).eq("id", id);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
