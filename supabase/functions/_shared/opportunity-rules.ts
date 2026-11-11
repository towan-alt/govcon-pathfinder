export type Frequency = "daily" | "weekly";
export const reportWindowDays = (frequency: Frequency) => frequency === "daily" ? 1 : 7;
export const nextReportAt = (frequency: Frequency, now: Date) =>
  new Date(now.getTime() + reportWindowDays(frequency) * 86400000).toISOString();
export const retryReportAt = (attempts: number, now: Date) =>
  new Date(now.getTime() + Math.min(24, 2 ** Math.max(0, attempts - 1)) * 3600000).toISOString();
export const safeToRetry = (firstAttemptAt: string | null, now: Date) =>
  !firstAttemptAt || now.getTime() - new Date(firstAttemptAt).getTime() < 23 * 3600000;
export const ownsSubscriptionEmail = (user: { id: string; email?: string; email_confirmed_at?: string } | null, email: string, ownerId: string | null) =>
  Boolean(user?.email_confirmed_at && user.email?.toLowerCase() === email && (!ownerId || ownerId === user.id));
export const unsentOpportunities = <T extends { id: string }>(opps: T[], prior: string[]) => {
  const seen = new Set(prior);
  return opps.filter((o) => !seen.has(o.id));
};