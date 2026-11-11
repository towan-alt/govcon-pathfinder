import { MAILING_ADDRESS } from "./training-templates.ts";
import { OPPORTUNITY_SITE_URL as PUBLIC_SITE_URL } from "./opportunity-rules.ts";

/** Shared rendering for personalized opportunity report emails (daily/weekly subscriptions). */
export type ReportOpp = {
  id: string;
  title: string | null;
  organization: string | null;
  full_parent_path_name: string | null;
  solicitation_number: string | null;
  notice_id: string;
  naics_code: string | null;
  type_of_set_aside_description: string | null;
  posted_date: string | null;
  response_deadline: string | null;
  computed_status: string | null;
  ai_score: number | null;
  description_text: string | null;
  description: string | null;
  ui_link: string | null;
};

const esc = (s: string) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
const opportunityUrl = (o: ReportOpp, manageUrl: string) => `${PUBLIC_SITE_URL}/opportunity-reports?t=${encodeURIComponent(new URL(manageUrl).searchParams.get("t") ?? "")}&opportunity=${o.id}`;
const INK = "#231F20", GOLD = "#B79B44", LINE = "#D8D8D5", OFF = "#F4F4F4";

const day = (d: string | null) => {
  if (!d) return "None listed";
  const dt = new Date(d.length === 10 ? d + "T12:00:00Z" : d);
  return isNaN(dt.getTime()) ? "None listed" : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });
};

const STATUS_LABEL: Record<string, string> = { active: "Active", expired: "Expired", inactive: "Inactive", unknown: "Deadline not listed" };

const snippet = (o: ReportOpp) => {
  const src = (o.description_text ?? o.description ?? "").replace(/\s+/g, " ").trim();
  return src.length > 220 ? src.slice(0, 217) + "..." : src;
};

export function renderOpportunityReport(p: {
  frequency: "daily" | "weekly";
  opps: ReportOpp[];
  manageUrl: string;
  unsubUrl: string;
  prefsLine: string;
}) {
  const subject = p.frequency === "daily" ? "New Government Contracting Opportunities for You" : "Your Weekly Government Opportunity Report";
  const rows = p.opps.map((o) => {
    const agency = (o.full_parent_path_name ?? o.organization ?? "").split(".").slice(0, 2).join(" · ");
    const meta = [
      o.solicitation_number ? `Solicitation ${o.solicitation_number} · Notice ${o.notice_id}` : `Notice ${o.notice_id}`,
      o.naics_code ? `NAICS ${o.naics_code}` : null,
      o.type_of_set_aside_description,
    ].filter(Boolean).join(" · ");
    const dates = `Posted ${day(o.posted_date)} · Response due ${day(o.response_deadline)} · ${STATUS_LABEL[o.computed_status ?? ""] ?? "Active"}`;
    const score = o.ai_score != null ? ` · AI fit ${o.ai_score}/10` : "";
    const text = snippet(o);
    return `<tr><td style="padding:14px 0;border-bottom:1px solid ${LINE}">
<a href="${esc(opportunityUrl(o, p.manageUrl))}" style="color:${INK};font-weight:700;text-decoration:underline;font-size:15px">${esc(o.title ?? "Untitled opportunity")}</a><br>
<span style="font-size:12px;color:#555">${esc(agency)}</span><br>
<span style="font-size:12px">${esc(meta)}</span><br>
<span style="font-size:12px">${esc(dates)}${esc(score)}</span>
${text ? `<p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#333">${esc(text)}</p>` : ""}
<p style="margin:10px 0 0"><a href="${esc(opportunityUrl(o, p.manageUrl))}" style="display:inline-block;background:${GOLD};color:${INK};font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px">View Opportunity</a></p>
</td></tr>`;
  }).join("");

  const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Montserrat,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:${INK};padding:20px 28px;border-bottom:4px solid ${GOLD}"><span style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#ffffff">Go<span style="color:${GOLD}">GovCon</span></span></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">
<p style="margin:0 0 16px">${p.opps.length === 1 ? "Here is 1 opportunity" : `Here are ${p.opps.length} opportunities`} matching your preferences (${esc(p.prefsLine)}), prioritized by fit and discovery date.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:16px 0 0;font-size:12px">Source: SAM.gov public contract opportunities. Always confirm details and deadlines on SAM.gov before responding.</p>
<p style="margin:24px 0 0">To your success,<br><strong>Towan Isom</strong><br>Founder, GoGovCon</p></td></tr>
<tr><td style="background:${OFF};padding:18px 28px;font-size:12px;line-height:1.5">You're receiving this ${p.frequency} report because you subscribed to GoGovCon opportunity reports.<br>${esc(MAILING_ADDRESS)}<br>
<a href="${esc(p.manageUrl)}" style="color:${INK}">Manage your subscription</a> · <a href="${esc(p.unsubUrl)}" style="color:${INK}">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`;

  const text = `${subject}\n\n${p.opps.map((o) => `- ${o.title ?? "Untitled"}\nAgency: ${o.full_parent_path_name ?? o.organization ?? "Not listed"}\nNotice: ${o.notice_id} · Solicitation: ${o.solicitation_number ?? "Not listed"}\nNAICS: ${o.naics_code ?? "Not listed"} · Set-aside: ${o.type_of_set_aside_description ?? "Not listed"}\nPosted ${day(o.posted_date)} · Due ${day(o.response_deadline)} · ${STATUS_LABEL[o.computed_status ?? ""] ?? "Unknown"}${o.ai_score != null ? ` · AI fit ${o.ai_score}/10` : ""}\n${snippet(o)}\n${opportunityUrl(o, p.manageUrl)}`).join("\n\n")}\n\nSource: SAM.gov public contract opportunities.\n\nManage your subscription: ${p.manageUrl}\nUnsubscribe: ${p.unsubUrl}\n\n${MAILING_ADDRESS}`;
  return { subject, html, text };
}
