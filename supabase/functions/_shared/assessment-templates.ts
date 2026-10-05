/**
 * All GoGovCon Readiness Assessment follow-up copy lives here (approved copy, edit with care).
 * Each email: subject, preheader, paragraphs, button. Texts stay under 160 characters.
 */
import { LOGO_URL, MAILING_ADDRESS } from "./training-templates.ts";

export const CONSENT_VERSION = "assessment-v1";
export const CONSENT_TEXT =
  'By clicking "Show My Result," you agree to receive your Readiness Report and follow-up emails from GoGovCon. If you provide a mobile number, you also agree to receive recurring automated marketing text messages from GoGovCon at that number. Consent to texts is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. You can unsubscribe from emails at any time using the link in every email. See our Privacy Policy and Terms.';
export const SMS_HELP_REPLY =
  "GoGovCon: Help at hello@gogovcon.com. Msg frequency varies. Msg & data rates may apply. Reply STOP to opt out.";
export const FOOTER_REASON =
  "You're receiving this because you completed the GoGovCon Readiness Assessment and agreed to receive emails.";

export type PillarKey = "registered" | "certified" | "positioned" | "pipeline" | "proposal";
export const PILLAR_ORDER: PillarKey[] = ["registered", "certified", "positioned", "pipeline", "proposal"];
export const PILLAR_NAMES: Record<PillarKey, string> = {
  registered: "Registered", certified: "Certified", positioned: "Positioned", pipeline: "Pipeline", proposal: "Proposal",
};
export const PILLAR_SUB: Record<PillarKey, string> = {
  registered: "SAM.gov, UEI, NAICS codes, size standards",
  certified: "set-aside certifications and your capability statement",
  positioned: "target agencies and past performance",
  pipeline: "forecasts, opportunity alerts, buyer relationships",
  proposal: "bid history, process, delivery capacity",
};

export type Status = "Strong" | "Building" | "Gap";
export const statusFor = (n: number): Status => (n >= 67 ? "Strong" : n >= 34 ? "Building" : "Gap");

export const PILLAR_ACTIONS: Record<PillarKey, Record<Status, string>> = {
  registered: {
    Gap: "Start or renew your SAM.gov registration now. It's free, it can take several weeks to activate, and nothing else works without it. Then choose the one NAICS code that best matches what you actually sell.",
    Building: "Confirm your SAM.gov record is active and your codes are complete. Add two to four secondary NAICS codes and confirm you're under the size standard for each.",
    Strong: "Your registration is in order. Set a reminder 60 days before your SAM.gov expiration date so a lapse never costs you an award.",
  },
  certified: {
    Gap: "Find out which set-asides you qualify for (8(a), WOSB, HUBZone, SDVOSB, and your state and local programs) and write a one-page capability statement. Those two documents decide whether an agency looks closer.",
    Building: "Finish the certification you've started, and rewrite your capability statement for one specific agency instead of for everyone.",
    Strong: "Make your certification impossible to miss: lead with it on your capability statement, your website, your SAM.gov record and your SBA Small Business Search profile.",
  },
  positioned: {
    Gap: "Choose three to five agencies that already buy what you sell. Look them up on USASpending.gov and note who they bought from last year. That short list becomes your focus.",
    Building: "Turn your agency list into a researched one: buying history, the small business office contact, and upcoming forecasts for each agency.",
    Strong: "Write one short past performance story for each target agency, with results that match that agency's mission.",
  },
  pipeline: {
    Gap: "Set up saved searches on SAM.gov for your NAICS codes and review them every week. Then sign up for your target agencies' procurement forecasts.",
    Building: "Book one conversation a month with an agency small business specialist or a prime contractor in your space, and follow up within 48 hours.",
    Strong: "Respond to sources sought notices and requests for information. That's how you help shape requirements before the solicitation is posted.",
  },
  proposal: {
    Gap: "Start small. Micro-purchases and simplified acquisitions are the fastest path to a first award. Build a proposal template you can reuse every time.",
    Building: "Make bid/no-bid a habit. Pursue only opportunities where you meet every requirement and know the buyer, and track your win rate.",
    Strong: "Line up teaming partners and subcontractors now, so you can bid on larger work and deliver it without strain.",
  },
};

export const TIER_PARAGRAPH: Record<string, string> = {
  Foundation: "Build the foundation before you bid. Your registration, codes and positioning aren't fully in place yet. Bidding now would spend your time on opportunities you can't win. The fastest path forward is getting the basics right, in the right order.",
  Positioning: "You're registered. Now get found and get competitive. The fundamentals are in place, but agencies and prime contractors aren't finding you consistently yet. What separates you from your first award is focus, relationships and a steady weekly routine.",
  "Bid Ready": "You're ready to pursue real opportunities with a plan. You have registration, positioning and delivery capacity. The gap now is a targeting and capture plan built for your business, so every bid you submit is one you can win.",
};

export const GAP_SECTION: Record<PillarKey, { intro: string; moves: [string, string, string] }> = {
  registered: {
    intro: "Until your SAM.gov record and NAICS codes are complete and accurate, buyers searching for what you sell won't find you. Fixing this first makes every other step count.",
    moves: ["Log in to SAM.gov and check your registration status and expiration date.", "Choose your primary NAICS code and confirm you're under its size standard.", "Make sure your legal business name and address match your IRS records exactly. A mismatch is one of the most common reasons registrations stall."],
  },
  certified: {
    intro: "The set-asides you qualify for and a tailored capability statement are how agencies decide to look closer. Right now that advantage is sitting on the table.",
    moves: ["Check your eligibility for 8(a), WOSB and HUBZone in SBA's certification portal (MySBA Certifications).", "Look up your state and local certification programs. They're often faster and open doors with local agencies.", "Draft a one-page capability statement: core competencies, differentiators, past performance, NAICS codes and contact information."],
  },
  positioned: {
    intro: "Without a short list of target agencies and a clear story about your past work, you're competing against everyone for everything. Focus is what moves you forward.",
    moves: ["Search USASpending.gov by your NAICS code to see which agencies spend the most on what you sell.", "Narrow that list to three to five agencies whose mission fits your work.", "Find each agency's Office of Small and Disadvantaged Business Utilization (OSDBU) and note the contact."],
  },
  pipeline: {
    intro: "Contracts are shaped long before the solicitation posts, and right now you're not in those early conversations. A weekly routine and real relationships change that.",
    moves: ["Create saved searches on SAM.gov for your codes and your target agencies.", "Download the procurement forecasts for your target agencies.", "Request one introductory meeting with an agency small business specialist this month."],
  },
  proposal: {
    intro: "Winning means bidding consistently and proving you can deliver. A repeatable bid process and a delivery plan are what turn opportunities into awards.",
    moves: ["List the last three opportunities you saw and score each one: do you meet every requirement?", "Build a reusable proposal template with your company information, past performance and management approach.", "Identify one prime contractor to approach about subcontracting."],
  },
};

export const REPORT_OFFER = {
  heading: "Your Next Step: The Readiness Review",
  intro: "You can work through this report on your own. If you want to move faster, the Readiness Review turns your score into a written plan built for your business.",
  items: [
    "The GovCon Starter Kit, delivered the moment you book",
    "A review of your assessment, SAM.gov record and website before we meet",
    "A 60-minute one-on-one strategy session with me",
    "Your Top 5 Target Agency List",
    "A written 90-Day Federal Action Plan, delivered within 48 hours",
    "The session recording",
  ],
  credit: "The $497 is credited toward any GoGovCon program you join within 14 days of your session.",
  button: "Book My Readiness Review",
};

export type Ctx = {
  first_name: string; score: number; tier: string; gap: PillarKey;
  report_url: string; review_url: string; training_url: string;
};

/** Paragraph item: plain string, a bullet list, or a numbered list. */
export type Block = string | { ul: string[] } | { ol: string[] };
export type Email = { subject: string; preheader: string; body: Block[]; button: { label: string; url: string }; signoff: string };

const SIGN = "To your success,\nTowan Isom";

const E1_GAP: Record<PillarKey, string> = {
  registered: "I've watched talented business owners spend months on capability statements and networking while their SAM.gov registration sat expired. When that happens, an agency can't award to you, however good the conversation was. Registration isn't paperwork you finish once. It's the front door, and it has to stay open. Check your status today, confirm your NAICS codes, and set a renewal reminder. That's about an hour of work that protects every other effort you make.",
  certified: "Set-aside contracts are reserved for businesses like yours, but only if you're certified and only if buyers can see it. A strong capability statement does the rest of the talking. When a contracting officer has two minutes to decide who gets a closer look, your certification and a one-page statement written for their agency are what earn the call. Generic statements get skimmed. Tailored ones get remembered.",
  positioned: "The most common mistake I see is trying to sell to the entire federal government. It feels like more opportunity. In practice it means you're a stranger everywhere. Pick three to five agencies that already buy what you sell, learn their mission and their buying history, and show up as the answer to their specific problems. Focus is what makes a small business look like the obvious choice.",
  pipeline: "By the time a solicitation appears on SAM.gov, the agency has usually spent months defining what it needs, and someone has been part of those conversations. Your job is to be that someone. A weekly routine of saved searches, forecast reviews and one real conversation a month puts you in the room early, where requirements are still being shaped.",
  proposal: "Bidding is a skill, and skills come from repetition. The businesses that win aren't always the biggest. They're the ones with a repeatable process: a clear bid/no-bid decision, a reusable template and a delivery plan the agency can trust. Start with smaller awards, track your win rate, and let each proposal make the next one faster.",
};

const E2_TIER: Record<string, { subject: string; preheader: string; body: string[] }> = {
  Foundation: {
    subject: "Why starting right beats starting fast",
    preheader: "The order you do this in matters.",
    body: [
      "Your score puts you in the Foundation stage. I want you to hear this clearly: that's a good place to start.",
      "The businesses that struggle most in federal contracting usually didn't start too late. They started out of order. They bid before they were registered correctly, chased agencies that don't buy what they sell, or wrote proposals without the past performance to back them up. Each misstep costs months.",
      "Over 30 years and 74+ federal contracts across 76+ agencies, I've learned that the order of operations matters as much as the effort: registered, certified, positioned, pipeline, proposal. Get the first three right, and the last two get much easier.",
      "A Readiness Review gives you that order in writing, built around your business, so you're not guessing at what comes next.",
    ],
  },
  Positioning: {
    subject: "Registered but invisible? Here's why",
    preheader: "Being eligible isn't the same as being found.",
    body: [
      "Your score puts you in the Positioning stage. You've done real work: your registration and basics are in place. So why isn't the phone ringing?",
      "Because eligibility isn't visibility. Thousands of registered small businesses share your NAICS codes. Agencies award to the ones they already know, trust and can picture delivering. That comes from focus on a few agencies, a capability statement written for each one, and relationships built before the solicitation drops.",
      "This is the stage where most businesses stall for years. It's also the stage where the right plan makes the biggest difference, fastest.",
      "In a Readiness Review we build your Top 5 Target Agency List together, with the small business contacts and buying patterns for each, so you know exactly where to show up.",
    ],
  },
  "Bid Ready": {
    subject: "You're bidding. Are you winning?",
    preheader: "Win rate is the number that matters now.",
    body: [
      "Your score puts you in the Bid Ready stage. You're registered, positioned and capable of delivering. That puts you ahead of most small businesses in the federal market.",
      "At this stage, the question changes. It's no longer whether you can compete. It's whether you're winning at the rate you should be. The answer usually comes down to three things: choosing the right opportunities, being known to the buyer before the solicitation posts, and submitting proposals that make the evaluator's job easy.",
      "That's the work I've done for 30 years. A Readiness Review focuses on your win rate: your targeting, your bid/no-bid discipline and your next three pursuits.",
    ],
  },
};

/** E1 to E5. E0 (the report) is rendered by renderReport. */
export function emailFor(key: string, c: Ctx): Email | null {
  const hi = `Hi ${c.first_name || "there"},`;
  const gap = PILLAR_NAMES[c.gap];
  switch (key) {
    case "e1":
      return {
        subject: `The ${gap} gap: what I'd fix first`,
        preheader: "One change that makes everything else work.",
        body: [hi, `Yesterday your Readiness Report flagged ${gap} as your biggest gap. I want to explain why that one matters more than the others.`, E1_GAP[c.gap],
          `If you'd like help closing this gap with a plan built for your business, that's exactly what a Readiness Review is for. In 60 minutes we start with your ${gap} gap and leave with your Top 5 Target Agency List, and I deliver your written 90-Day Federal Action Plan within 48 hours.`],
        button: { label: "See the Readiness Review", url: c.review_url }, signoff: SIGN,
      };
    case "e2": {
      const t = E2_TIER[c.tier] ?? E2_TIER.Foundation;
      return { subject: t.subject, preheader: t.preheader, body: [hi, ...t.body], button: { label: "See the Readiness Review", url: c.review_url }, signoff: SIGN };
    }
    case "e3":
      return {
        subject: "Is a Readiness Review worth $497?",
        preheader: "What you get, what it costs, and how the credit works.",
        body: [hi, "It's a fair question, so here's a straight answer.", "What you get:",
          { ul: [
            "The GovCon Starter Kit the moment you book: capability statement template, SAM.gov checklist, NAICS and size standard guide, target agency worksheet and opportunity tracker",
            "A review of your assessment, SAM.gov record and website before we meet",
            `A 60-minute one-on-one session focused on your ${gap} gap and your 12-month goal`,
            "Your Top 5 Target Agency List",
            "A written 90-Day Federal Action Plan, delivered within 48 hours",
            "The recording, so you can revisit every recommendation",
          ] },
          "How the credit works: if you decide to go further with any GoGovCon program within 14 days of your session, the full $497 is credited toward it.",
          "\"APEX Accelerators offer free counseling. Why pay?\" APEX Accelerators are a valuable free resource, and you should use yours. The Readiness Review is different: a working session with someone who has bid on and won federal work for 30 years, and deliverables you keep and act on.",
          "What it isn't: a sales call. It's a working session that ends with your plan."],
        button: { label: "Book My Readiness Review", url: c.review_url }, signoff: SIGN,
      };
    case "e4":
      return {
        subject: "The contracts you'll see next summer are being planned now",
        preheader: "How the federal buying calendar really works.",
        body: [hi, "Here's something most small businesses learn the hard way. When an opportunity appears on SAM.gov, it's late in the process. The agency identified the need, set the budget and often talked with potential vendors months earlier.",
          "Every agency publishes procurement forecasts that show what it plans to buy. The federal fiscal year ends September 30, and the busiest buying season runs through the summer before it. The businesses that win that season are the ones who reviewed the forecasts, met the small business offices and positioned themselves months ahead.",
          "Three things you can do this week:",
          { ol: ["Find the procurement forecast for each of your target agencies.", "Flag every planned purchase that matches your NAICS codes.", "Email each agency's small business office to introduce your company and ask one question about an upcoming purchase."] },
          "If you want those targets chosen for you and the outreach mapped out, that's what your 90-Day Federal Action Plan delivers."],
        button: { label: "Book My Readiness Review", url: c.review_url }, signoff: SIGN,
      };
    case "e5":
      return {
        subject: "Should I close your file?",
        preheader: "One last note about your Readiness Report.",
        body: [hi, "I haven't heard from you since you took the Readiness Assessment, so this is my last note about your report.",
          `Maybe the timing isn't right, or maybe you're working through the steps on your own. Either way, I respect that. Your report is still available any time at ${c.report_url}.`,
          "If you're ready for a plan built around your business, a Readiness Review is the fastest way to get one. If not, you'll still hear from me now and then with free trainings and practical federal contracting insights."],
        button: { label: "Book My Readiness Review", url: c.review_url }, signoff: "Wishing you every success,\nTowan Isom",
      };
  }
  return null;
}

export function smsFor(key: string, c: Ctx): string | null {
  switch (key) {
    case "s0": return `GoGovCon: Your Readiness Report is in your inbox. You scored ${c.score}/100. Reply STOP to opt out, HELP for help.`;
    case "s1": return `GoGovCon: ${c.first_name}, your biggest gap is ${PILLAR_NAMES[c.gap]}. Get your 90-day plan: ${c.review_url} Reply STOP to opt out`;
    case "s2": return `GoGovCon: Last note on your report. Your 90-day plan is one session away: ${c.review_url} Reply STOP to opt out`;
  }
  return null;
}

/* ---------- Schedule ---------- */

const D = 86400000;
/** Texts never go out 9 PM to 8 AM Eastern; push to 9 AM ET. */
export function smsSafe(at: Date): Date {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hourCycle: "h23" }).format(at));
  if (hour >= 8 && hour < 21) return at;
  const etParts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
  let day = new Date(`${etParts}T00:00:00Z`);
  if (hour >= 21) day = new Date(day.getTime() + D);
  // 9 AM ET: try both offsets and keep the one that lands on hour 9.
  for (const off of [4, 5]) {
    const cand = new Date(day.getTime() + (9 + off) * 3600000);
    const h = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hourCycle: "h23" }).format(cand));
    if (h === 9) return cand;
  }
  return new Date(day.getTime() + 13 * 3600000);
}

export function buildAssessmentSchedule(now: Date, sms: boolean) {
  const n = now.getTime();
  const out: { channel: "email" | "sms"; template_key: string; send_at: string }[] = [];
  const e = (k: string, d: number) => out.push({ channel: "email", template_key: k, send_at: new Date(n + d * D).toISOString() });
  const s = (k: string, d: number) => sms && out.push({ channel: "sms", template_key: k, send_at: smsSafe(new Date(n + d * D)).toISOString() });
  e("e0", 0); s("s0", 0); e("e1", 1); e("e2", 2); e("e3", 4); s("s1", 4); e("e4", 6); e("e5", 8); s("s2", 8);
  return out;
}

/* ---------- Rendering ---------- */

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));
// Brand guide: near-black #231F20, gold #B79B44, light gray #D8D8D5, off-white #F4F4F4.
const INK = "#231F20", GOLD = "#B79B44", LINE = "#D8D8D5", OFF = "#F4F4F4";

function shell(preheader: string, inner: string, unsub: string, logoW = 110, band = "") {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#ffffff;font-family:Montserrat,Arial,sans-serif;color:${INK}">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td align="center" style="background:#ffffff;padding:20px 28px;border-bottom:4px solid ${GOLD}"><img src="${LOGO_URL}" width="${logoW}" alt="GoGovCon by Towan Isom" style="display:block;width:${logoW}px;max-width:100%;height:auto;border:0"></td></tr>${band}
<tr><td style="padding:28px;background:#ffffff;font-size:15px;line-height:1.6">${inner}</td></tr>
<tr><td style="background:${OFF};padding:18px 28px;font-size:12px;color:${INK};line-height:1.5">${esc(FOOTER_REASON)}<br>${esc(MAILING_ADDRESS)}<br><a href="${esc(unsub)}" style="color:${INK}">Unsubscribe</a></td></tr>
</table></td></tr></table></body></html>`;
}
const p = (t: string) => `<p style="margin:0 0 16px">${esc(t)}</p>`;
const h2 = (t: string) => `<h2 style="font-family:'Playfair Display',Georgia,serif;font-size:20px;margin:28px 0 12px;color:${INK}">${esc(t)}</h2>`;
const btn = (label: string, url: string) => `<p style="margin:24px 0"><a href="${esc(url)}" style="display:inline-block;background:${GOLD};color:${INK};font-weight:700;text-decoration:none;padding:14px 28px;border-radius:6px">${esc(label)}</a></p>`;
const sign = (s: string) => `<p style="margin:24px 0 0">${s.split("\n").map(esc).join("<br>")}${s.includes("Founder") ? "" : ""}</p>`;

function blockHtml(b: Block) {
  if (typeof b === "string") return p(b);
  const tag = "ul" in b ? "ul" : "ol";
  const items = "ul" in b ? b.ul : b.ol;
  return `<${tag} style="margin:0 0 16px;padding-left:22px">${items.map((i) => `<li style="margin:0 0 6px">${esc(i)}</li>`).join("")}</${tag}>`;
}
function blockText(b: Block) {
  if (typeof b === "string") return b;
  return "ul" in b ? b.ul.map((i) => `- ${i}`).join("\n") : b.ol.map((i, n) => `${n + 1}. ${i}`).join("\n");
}

export function renderEmail(e: Email, unsub: string) {
  const html = shell(e.preheader, e.body.map(blockHtml).join("") + btn(e.button.label, e.button.url) + sign(e.signoff), unsub);
  const text = `${e.body.map(blockText).join("\n\n")}\n\n${e.button.label}: ${e.button.url}\n\n${e.signoff}\n\n${FOOTER_REASON}\n${MAILING_ADDRESS}\nUnsubscribe: ${unsub}`;
  return { html, text };
}

export type ReportData = Ctx & {
  pillars: Record<PillarKey, number>;
  answers: { question: string; answer: string }[];
  registered_training: boolean;
};

export function reportSubject(c: Ctx) {
  return { subject: `Your GovCon Readiness Report: ${c.score}/100`, preheader: "Your five pillar scores and the one gap to fix first." };
}

export function renderReport(r: ReportData, unsub: string) {
  const { subject, preheader } = reportSubject(r);
  const gs = GAP_SECTION[r.gap];
  const bars = PILLAR_ORDER.map((k) => {
    const v = r.pillars[k] ?? 0; const st = statusFor(v); const isGap = k === r.gap;
    const w = Math.max(2, Math.min(100, v));
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;${isGap ? `border:2px solid ${GOLD};` : `border:1px solid ${LINE};`}border-radius:6px"><tr><td style="padding:12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-weight:700;font-size:14px">${esc(PILLAR_NAMES[k].toUpperCase())}${isGap ? ` <span style="background:${GOLD};color:${INK};font-size:10px;padding:2px 6px;border-radius:3px;letter-spacing:1px">BIGGEST GAP</span>` : ""}<br><span style="font-weight:400;font-size:12px">${esc(PILLAR_SUB[k])}</span></td>
<td align="right" style="font-weight:700;font-size:14px;white-space:nowrap">${v}/100 · ${st}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;background:${OFF}"><tr><td width="${w}%" style="background:${GOLD};height:10px;font-size:0;line-height:0">&nbsp;</td><td style="height:10px;font-size:0;line-height:0">&nbsp;</td></tr></table>
<p style="margin:0;font-size:13px">${esc(PILLAR_ACTIONS[k][st])}</p></td></tr></table>`;
  }).join("");
  const answers = `<table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:12px;border-collapse:collapse">${r.answers.map((a) => `<tr><td style="border-bottom:1px solid ${LINE};vertical-align:top">${esc(a.question)}</td><td style="border-bottom:1px solid ${LINE};vertical-align:top;font-weight:700">${esc(a.answer)}</td></tr>`).join("")}</table>`;
  const offer = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OFF};border-top:4px solid ${GOLD};margin-top:28px"><tr><td style="padding:22px">
<h2 style="font-family:'Playfair Display',Georgia,serif;font-size:20px;margin:0 0 12px">${esc(REPORT_OFFER.heading)}</h2>${p(REPORT_OFFER.intro)}${blockHtml({ ul: REPORT_OFFER.items })}${p(REPORT_OFFER.credit)}${btn(REPORT_OFFER.button, r.review_url)}</td></tr></table>`;
  const links = `<p style="margin:20px 0 0;font-size:14px"><a href="${esc(r.report_url)}" style="color:${INK}">View or print your report online</a>${r.registered_training ? "" : `<br><a href="${esc(r.training_url)}" style="color:${INK}">Watch the free 30-minute training</a>`}</p>`;
  const inner = p(`Hi ${r.first_name || "there"},`) +
    p("Thank you for taking the GovCon Readiness Assessment. Here is your personal report. Keep it handy, because it shows exactly where you stand with federal contracting and what to do next.") +
    h2(`Your Score: ${r.score}/100, ${r.tier}`) + p(TIER_PARAGRAPH[r.tier] ?? "") +
    h2("Your Five Pillars") + p("Each pillar is scored from 0 to 100. Strong is 67 and above, Building is 34 to 66, and Gap is 33 and below.") + bars +
    h2(`Your Biggest Gap: ${PILLAR_NAMES[r.gap]}`) + p(gs.intro) + `<p style="margin:0 0 8px;font-weight:700">Your next three moves:</p>` + blockHtml({ ol: gs.moves }) +
    h2("Your Answers") + answers + offer + links + sign("To your success,\nTowan Isom\nFounder, GoGovCon");
  const text = [
    `Hi ${r.first_name || "there"},`,
    "Thank you for taking the GovCon Readiness Assessment. Here is your personal report. Keep it handy, because it shows exactly where you stand with federal contracting and what to do next.",
    `YOUR SCORE: ${r.score}/100, ${r.tier}`, TIER_PARAGRAPH[r.tier] ?? "",
    "YOUR FIVE PILLARS", "Each pillar is scored from 0 to 100. Strong is 67 and above, Building is 34 to 66, and Gap is 33 and below.",
    ...PILLAR_ORDER.map((k) => { const v = r.pillars[k] ?? 0; const st = statusFor(v); return `${PILLAR_NAMES[k]}${k === r.gap ? " (Biggest gap)" : ""}: ${v}/100, ${st}\n${PILLAR_ACTIONS[k][st]}`; }),
    `YOUR BIGGEST GAP: ${PILLAR_NAMES[r.gap]}`, gs.intro, "Your next three moves:", blockText({ ol: gs.moves }),
    "YOUR ANSWERS", r.answers.map((a) => `${a.question}: ${a.answer}`).join("\n"),
    REPORT_OFFER.heading.toUpperCase(), REPORT_OFFER.intro, blockText({ ul: REPORT_OFFER.items }), REPORT_OFFER.credit,
    `${REPORT_OFFER.button}: ${r.review_url}`, `View or print your report online: ${r.report_url}`,
    r.registered_training ? "" : `Watch the free 30-minute training: ${r.training_url}`,
    "To your success,\nTowan Isom\nFounder, GoGovCon", FOOTER_REASON, MAILING_ADDRESS, `Unsubscribe: ${unsub}`,
  ].filter(Boolean).join("\n\n");
  return { subject, preheader, html: shell(preheader, inner, unsub), text };
}
