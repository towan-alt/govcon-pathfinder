/**
 * 14-day $497 Readiness Review credit offer: all copy lives here.
 * Sent after a Readiness Review purchase; stops when the credit is redeemed,
 * expires, or the buyer purchases the VIP Engagement.
 */
import type { Email } from "./training-templates.ts";

export const CREDIT_SCHEDULE: { key: string; dayOffset: number }[] = [
  { key: "credit_d1", dayOffset: 1 },
  { key: "credit_d7", dayOffset: 7 },
  { key: "credit_d12", dayOffset: 12 },
  { key: "credit_d14", dayOffset: 13.5 },
];

export type CreditCtx = { firstName?: string | null; expiresLabel: string; vipUrl: string; portalUrl: string };

export function creditEmailFor(key: string, c: CreditCtx): Email | null {
  const hi = `Hi ${c.firstName || "there"},`;
  const btn = { label: "Apply My $497 Credit to VIP", url: c.vipUrl };
  switch (key) {
    case "credit_d1":
      return {
        subject: "Your $497 credit is active",
        preheader: `Apply it toward the VIP Engagement by ${c.expiresLabel}.`,
        body: [hi, "Thank you for booking your Readiness Review. Your full $497 is now a credit toward the $2,500 VIP Engagement, which brings your balance to $2,003.", `The credit is good until ${c.expiresLabel} and can be used once. You do not need to decide today. Complete your intake first so we get the most from your session.`],
        button: { label: "Open My Portal", url: c.portalUrl },
      };
    case "credit_d7":
      return {
        subject: "Halfway through your credit window",
        preheader: "7 days left to apply your $497.",
        body: [hi, "You are halfway through your credit window. The Readiness Review gives you the plan. The VIP Engagement is where we go deeper: a 2-hour virtual intensive on your specific opportunities, teaming assistance, and ongoing access while you execute.", `Your $497 still applies until ${c.expiresLabel}.`],
        button: btn,
      };
    case "credit_d12":
      return {
        subject: "2 days left on your $497 credit",
        preheader: `Your credit expires ${c.expiresLabel}.`,
        body: [hi, `Quick heads up: your $497 credit expires ${c.expiresLabel}. If the VIP Engagement is part of your plan, this is the time to use it.`],
        button: btn,
      };
    case "credit_d14":
      return {
        subject: "Last day for your $497 credit",
        preheader: "After today it no longer applies.",
        body: [hi, "Today is the last day your $497 Readiness Review credit applies toward the VIP Engagement. After today the full $2,500 price applies.", "If now is not the right time, no problem. Keep working your 90-day plan, and reply to this email with any questions."],
        button: btn,
      };
  }
  return null;
}
