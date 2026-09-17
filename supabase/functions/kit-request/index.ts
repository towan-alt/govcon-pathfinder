import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const NOTIFY_TO = "towan@Isomglobal.com";

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const firstName = String(body.firstName ?? "").trim().slice(0, 80);
    const lastName = String(body.lastName ?? "").trim().slice(0, 80);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
    const phone = String(body.phone ?? "").trim().slice(0, 40) || null;
    const businessName = String(body.businessName ?? "").trim().slice(0, 200) || null;
    const origin = String(body.origin ?? "").replace(/\/$/, "");


    if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Please enter your first name, last name and a valid email." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from("kit_leads")
      .select("id, verified")
      .eq("email", email)
      .maybeSingle();

    let leadId: string | null = null;

    if (existing) {
      const { error } = await supabase
        .from("kit_leads")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          business_name: businessName,
          verify_token: token,
          token_expires_at: expires,
          device: String(body.device ?? "") || null,
          source: String(body.source ?? "") || null,
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      leadId = existing.id;
    } else {
      const { data, error } = await supabase
        .from("kit_leads")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          business_name: businessName,
          verify_token: token,
          token_expires_at: expires,
          device: String(body.device ?? "") || null,
          source: String(body.source ?? "") || null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      leadId = data.id;
    }


    const confirmUrl = `${origin}/kit/confirm?token=${token}`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a;line-height:1.6">
        <h2 style="font-family:Georgia,serif;color:#111">Confirm your email to get the GovCon Launch Kit</h2>
        <p>Hi ${esc(firstName)},</p>
        <p>One quick step: confirm your email and your copy of the <strong>GovCon Launch Kit Booklet</strong> unlocks instantly.</p>
        <p style="margin:28px 0">
          <a href="${confirmUrl}" style="background:#C9A84C;color:#111;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:6px;display:inline-block">Confirm &amp; download the kit</a>
        </p>
        <p style="font-size:13px;color:#666">Or paste this link into your browser:<br>${esc(confirmUrl)}</p>
        <p style="font-size:13px;color:#666">This link expires in 7 days. If you didn't request the kit, you can ignore this email.</p>
        <p style="margin-top:28px">— Towan Isom, GoGovCon</p>
      </div>`;

    let emailSent = false;
    try {
      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          to: email,
          subject: "Confirm your email — GovCon Launch Kit",
          html,
          purpose: "transactional",
          idempotency_key: `kit-verify-${token}`,
        }),
      });
      emailSent = res.ok;
      if (!res.ok) console.error("Verification email failed:", res.status, await res.text());
    } catch (e) {
      console.error("Verification email error:", e instanceof Error ? e.message : String(e));
    }

    // Owner notification (best effort)
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          to: NOTIFY_TO,
          subject: `Launch Kit request: ${firstName} ${lastName} (${email})`,
          html: `<p><strong>${esc(firstName)} ${esc(lastName)}</strong> requested the GovCon Launch Kit.</p>
                 <p>Email: ${esc(email)}<br>Phone: ${esc(phone ?? "—")}<br>Business: ${esc(businessName ?? "—")}<br>Source: ${esc(body.source ?? "—")}</p>`,

          purpose: "transactional",
          idempotency_key: `kit-notify-${token}`,
        }),
      });
    } catch { /* never block the visitor */ }

    return new Response(JSON.stringify({ ok: true, id: leadId, emailSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("kit-request error:", e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
