import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { token } = await req.json();
    const uuid = String(token ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
      return json({ error: "invalid", message: "This confirmation link isn't valid." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: lead, error } = await supabase
      .from("leads")
      .select("id, first_name, email, naics_code, verified, token_expires_at")
      .eq("verify_token", uuid)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!lead) return json({ error: "invalid", message: "This confirmation link isn't valid." }, 404);

    if (new Date(lead.token_expires_at).getTime() < Date.now()) {
      return json(
        { error: "expired", message: "This confirmation link has expired. Please sign up again." },
        410,
      );
    }

    const alreadyVerified = lead.verified === true;

    if (!alreadyVerified) {
      await supabase
        .from("leads")
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq("id", lead.id);

      const questions = `
        <p>Use these questions to get clear on your next best step:</p>
        <ol style="padding-left:22px;margin:18px 0">
          <li>What do you most want to happen?</li>
          <li>What kind of work do you do?</li>
          <li>Where are you today in the government contracting process?</li>
          <li>How much experience do you have with bidding?</li>
          <li>What budget are you comfortable starting with?</li>
          <li>When do you want to see results?</li>
        </ol>
        <p>Reply with your answers, and we can point you toward the best starting option.</p>`;

      const html = `
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#171717">
          <h2 style="font-family:Georgia,serif;color:#111;margin:0 0 12px">You're confirmed, ${esc(lead.first_name)}</h2>
          <p>Thanks for confirming your email${lead.naics_code ? ` — your NAICS code is <strong>${esc(lead.naics_code)}</strong>` : ""}.</p>
          ${lead.naics_code ? questions : "<p>Towan will review your details before your strategy session and follow up with next steps.</p>"}
        </div>`;

      try {
        const res = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              to: lead.email,
              subject: lead.naics_code
                ? "You're confirmed — your GovCon starting-point questions"
                : "You're confirmed — your strategy session request",
              html,
              purpose: "transactional",
              idempotency_key: `lead-confirmed-${lead.id}`,
            }),
          },
        );
        if (!res.ok) console.error("Thank-you email failed:", res.status, await res.text());
      } catch (e) {
        console.error("Thank-you email error:", e instanceof Error ? e.message : String(e));
      }
    }

    return json({
      ok: true,
      firstName: lead.first_name,
      naicsCode: lead.naics_code,
      alreadyVerified,
    });
  } catch (e) {
    console.error("lead-verify error:", e instanceof Error ? e.message : String(e));
    return json({ error: "unexpected", message: "We couldn't confirm your email." }, 500);
  }
});
