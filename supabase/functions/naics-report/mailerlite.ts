type NaicsContact = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  naics: string;
  businessName: string;
  description: string;
  website: string;
  industries: string;
};

/** Use the existing NAICS report group, never an assessment group or a new empty automation group. */
export async function syncNaicsMailerLite(contact: NaicsContact, key: string | undefined, request: typeof fetch = fetch, configuredGroup?: string) {
  if (!key) return { status: "skipped", reason: "MailerLite is not configured" };
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" };
  const call = async (path: string, body?: unknown) => {
    const res = await request(`https://connect.mailerlite.com/api${path}`, {
      method: body === undefined ? "GET" : "POST", headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`MailerLite [${res.status}]: ${(await res.text()).slice(0, 1000)}`);
    return res.json();
  };
  try {
    const result = configuredGroup ? { data: [{ id: configuredGroup, name: "NAICS report" }] } : await call("/groups?filter[name]=NAICS%20report&limit=100");
    const groups = Array.isArray(result.data) ? result.data : [];
    const matching = groups.filter((g: { name?: string }) => g.name?.trim().toLowerCase() === "naics report");
    if (matching.length !== 1) throw new Error('Exactly one MailerLite group named "NAICS report" is required');
    const groupId = String(matching[0].id);
    const customFields: Record<string, string> = {
      naics_code: contact.naics, business_name: contact.businessName,
      business_description: contact.description, business_website: contact.website, industries: contact.industries,
    };
    const existing = await call("/fields?limit=100");
    const fieldKeys = new Set((existing.data ?? []).map((f: { key: string }) => f.key));
    for (const name of Object.keys(customFields)) {
      if (!fieldKeys.has(name)) await call("/fields", { name, type: "text" });
    }
    const subscriber = await call("/subscribers", {
      email: contact.email, groups: [groupId],
      // Do not force active status: MailerLite retains unsubscribed contacts' preferences.
      fields: { name: contact.firstName, last_name: contact.lastName, phone: contact.phone, ...customFields },
    });
    if (!subscriber.data?.id) throw new Error("MailerLite did not return a saved subscriber");
    return { status: "synced", subscriberId: String(subscriber.data.id), groupId };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "MailerLite sync failed";
    console.error("NAICS MailerLite sync failed:", reason);
    return { status: "failed", reason };
  }
}