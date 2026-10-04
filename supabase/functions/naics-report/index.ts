import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { EMAIL_FROM, MAILING_ADDRESS } from "../_shared/training-templates.ts";

/** Emails a list of open SAM.gov opportunities for one NAICS code. */
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const esc = (s: string) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const INK = "#231F20", GOLD = "#B79B44", LINE = "#D8D8D5", OFF = "#F4F4F4";
const BUTTON = "Schedule with Towan Isom ASAP";

const mdy = (d: Date) => `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;

type Opp = { title: string; solicitationNumber?: string; fullParentPathName?: string; postedDate?: string; responseDeadLine?: string | null; type?: string; typeOfSetAsideDescription?: string | null; uiLink?: string; active?: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  let id: string | null = null;
  try {
    const b = await req.json().catch(() => ({}));
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
    const done = (status: string, reason: string | null, count?: number) =>
      sb.from("naics_reports").update({ status, status_reason: reason, opportunity_count: count ?? null, sent_at: status === "sent" ? new Date().toISOString() : null }).eq("id", id!);

    const samKey = Deno.env.get("SAM_GOV_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!samKey || !resendKey) {
      await done("skipped", `not configured: ${[!samKey && "SAM_GOV_API_KEY", !resendKey && "RESEND_API_KEY"].filter(Boolean).join(", ")}`);
      return json({ ok: true, queued: false });
    }

    const to = new Date(), from = new Date(to.getTime() - 90 * 86400000);
    const url = new URL("https://api.sam.gov/opportunities/v2/search");
    url.search = new URLSearchParams({ api_key: samKey, ncode: naics, postedFrom: mdy(from), postedTo: mdy(to), limit: "100", offset: "0" }).toString();
    const sres = await fetch(url);
    if (!sres.ok) {
      const t = (await sres.text()).slice(0, 200);
      console.error(`SAM.gov failed [${sres.status}]: ${t}`);
      await done("failed", `sam ${sres.status}: ${t}`);
      return json({ error: "We couldn't reach SAM.gov right now. Please try again shortly." }, 502);
    }
    const sdata = await sres.json();
    const now = Date.now();
    const opps: Opp[] = ((sdata.opportunitiesData ?? []) as Opp[])
      .filter((o) => o.active !== "No" && (!o.responseDeadLine || new Date(o.responseDeadLine).getTime() > now))
      .sort((a, b) => (a.responseDeadLine ?? "9").localeCompare(b.responseDeadLine ?? "9"))
      .slice(0, 25);

    const rows = opps.map((o) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${LINE}">
<a href="${esc(o.uiLink ?? "https://sam.gov")}" style="color:${INK};font-weight:700;text-decoration:underline">${esc(o.title)}</a><br>
<span style="font-size:12px">${esc((o.fullParentPathName ?? "").split(".").slice(0, 2).join(" · "))}</span><br>
<span style="font-size:12px">${esc(o.type ?? "")}${o.typeOfSetAsideDescription ? ` · ${esc(o.typeOfSetAsideDescription)}` : ""} · Posted ${esc(o.postedDate ?? "")}${o.responseDeadLine ? ` · Due ${esc(o.responseDeadLine.slice(0, 10))}` : ""}</span></td></tr>`).join("");
    const intro = opps.length
      ? `Here are ${opps.length} open federal opportunities posted on SAM.gov in the last 90 days for NAICS ${naics}, soonest deadline first.`
      : `There are no open SAM.gov opportunities posted in the last 90 days for NAICS ${naics} right now. That's useful to know: it usually means buyers use a related code or a contract vehicle. Let's talk about where your work is actually being bought.`;
    const btn = `<p style="margin:24px 0"><a href="${esc(scheduleUrl)}" style="display:inline-block;background:${GOLD};color:${INK};font-weight:700;text-decoration:none;padding:14px 28px;border-radius:6px">${BUTTON}</a></p>`;
    const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Montserrat,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:${INK};padding:20px 28px;border-bottom:4px solid ${GOLD}"><span style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#ffffff">Go<span style="color:${GOLD}">GovCon</span></span></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">
<p style="margin:0 0 16px">Hi ${esc(first)},</p><p style="margin:0 0 16px">${esc(intro)}</p>${btn}
${opps.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>${btn}` : ""}
<p style="margin:16px 0 0;font-size:12px">Source: SAM.gov public contract opportunities. Always confirm details and deadlines on SAM.gov before responding.</p>
<p style="margin:24px 0 0">To your success,<br><strong>Towan Isom</strong><br>Founder, GoGovCon</p></td></tr>
<tr><td style="background:${OFF};padding:18px 28px;font-size:12px;line-height:1.5">You requested this NAICS opportunity report on GoGovCon.<br>${esc(MAILING_ADDRESS)}</td></tr>
</table></td></tr></table></body></html>`;
    const text = `Hi ${first},\n\n${intro}\n\n${BUTTON}: ${scheduleUrl}\n\n${opps.map((o) => `- ${o.title}\n  ${o.uiLink ?? ""}${o.responseDeadLine ? `\n  Due ${o.responseDeadLine.slice(0, 10)}` : ""}`).join("\n")}\n\nSource: SAM.gov public contract opportunities.\n\nTo your success,\nTowan Isom\nFounder, GoGovCon\n\n${MAILING_ADDRESS}`;

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
    return json({ ok: true, queued: true, count: opps.length });
  } catch (e) {
    console.error("naics-report error:", e instanceof Error ? e.message : String(e));
    if (id) await sb.from("naics_reports").update({ status: "failed", status_reason: "error" }).eq("id", id);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
