import { describe, expect, it } from "vitest";
import { PAYHIP_PRODUCTS, REVIEW_CREDIT_LINE, trainingSessionOptions, VIP_CREDIT_BALANCE } from "@/lib/funnel";

describe("Eduardo offer and webinar clarifications", () => {
  it.each(["2026-10-12T04:08:00Z", "2026-10-12T15:58:00Z", "2026-11-01T16:00:00Z"])("offers only on-demand and one future recorded showing at %s", (iso) => {
    const now = new Date(iso);
    const options = trainingSessionOptions(now);
    expect(options.map((option) => option.type)).toEqual(["instant", "showing"]);
    expect(new Set(options.map((option) => option.start.getTime())).size).toBe(2);
    expect(options[1].start.getTime()).toBeGreaterThan(now.getTime() + 5 * 60000);
    expect(options[1].sub).toContain("No live Q&A");
  });

  it("keeps prices in cents and describes the currently implemented credit", () => {
    expect(PAYHIP_PRODUCTS.vip_engagement.cents).toBe(250000);
    expect(VIP_CREDIT_BALANCE).toBe("$2,003");
    expect(REVIEW_CREDIT_LINE).toContain("14 days of purchase");
    expect(REVIEW_CREDIT_LINE).toContain("Upgrading is optional");
  });
});