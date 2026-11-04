// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { syncNaicsMailerLite } from "../../supabase/functions/naics-report/mailerlite";

const contact = { email: "test@example.com", firstName: "Test", lastName: "Owner", phone: "2025550100", naics: "541611", businessName: "Example", description: "Consulting", website: "https://example.com", industries: "Professional services" };
const fieldNames = ["naics_code", "business_name", "business_description", "business_website", "industries"];

describe("NAICS report MailerLite synchronization", () => {
  it("saves all form data in the NAICS report group, not the assessment group", async () => {
    const request = vi.fn().mockResolvedValueOnce(Response.json({ data: [{ id: "123", name: "NAICS report" }, { id: "456", name: "Assessment" }] }))
      .mockResolvedValueOnce(Response.json({ data: fieldNames.map(key => ({ key })) }))
      .mockResolvedValueOnce(Response.json({ data: { id: "subscriber" } }));
    expect(await syncNaicsMailerLite(contact, "test-key", request)).toEqual({ status: "synced", subscriberId: "subscriber", groupId: "123" });
    const payload = JSON.parse(request.mock.calls[2][1].body);
    expect(payload).toEqual({ email: "test@example.com", groups: ["123"], fields: { name: "Test", last_name: "Owner", phone: "2025550100", naics_code: "541611", business_name: "Example", business_description: "Consulting", business_website: "https://example.com", industries: "Professional services" } });
    expect(payload).not.toHaveProperty("status");
  });
  it("does not create a new group when the configured automation group is missing", async () => {
    const request = vi.fn().mockResolvedValue(Response.json({ data: [] }));
    expect((await syncNaicsMailerLite(contact, "test-key", request)).status).toBe("failed");
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("keeps report submission available if MailerLite rejects the sync", async () => {
    const request = vi.fn().mockResolvedValue(new Response("Invalid token", { status: 401 }));
    expect((await syncNaicsMailerLite(contact, "test-key", request)).status).toBe("failed");
  });
});