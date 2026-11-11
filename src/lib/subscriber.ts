import { supabase } from "@/integrations/supabase/client";

export const SUB_PRICE_ID = "opportunity_reports_monthly";
export type Prefs = { frequency: "daily" | "weekly"; naics_codes: string[]; keywords: string[]; min_ai_score: number | null };
export type SubOptions = { ai_enabled: boolean; naics: { code: string; description: string }[]; keywords: { keyword: string; group?: string }[] };
export type Billing = { status: string; current_period_end: string | null; cancel_at_period_end: boolean | null } | null;

export const billingActive = (b: Billing) => !!b && ((["active", "trialing", "past_due"].includes(b.status) && (!b.current_period_end || new Date(b.current_period_end) > new Date())) || (b.status === "canceled" && !!b.current_period_end && new Date(b.current_period_end) > new Date()));

export async function subCall(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("opportunity-subscribe", { body });
  if (error) {
    let msg = "Request failed. Please try again.";
    try { const b = await (error as { context?: Response }).context?.json(); if (typeof b?.error === "string") msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

/** Drop any saved choices the admin no longer offers. */
export const sanitizePrefs = (p: Prefs, o: SubOptions | null): Prefs => {
  if (!o) return p;
  const codes = new Set(o.naics.map((n) => n.code));
  const words = new Map(o.keywords.map((k) => [k.keyword.toLowerCase(), k.keyword]));
  return { ...p, naics_codes: p.naics_codes.filter((c) => codes.has(c)), keywords: p.keywords.map((k) => words.get(k.toLowerCase())).filter((k): k is string => !!k), min_ai_score: o.ai_enabled ? p.min_ai_score : null };
};
