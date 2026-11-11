import { describe, it, expect } from "vitest";
import { nextReportAt, reportWindowDays, retryReportAt, unsentOpportunities, safeToRetry, ownsSubscriptionEmail } from "../../supabase/functions/_shared/opportunity-rules";
const now = new Date("2026-11-11T07:00:00Z");
describe("opportunity report rules", () => {
  it("schedules daily reports once per day", () => {
    expect(reportWindowDays("daily")).toBe(1);
    expect(nextReportAt("daily", now)).toBe("2026-11-12T07:00:00.000Z");
  });
  it("consolidates and schedules weekly reports for seven days", () => {
    expect(reportWindowDays("weekly")).toBe(7);
    expect(nextReportAt("weekly", now)).toBe("2026-11-18T07:00:00.000Z");
  });
  it("never repeats an already delivered opportunity", () => {
    expect(unsentOpportunities([{ id: "sent" }, { id: "new" }], ["sent"])).toEqual([{ id: "new" }]);
  });
  it("backs off failed delivery retries", () => {
    expect(retryReportAt(1, now)).toBe("2026-11-11T08:00:00.000Z");
    expect(retryReportAt(3, now)).toBe("2026-11-11T11:00:00.000Z");
  });
  it("does not automatically resend ambiguous deliveries outside the safe window", () => {
    expect(safeToRetry("2026-11-10T07:00:00Z", now)).toBe(false);
    expect(safeToRetry("2026-11-11T06:00:00Z", now)).toBe(true);
  });
  it("requires verified email ownership before changing existing preferences", () => {
    expect(ownsSubscriptionEmail(null, "owner@example.com", null)).toBe(false);
    expect(ownsSubscriptionEmail({ id: "one", email: "owner@example.com" }, "owner@example.com", null)).toBe(false);
    expect(ownsSubscriptionEmail({ id: "one", email: "owner@example.com", email_confirmed_at: "confirmed" }, "owner@example.com", "another")).toBe(false);
    expect(ownsSubscriptionEmail({ id: "one", email: "owner@example.com", email_confirmed_at: "confirmed" }, "owner@example.com", "one")).toBe(true);
  });
});