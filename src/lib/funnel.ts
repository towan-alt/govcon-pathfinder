/**
 * Training funnel configuration: offer details, config URLs, lead storage,
 * and real webinar session scheduling (America/New_York).
 */

/** Set these when the real assets exist. Empty string shows a placeholder. */
export const REPLAY_VIDEO_URL = "";
export const BOOKING_URL = "";
export const STARTER_KIT_URL = "";

/** Static Square Payment Link fallbacks, used only when Square secrets aren't set. */
export const SQUARE_LINK_READINESS_REVIEW = "";
export const SQUARE_LINK_VIP_ENGAGEMENT = "";
export const SQUARE_LINK_LAUNCH_KIT = "";

/** Square products. Keep in sync with supabase/functions/_shared/square.ts. */
export const SQUARE_PRODUCTS = {
  launch_kit: { name: "GovCon Launch Kit", cents: 1900, price: "$19", returnPath: "/launch-kit/confirmed", staticLink: SQUARE_LINK_LAUNCH_KIT },
  readiness_review_bundle: { name: "Readiness Review Bundle", cents: 49700, price: "$497", returnPath: "/readiness-review/confirmed", staticLink: SQUARE_LINK_READINESS_REVIEW },
  vip_engagement: { name: "VIP Engagement", cents: 250000, price: "$2,500", returnPath: "/vip-engagement/confirmed", staticLink: SQUARE_LINK_VIP_ENGAGEMENT },
} as const;
export type SquareProductKey = keyof typeof SQUARE_PRODUCTS;

export const SUPPORT_EMAIL = "hello@gogovcon.com";
export const REVIEW_PRICE = SQUARE_PRODUCTS.readiness_review_bundle.price;
export const REVIEW_CREDIT_DAYS = 14;
export const TRAINING_MINUTES = 30;
export const ASSESSMENT_LENGTH = "10 questions · about 3 minutes";

export const REVIEW_INCLUDES = [
  { title: "Personalized readiness scorecard", text: "Your business scored across the ten areas that decide federal readiness." },
  { title: "Executive summary", text: "Your strengths, gaps and priorities in writing, verified by a qualified reviewer." },
  { title: "Five recommended target agencies", text: "Agencies that buy what you sell, with the rationale and an initial action for each." },
  { title: "Customized 90-day action plan", text: "Actions, owners, milestones and progress measures, delivered in writing within 48 hours of your session." },
  { title: "One 60-minute planning session with Towan", text: "A working session with Towan Isom, plus the full session recording." },
  { title: "GoGovCon Slack channel access", text: "A direct channel to ask questions as you execute your plan." },
  { title: "Private WhatsApp group access", text: "Ongoing access to the private client community." },
  { title: "Matched opportunity emails", text: "Opportunity listings delivered privately by email, matched to your NAICS codes, capabilities and target agencies." },
  { title: "Monthly sessions with Towan, on demand", text: "Practical AI prompts, automations, contracting tips, tools and resources, available on demand." },
] as const;

export const REVIEW_AREAS = [
  "Business foundation and registration information",
  "Positioning and differentiation",
  "Agency fit",
  "Past performance",
  "Marketing materials",
  "Pipeline and capture",
  "Proposal readiness",
  "Pricing readiness",
  "Delivery capacity",
  "Financial and operational readiness",
] as const;

export const REVIEW_PROMISE =
  "Understand how prepared your business is to pursue, win, and deliver government contracts, with a comprehensive review, five recommended target agencies, a personalized 90-day action plan, and a planning session with Towan Isom.";

export const REVIEW_CREDIT_LINE = `The ${REVIEW_PRICE} is credited toward any GoGovCon program you enroll in within ${REVIEW_CREDIT_DAYS} days of your session.`;

export const VIP_PRICE = SQUARE_PRODUCTS.vip_engagement.price;
export const VIP_SESSION_LINE = "A 2-hour virtual 1:1 intensive with Towan Isom.";
export const VIP_INCLUDES = [
  { title: "2-hour virtual strategy intensive", text: "A focused 1:1 working session with Towan, held over video, on your business and your federal path." },
  { title: "Pre-session review", text: "Towan reviews your business, SAM.gov record and positioning before you meet, so the session starts working immediately." },
  { title: "Written action plan", text: "Your plan in writing after the session, with the specific next steps for your business." },
  { title: "Session recording", text: "The full recording of your session, so you can revisit every recommendation." },
  { title: "Teaming recommendations and assistance", text: "Introductions and guidance on teaming partners that strengthen your bids." },
  { title: "Private Slack channel access", text: "A direct channel to ask questions as you execute your plan." },
  { title: "WhatsApp group access", text: "Ongoing access to the private client community." },
  { title: "Follow-up email access", text: "Email access after the session for questions as you put the plan to work." },
] as const;

export const KIT_PRICE = SQUARE_PRODUCTS.launch_kit.price;
export const KIT_TAGLINE = "Get your business foundation in place.";
export const KIT_INCLUDES = [
  { title: "The GovCon Launch Kit booklet", text: "The complete downloadable guide, yours to keep and work through at your own pace." },
  { title: "EIN, banking, NAICS and SAM.gov guidance", text: "Plain-language direction on each registration and account your business needs." },
  { title: "An organized setup roadmap", text: "The steps in order, so you always know what comes next." },
  { title: "Official resource links", text: "Direct links to the government sites and tools, no hunting required." },
  { title: "What to prepare next", text: "Clear direction on the materials that set you up for federal work." },
] as const;
export const KIT_NO_CALL_NOTE = "The Launch Kit is a self-guided resource. It does not include a consultation.";
export const KIT_NEXT_OFFER = "You have the roadmap. Now find out how ready your business is and which agencies you should target.";
export const NAICS_REPORT_NEXT_STEP = "Ready to get started? Put your business foundation in place with the GovCon Launch Kit.";

export const LEAD_KEY = "ggc_lead";
export const PURCHASE_KEY = "ggc_review_purchased";
export const RESULT_KEY = "ggc_assessment_result";

export type StoredLead = { firstName: string; lastName?: string; email: string; phone?: string; session?: "live" | "replay"; sessionIso?: string };

export function getLead(): StoredLead | null {
  try {
    const raw = sessionStorage.getItem(LEAD_KEY);
    return raw ? (JSON.parse(raw) as StoredLead) : null;
  } catch {
    return null;
  }
}

export function saveLead(patch: Partial<StoredLead>) {
  const current = getLead() ?? { firstName: "", email: "" };
  sessionStorage.setItem(LEAD_KEY, JSON.stringify({ ...current, ...patch }));
}

export type PillarKey = "registered" | "certified" | "positioned" | "pipeline" | "proposal";
export type AssessmentResult = {
  score: number;
  tierKey: string;
  firstName: string;
  pillars?: Record<PillarKey, number>;
  gap?: PillarKey;
  reportToken?: string;
};

export const PILLAR_LABELS: Record<PillarKey, string> = {
  registered: "Registered",
  certified: "Certified",
  positioned: "Positioned",
  pipeline: "Pipeline",
  proposal: "Proposal",
};

export function getAssessmentResult(): AssessmentResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as AssessmentResult) : null;
  } catch {
    return null;
  }
}

/* ---------- Real session scheduling in America/New_York ---------- */

const TZ = "America/New_York";

/** Offset in minutes between UTC and New York at a given instant. */
function nyOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** Next Tuesday 12:00 PM ET that has not ended yet (sessions run 30 min plus Q&A). */
export function nextSessionStart(now = new Date()): Date {
  const SESSION_LENGTH_MS = 60 * 60000;
  const nyNow = new Date(now.getTime() + nyOffsetMinutes(now) * 60000);
  for (let add = 0; add < 15; add++) {
    const d = new Date(Date.UTC(nyNow.getUTCFullYear(), nyNow.getUTCMonth(), nyNow.getUTCDate() + add, 12, 0));
    if (d.getUTCDay() !== 2) continue;
    // d is "12:00 wall time" expressed in UTC fields; convert to the real instant.
    const guess = new Date(d.getTime() - nyOffsetMinutes(d) * 60000);
    const start = new Date(d.getTime() - nyOffsetMinutes(guess) * 60000);
    if (start.getTime() + SESSION_LENGTH_MS > now.getTime()) return start;
  }
  return now;
}

export function formatSession(date: Date): string {
  const day = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" }).format(date);
  return `${day} at 12:00 PM ET`;
}

const icsStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export const TRAINING_TITLE = "The 5 Costly Mistakes That Keep Small Businesses From Winning Their First Federal Contract";

export function googleCalendarUrl(start: Date, origin: string): string {
  const end = new Date(start.getTime() + 60 * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Free GoGovCon Training: ${TRAINING_TITLE}`,
    dates: `${icsStamp(start)}/${icsStamp(end)}`,
    details: `Your free ${TRAINING_MINUTES}-minute training with Towan Isom. Join link: ${origin}/training/watch`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsDataUrl(start: Date, origin: string): string {
  const end = new Date(start.getTime() + 60 * 60000);
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GoGovCon//Training//EN",
    "BEGIN:VEVENT",
    `UID:${icsStamp(start)}-training@gogovcon`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:Free GoGovCon Training with Towan Isom`,
    `DESCRIPTION:${TRAINING_TITLE}. Join: ${origin}/training/watch`,
    `URL:${origin}/training/watch`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

/* ---------- Evergreen training sessions ---------- */

export const TRAINING_VIDEO_SECONDS = 30 * 60;
export const CTA_AT_SECONDS = 1320;
export const REPLAY_HOURS = 48;
export const SHOWING_HOURS_ET = [12, 15, 19];

export type TrainingSessionType = "showing" | "live" | "instant";
export type TrainingSessionOption = {
  key: string;
  type: TrainingSessionType;
  start: Date;
  title: string;
  sub: string;
  badge: string;
};

/** Real instant for a New York wall-clock time `dayOffset` days from today. */
export function nyWallTime(dayOffset: number, hour: number, minute = 0, now = new Date()): Date {
  const nyNow = new Date(now.getTime() + nyOffsetMinutes(now) * 60000);
  const d = new Date(Date.UTC(nyNow.getUTCFullYear(), nyNow.getUTCMonth(), nyNow.getUTCDate() + dayOffset, hour, minute));
  const guess = new Date(d.getTime() - nyOffsetMinutes(d) * 60000);
  return new Date(d.getTime() - nyOffsetMinutes(guess) * 60000);
}

function nyDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function dayBadge(date: Date, now = new Date()): string {
  const k = nyDayKey(date);
  if (k === nyDayKey(now)) return "Today";
  if (k === nyDayKey(new Date(now.getTime() + 86400000))) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long" }).format(date);
}

export function formatEt(date: Date): string {
  const day = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(date);
  return `${day} at ${time} ET`;
}

export function formatTimeEt(date: Date): string {
  return `${new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(date)} ET`;
}

/** Next quarter-hour at least 5 minutes from now. */
export function nextQuarterHour(now = new Date()): Date {
  const q = 15 * 60000;
  let t = Math.ceil(now.getTime() / q) * q;
  if (t - now.getTime() < 5 * 60000) t += q;
  return new Date(t);
}

export function trainingSessionOptions(now = new Date()): TrainingSessionOption[] {
  const showing = "Scheduled showing of the 30-minute training";
  const opts: TrainingSessionOption[] = [];
  const soon = nextQuarterHour(now);
  const mins = Math.round((soon.getTime() - now.getTime()) / 60000);
  opts.push({ key: `s-${soon.getTime()}`, type: "showing", start: soon, title: `Next showing: starts in ${mins} minutes`, sub: `${formatTimeEt(soon)} · ${showing}`, badge: "Starting soon" });

  const used = new Set([soon.getTime()]);
  const slots: Date[] = [];
  for (let day = 0; day < 3 && slots.length < 3; day++) {
    for (const h of SHOWING_HOURS_ET) {
      const t = nyWallTime(day, h, 0, now);
      if (t.getTime() > now.getTime() + 5 * 60000 && !used.has(t.getTime()) && slots.length < 3) {
        slots.push(t);
        used.add(t.getTime());
      }
    }
  }
  const tomorrowNoon = nyWallTime(1, 12, 0, now);
  if (!used.has(tomorrowNoon.getTime())) slots.push(tomorrowNoon);
  for (const t of slots) {
    opts.push({ key: `s-${t.getTime()}`, type: "showing", start: t, title: formatEt(t), sub: showing, badge: dayBadge(t, now) });
  }

  const live = nextSessionStart(now);
  opts.push({ key: "live", type: "live", start: live, title: `Live with Towan: ${formatEt(live)}`, sub: "Includes live Q&A", badge: live.getTime() - now.getTime() < 3600000 ? "Starting soon" : dayBadge(live, now) });
  opts.push({ key: "instant", type: "instant", start: now, title: "Watch now", sub: "Instant access to the 30-minute training", badge: "Instant" });
  return opts;
}

export const REG_KEY = "ggc_training_reg";

/** Assessment consent (must match CONSENT_TEXT in supabase/functions/_shared/assessment-templates.ts). */
export const ASSESSMENT_CONSENT_BEFORE =
  'By clicking "Show My Result," you agree to receive your Readiness Report and follow-up emails from GoGovCon. If you provide a mobile number, you also agree to receive recurring automated marketing text messages from GoGovCon at that number. Consent to texts is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. You can unsubscribe from emails at any time using the link in every email. See our';
export const ASSESSMENT_RESULT_NOTE =
  "Your report is on its way to your inbox. You're enrolled in GoGovCon emails and, if you shared your mobile number, text updates. Opt out any time.";

/** Public site origin (published domain) used for absolute asset URLs such as the email logo. */
export const PUBLIC_SITE_URL = "https://gogovcon.com";
export const LOGO_PATH = "/brand/gogovcon-logo-gold.png";
export const LOGO_URL = `${PUBLIC_SITE_URL}${LOGO_PATH}`;
export const LOGO_ALT = "GoGovCon by Towan Isom";
