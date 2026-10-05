import { MAILING_ADDRESS } from "./training-templates.ts";

/** Shared SAM.gov lookup and email rendering for the instant NAICS report and the weekly digest. */
export type Opp = { title: string; fullParentPathName?: string; postedDate?: string; responseDeadLine?: string | null; type?: string; typeOfSetAsideDescription?: string | null; uiLink?: string; active?: string };

const esc = (s: string) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const INK = "#231F20", GOLD = "#B79B44", LINE = "#D8D8D5", OFF = "#F4F4F4";
export const NAICS_BUTTON = "Schedule with Towan Isom ASAP";
const mdy = (d: Date) => `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;

export async function fetchOpps(samKey: string, naics: string, days: number): Promise<{ ok: true; opps: Opp[] } | { ok: false; status: number; text: string }> {
  const to = new Date(), from = new Date(to.getTime() - days * 86400000);
  const url = new URL("https://api.sam.gov/opportunities/v2/search");
  url.search = new URLSearchParams({ api_key: samKey, ncode: naics, postedFrom: mdy(from), postedTo: mdy(to), limit: "100", offset: "0" }).toString();
  const res = await fetch(url);
  if (!res.ok) return { ok: false, status: res.status, text: (await res.text()).slice(0, 200) };
  const data = await res.json();
  const now = Date.now();
  const opps = ((data.opportunitiesData ?? []) as Opp[])
    .filter((o) => o.active !== "No" && (!o.responseDeadLine || new Date(o.responseDeadLine).getTime() > now))
    .sort((a, b) => (a.responseDeadLine ?? "9").localeCompare(b.responseDeadLine ?? "9"))
    .slice(0, 25);
  return { ok: true, opps };
}

export function renderNaicsEmail(p: { first: string; intro: string; opps: Opp[]; scheduleUrl: string; footerLine: string; unsubUrl?: string; kitUrl?: string }) {
  const rows = p.opps.map((o) => `<tr><td style="padding:12px 0;border-bottom:1px solid ${LINE}">
<a href="${esc(o.uiLink ?? "https://sam.gov")}" style="color:${INK};font-weight:700;text-decoration:underline">${esc(o.title)}</a><br>
<span style="font-size:12px">${esc((o.fullParentPathName ?? "").split(".").slice(0, 2).join(" · "))}</span><br>
<span style="font-size:12px">${esc(o.type ?? "")}${o.typeOfSetAsideDescription ? ` · ${esc(o.typeOfSetAsideDescription)}` : ""} · Posted ${esc(o.postedDate ?? "")}${o.responseDeadLine ? ` · Due ${esc(o.responseDeadLine.slice(0, 10))}` : ""}</span></td></tr>`).join("");
  const btn = `<p style="margin:24px 0"><a href="${esc(p.scheduleUrl)}" style="display:inline-block;background:${GOLD};color:${INK};font-weight:700;text-decoration:none;padding:14px 28px;border-radius:6px">${NAICS_BUTTON}</a></p>`;
  const kit = p.kitUrl
    ? `<tr><td style="padding:0 28px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:${OFF};border-top:3px solid ${GOLD};padding:20px 24px">
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">Ready to get started? Put your business foundation in place with the GovCon Launch Kit.</p>
<a href="${esc(p.kitUrl)}" style="display:inline-block;background:${GOLD};color:${INK};font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px">Get the Launch Kit - $19</a></td></tr></table></td></tr>`
    : "";
  const unsub = p.unsubUrl ? `<br><a href="${esc(p.unsubUrl)}" style="color:${INK}">Stop the weekly report</a>` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Montserrat,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:${INK};padding:20px 28px;border-bottom:4px solid ${GOLD}"><span style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#ffffff">Go<span style="color:${GOLD}">GovCon</span></span></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">
<p style="margin:0 0 16px">Hi ${esc(p.first)},</p><p style="margin:0 0 16px">${esc(p.intro)}</p>${btn}
${p.opps.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>${btn}` : ""}
<p style="margin:16px 0 0;font-size:12px">Source: SAM.gov public contract opportunities. Always confirm details and deadlines on SAM.gov before responding.</p>
<p style="margin:24px 0 0">To your success,<br><strong>Towan Isom</strong><br>Founder, GoGovCon</p></td></tr>
${kit}
<tr><td style="background:${OFF};padding:18px 28px;font-size:12px;line-height:1.5">${esc(p.footerLine)}<br>${esc(MAILING_ADDRESS)}${unsub}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `Hi ${p.first},\n\n${p.intro}\n\n${NAICS_BUTTON}: ${p.scheduleUrl}\n\n${p.opps.map((o) => `- ${o.title}\n  ${o.uiLink ?? ""}${o.responseDeadLine ? `\n  Due ${o.responseDeadLine.slice(0, 10)}` : ""}`).join("\n")}\n\nSource: SAM.gov public contract opportunities.\n\n${p.kitUrl ? `Ready to get started? Put your business foundation in place with the GovCon Launch Kit.\nGet the Launch Kit - $19: ${p.kitUrl}\n\n` : ""}To your success,\nTowan Isom\nFounder, GoGovCon\n\n${MAILING_ADDRESS}${p.unsubUrl ? `\nStop the weekly report: ${p.unsubUrl}` : ""}`;
  return { html, text };
}
