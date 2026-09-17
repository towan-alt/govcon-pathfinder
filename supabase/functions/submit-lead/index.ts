import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NOTIFY_TO = "towan@Isomglobal.com";

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Name and a valid email are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const row = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone: String(body.phone ?? "").trim() || null,
      business_name: String(body.businessName ?? "").trim() || null,
      industry: String(body.industry ?? "") || null,
      sam_status: String(body.samStatus ?? "") || null,
      certifications: Array.isArray(body.certifications) ? body.certifications.map(String) : [],
      journey_stage: String(body.journeyStage ?? "") || null,
      revenue: String(body.revenue ?? "") || null,
      contract_size: String(body.contractSize ?? "") || null,
      contract_strategy: String(body.contractStrategy ?? "") || null,
      target_agencies: String(body.targetAgencies ?? "").slice(0, 2000) || null,
      biggest_challenge: String(body.biggestChallenge ?? "").slice(0, 4000) || null,
      referral_source: String(body.referralSource ?? "") || null,
      recommendation: String(body.recommendation ?? "") || null,
      naics_code: String(body.naicsCode ?? "").trim().slice(0, 12) || null,
      device: String(body.device ?? "") || null,
      source: String(body.source ?? "") || null,
    };

    const { data: lead, error } = await supabase
      .from("leads")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to store lead:", error.message);
      return new Response(
        JSON.stringify({ error: "Could not save your request.", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Email notification. Sending activates once the sender domain is verified;
    // the lead is always stored either way.
    const fields: Array<[string, unknown]> = [
      ["Name", `${firstName} ${lastName}`],
      ["Email", email],
      ["Phone", row.phone],
      ["Business", row.business_name],
      ["Industry", row.industry],
      ["SAM.gov status", row.sam_status],
      ["Certifications", row.certifications.join(", ")],
      ["Stage", row.journey_stage],
      ["Revenue", row.revenue],
      ["Target contract size", row.contract_size],
      ["Contract strategy", row.contract_strategy],
      ["Target agencies", row.target_agencies],
      ["Biggest challenge", row.biggest_challenge],
      ["Found you via", row.referral_source],
      ["Quiz recommendation", row.recommendation],
      ["NAICS code", row.naics_code],
      ["Device", row.device],
      ["Traffic source", row.source],
    ];

    const html = `
      <h2 style="font-family:Georgia,serif">${row.naics_code ? "New NAICS Finder subscriber" : "New strategy session request"}</h2>
      <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">
        ${fields
          .filter(([, v]) => v !== null && v !== undefined && String(v) !== "")
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 14px 6px 0;color:#666">${esc(k)}</td><td style="padding:6px 0"><strong>${esc(v)}</strong></td></tr>`,
          )
          .join("")}
      </table>`;

    let notified = false;
    try {
      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          to: NOTIFY_TO,
          subject: row.naics_code
            ? `NAICS Finder subscriber: ${firstName} ${lastName} — ${row.naics_code}`
            : `New lead: ${firstName} ${lastName}${row.business_name ? ` — ${row.business_name}` : ""}`,
          html,
          purpose: "transactional",
          idempotency_key: `lead-${lead.id}`,
        }),
      });
      notified = res.ok;
      if (!res.ok) console.error("Email send failed:", res.status, await res.text());
    } catch (e) {
      console.error("Email send error:", e instanceof Error ? e.message : String(e));
    }

    if (notified) {
      await supabase.from("leads").update({ notified: true }).eq("id", lead.id);
    }

    return new Response(JSON.stringify({ ok: true, id: lead.id, notified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-lead error:", e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
