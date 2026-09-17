import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKET = "lead-magnets";
const FILE = "govcon-launch-kit.pdf";

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
      .from("kit_leads")
      .select("id, first_name, token_expires_at, download_count")
      .eq("verify_token", uuid)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!lead) return json({ error: "invalid", message: "This confirmation link isn't valid." }, 404);

    if (new Date(lead.token_expires_at).getTime() < Date.now()) {
      return json({ error: "expired", message: "This confirmation link has expired. Request the kit again." }, 410);
    }

    await supabase
      .from("kit_leads")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        download_count: (lead.download_count ?? 0) + 1,
      })
      .eq("id", lead.id);

    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(FILE, 60 * 60 * 24, { download: "GovCon-Launch-Kit-Booklet.pdf" });

    if (signErr || !signed) throw new Error(signErr?.message ?? "Could not create download link");

    return json({ ok: true, firstName: lead.first_name, url: signed.signedUrl });
  } catch (e) {
    console.error("kit-verify error:", e instanceof Error ? e.message : String(e));
    return json({ error: "server", message: "Something went wrong. Please try again." }, 500);
  }
});
