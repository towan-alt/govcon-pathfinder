import { describe, expect, it } from "vitest";
import { oppStatus } from "@/lib/opp-status";

const NOW = new Date("2026-11-11T15:00:00Z").getTime();

describe("opportunity status", () => {
  it("is active when the response deadline is in the future", () => {
    expect(oppStatus("2026-11-20T17:00:00Z", "Yes", NOW)).toBe("active");
  });

  it("is expired once the response deadline has passed", () => {
    expect(oppStatus("2026-11-10T17:00:00Z", "Yes", NOW)).toBe("expired");
  });

  it("stays active when the deadline is today but the time has not passed", () => {
    expect(oppStatus("2026-11-11T20:00:00Z", "Yes", NOW)).toBe("active");
  });

  it("is unknown when the deadline is missing", () => {
    expect(oppStatus(null, "Yes", NOW)).toBe("unknown");
  });

  it("is unknown when the deadline is invalid", () => {
    expect(oppStatus("not-a-date", "Yes", NOW)).toBe("unknown");
  });

  it("is inactive when SAM.gov reports the opportunity as not active (cancelled)", () => {
    expect(oppStatus("2026-11-20T17:00:00Z", "No", NOW)).toBe("inactive");
  });
});
