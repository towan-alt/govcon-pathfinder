/**
 * All training follow-up copy lives here. Edit freely.
 * Email copy: subject, preheader, paragraphs, one button. SMS: under 160 characters.
 */

export const EMAIL_FROM = "Towan Isom <towan@gogovcon.com>"; // must be a sender verified in Resend
export const MAILING_ADDRESS = "GoGovCon · [Your mailing address here] · Washington, DC";
export const SUPPORT_EMAIL = "hello@gogovcon.com";
export const REVIEW_PRICE = "$497";
export const REVIEW_CREDIT_DAYS = 14;

const H = 3600000;
const M = 60000;

export type Ctx = {
  firstName: string;
  sessionLabel: string;
  watchUrl: string;
  assessmentUrl: string;
  reviewUrl: string;
  pickUrl: string;
  tier?: string | null;
  gap?: string | null;
  score?: number | null;
};

export type Email = { subject: string; preheader: string; body: string[]; button: { label: string; url: string } };

/* ---------- Schedule ---------- */

export type QueuedMessage = { channel: "email" | "sms"; template_key: string; send_at: string };

export function buildSchedule(type: "showing" | "live" | "instant", start: Date, now: Date, sms: boolean): QueuedMessage[] {
  const out: QueuedMessage[] = [];
  const add = (key: string, at: number, channels: ("email" | "sms")[]) => {
    for (const ch of channels) {
      if (ch === "sms" && !sms) continue;
      out.push({ channel: ch, template_key: key, send_at: new Date(Math.max(at, now.getTime())).toISOString() });
    }
  };
  const s = start.getTime();
  const n = now.getTime();
  add("confirm", n, ["email", "sms"]);
  if (type !== "instant") {
    if (s - n > 25 * H) add("reminder_24h", s - 24 * H, ["email"]);
    if (s - n > 1 * H + 5 * M) add("reminder_1h", s - H, ["email"]);
    if (s - n > 15 * M + 2 * M) add("starting_15m", s - 15 * M, ["email", "sms"]);
    add("live_now", s, ["email", "sms"]);
  }
  add("post_session", s + 90 * M, ["email"]);
  add("day1", s + 24 * H, ["email"]);
  add("day2_replay_expiring", s + 40 * H, ["email"]);
  add("day3_review", s + 72 * H, ["email"]);
  add("day5_new_time", s + 120 * H, ["email"]);
  return out;
}

/* ---------- Email copy (Towan's voice) ---------- */

export function emailFor(key: string, c: Ctx): Email | null {
  const hi = `Hi ${c.firstName || "there"},`;
  switch (key) {
    case "confirm":
      return {
        subject: `You're in: ${c.sessionLabel}`,
        preheader: "Your seat is saved. Here's your personal watch link.",
        body: [hi, `Your seat is saved for ${c.sessionLabel}. Over 30 minutes I'll walk you through the 5 mistakes that keep good small businesses from winning their first federal contract, and what to do instead.`, "Bookmark your personal watch link below. One tip: take the free Readiness Assessment before we start. It takes about 3 minutes and shows you which mistake is costing you the most."],
        button: { label: "Open My Watch Link", url: c.watchUrl },
      };
    case "reminder_24h":
      return {
        subject: "Tomorrow: your federal contracting training",
        preheader: `See you ${c.sessionLabel}.`,
        body: [hi, `Quick reminder: your training is ${c.sessionLabel}. Block 30 minutes, grab a notepad, and come ready to rethink how you go after government work.`],
        button: { label: "Open My Watch Link", url: c.watchUrl },
      };
    case "reminder_1h":
      return {
        subject: "Starting in 1 hour",
        preheader: "Your training starts in an hour.",
        body: [hi, "We start in one hour. Your link is below, and it works on your phone or computer."],
        button: { label: "Open My Watch Link", url: c.watchUrl },
      };
    case "starting_15m":
      return {
        subject: "Starting in 15 minutes",
        preheader: "Grab a seat. We're about to begin.",
        body: [hi, "We're 15 minutes out. Close a few tabs, grab a coffee, and click below when you're ready."],
        button: { label: "Join the Training", url: c.watchUrl },
      };
    case "live_now":
      return {
        subject: "We're starting now",
        preheader: "The training is playing. Join here.",
        body: [hi, "The training is starting right now. If you join a few minutes late you'll land right where we are, and you can always start from the beginning."],
        button: { label: "Join Now", url: c.watchUrl },
      };
    case "post_attended_high":
      return {
        subject: "Here's your next step",
        preheader: "Get your Readiness Score in about 3 minutes.",
        body: [hi, "Thank you for staying with me. You now know the 5 mistakes. The next question is which one is costing you the most.", "Your free Readiness Score answers that in about 3 minutes and shows your biggest gap across the five pillars of the GovCon Expert Method."],
        button: { label: "Get My Readiness Score", url: c.assessmentUrl },
      };
    case "post_attended_low":
      return {
        subject: "You left before the best part",
        preheader: "Your replay is waiting for 48 hours.",
        body: [hi, "Looks like you had to step away. Life happens. The second half is where I show you how to pick target agencies and build past performance, so it's worth finishing.", "Your replay is available for 48 hours."],
        button: { label: "Finish the Training", url: c.watchUrl },
      };
    case "post_noshow":
      return {
        subject: "You missed it. Here's your replay",
        preheader: "Available for 48 hours.",
        body: [hi, "We missed you today. No problem. I saved your replay, and it's available for the next 48 hours.", "It's 30 minutes that can save you a year of chasing the wrong contracts."],
        button: { label: "Watch My Replay", url: c.watchUrl },
      };
    case "day1_score":
      return {
        subject: "What's your Readiness Score?",
        preheader: "10 questions. About 3 minutes.",
        body: [hi, "Most business owners I meet are working hard on the wrong part of federal contracting. The Readiness Assessment shows you exactly where you stand across five pillars: Registered, Certified, Positioned, Pipeline and Proposal.", "It's free, it's 10 questions, and you'll see your score right away."],
        button: { label: "Get My Readiness Score", url: c.assessmentUrl },
      };
    case "day1_tier":
      return {
        subject: `Your ${c.tier ?? "Readiness"} result and your ${c.gap ?? "biggest"} gap`,
        preheader: "Here's how we close it.",
        body: [hi, `You scored ${c.score ?? "your score"}/100, which puts you in the ${c.tier ?? "current"} tier. Your biggest gap is ${c.gap ?? "the lowest pillar on your report"}. That's the one thing I'd fix first.`, `In a Readiness Review we sit down 1:1 for 60 minutes, build your Top 5 Target Agency List, and I deliver a written 90-Day Federal Action Plan within 48 hours. The ${REVIEW_PRICE} is credited toward any GoGovCon program you join within ${REVIEW_CREDIT_DAYS} days.`],
        button: { label: "See the Readiness Review", url: c.reviewUrl },
      };
    case "day2_replay_expiring":
      return {
        subject: "Your replay expires tonight",
        preheader: "Last chance to finish the training.",
        body: [hi, "Heads up: your replay link expires tonight. If you haven't finished, now is the time. Mistake 4, missing the relationship window, is the one most people tell me changed how they think."],
        button: { label: "Finish My Replay", url: c.watchUrl },
      };
    case "day3_review":
      return {
        subject: "Stop guessing. Get a plan.",
        preheader: "60 minutes 1:1, a target agency list and a written plan.",
        body: [hi, "Here's what you get in a Readiness Review: the GovCon Starter Kit right away, a review of your SAM.gov record and website before we meet, a 60-minute 1:1 session, your Top 5 Target Agency List, a written 90-Day Federal Action Plan within 48 hours, and the recording.", `The ${REVIEW_PRICE} is credited toward any GoGovCon program you join within ${REVIEW_CREDIT_DAYS} days.`, "People ask me: APEX Accelerators are free, why pay? Use your APEX counselor. They're valuable. This is different: a working session with someone who has bid and won federal work for 30 years, and deliverables you keep."],
        button: { label: "Book My Readiness Review", url: c.reviewUrl },
      };
    case "day5_new_time":
      return {
        subject: "Pick a new time?",
        preheader: "New showings run every day.",
        body: [hi, "If the timing wasn't right this week, pick a new time. Showings run every day, and every Tuesday I'm there live for Q&A."],
        button: { label: "Pick a New Time", url: c.pickUrl },
      };
  }
  return null;
}

/* ---------- SMS copy (under 160 chars). First SMS includes STOP language. ---------- */

export function smsFor(key: string, c: Ctx): string | null {
  switch (key) {
    case "confirm":
      return `GoGovCon: You're in! Your training link: ${c.watchUrl} Reply STOP to opt out`;
    case "starting_15m":
      return `GoGovCon: Your training starts in 15 min. Join: ${c.watchUrl}`;
    case "live_now":
      return `GoGovCon: We're starting now. Join here: ${c.watchUrl}`;
  }
  return null;
}

/* ---------- HTML/plain rendering ---------- */

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));

export function renderEmail(e: Email, unsubUrl: string) {
  // Brand guide colors: near-black #231F20, gold #B79B44, off-white #F4F4F4.
  const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Montserrat,Arial,sans-serif;color:#231F20">
<span style="display:none;max-height:0;overflow:hidden">${esc(e.preheader)}</span>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
<tr><td style="background:#231F20;padding:20px 28px;border-bottom:4px solid #B79B44"><span style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#ffffff">Go<span style="color:#B79B44">GovCon</span></span></td></tr>
<tr><td style="padding:28px;background:#ffffff;font-size:15px;line-height:1.6">
${e.body.map((p) => `<p style="margin:0 0 16px">${esc(p)}</p>`).join("")}
<p style="margin:24px 0"><a href="${esc(e.button.url)}" style="display:inline-block;background:#B79B44;color:#231F20;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:6px">${esc(e.button.label)}</a></p>
<p style="margin:24px 0 0">Talk soon,<br><strong>Towan Isom</strong><br>Founder, GoGovCon</p>
</td></tr>
<tr><td style="background:#F4F4F4;padding:18px 28px;font-size:12px;color:#231F20;line-height:1.5">
${esc(MAILING_ADDRESS)}<br>You're getting this because you registered for a free GoGovCon training. <a href="${esc(unsubUrl)}" style="color:#231F20">Unsubscribe</a>
</td></tr></table></td></tr></table></body></html>`;
  const text = `${e.body.join("\n\n")}\n\n${e.button.label}: ${e.button.url}\n\nTalk soon,\nTowan Isom\nFounder, GoGovCon\n\n${MAILING_ADDRESS}\nUnsubscribe: ${unsubUrl}`;
  return { html, text };
}
