import { createClient } from "npm:@supabase/supabase-js@2";
import { PRODUCTS, productKeyForItems, corsHeaders, json } from "../_shared/payhip.ts";

// Receives Payhip "paid" webhooks (Settings -> Developer -> Webhooks).
// Payhip posts sale data; there is no signature header, so the payload is
// treated as untrusted and each sale is recorded idempotently by sale id.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Bad payload" }, 400);

    const saleId = String(body.id ?? "");
    const email = String(body.email ?? "").toLowerCase().trim();
    const items = Array.isArray(body.items) ? body.items : [];
    const productKey = productKeyForItems(items);
    if (!saleId || !email || !productKey) return json({ ok: false, reason: "unmatched" });
    const product = PRODUCTS[productKey];
    if (!product) return json({ ok: false, reason: "unknown_product" });

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Idempotent: a repeated webhook for the same sale does nothing.
    const { data: inserted, error: insErr } = await sb
      .from("purchases")
      .insert({ sale_id: saleId, email, product: productKey, price_cents: Number(body.price ?? 0) || null, payload: body })
      .select("id")
      .single();
    if (insErr) {
      if (String(insErr.code) === "23505") return json({ ok: true, duplicate: true });
      console.error("purchase insert failed:", insErr.message);
      return json({ error: "record failed" }, 500);
    }
    if (!inserted) return json({ ok: true });

    const origin = "https://gogovcon.com";
    const now = new Date().toISOString();

    // Stop the training and assessment follow-up sequences for this buyer.
    await sb.from("training_registrations").update({ purchased_at: now }).ilike("email", email).is("purchased_at", null);
    await sb.from("assessment_results").update({ purchased_at: now }).ilike("email", email).is("purchased_at", null);

    const isKit = productKey === "launch_kit";
    const isVip = productKey === "vip_engagement";
    const isReview = productKey === "readiness_review_bundle";

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const { EMAIL_FROM, MAILING_ADDRESS } = await import("../_shared/training-templates.ts");
    const sendEmail = async (subject: string, html: string, idemKey: string) => {
      if (!resendKey) return;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": idemKey },
        body: JSON.stringify({ from: EMAIL_FROM, to: [email], subject, html }),
      });
      if (!r.ok) console.error(`email failed [${r.status}]: ${(await r.text()).slice(0, 200)}`);
    };
    const shell = (inner: string) => `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Montserrat,Arial,sans-serif;color:#231F20">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#231F20;padding:20px 28px;border-bottom:4px solid #B79B44"><span style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#ffffff">Go<span style="color:#B79B44">GovCon</span></span></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">${inner}</td></tr>
<tr><td style="background:#F4F4F4;padding:18px 28px;font-size:12px;line-height:1.5">You received this because you purchased from GoGovCon.<br>${MAILING_ADDRESS}</td></tr>
</table></td></tr></table></body></html>`;

    if (isKit) {
      const kitUrl = `${origin}/launch-kit/confirmed`;
      const html = shell(`
<p style="margin:0 0 16px">Hi,</p>
<p style="margin:0 0 16px">Your GovCon Launch Kit is confirmed. This email is your receipt for the $19 one-time purchase. Your download is ready whenever you are:</p>
<p style="margin:24px 0"><a href="${kitUrl}" style="display:inline-block;background:#B79B44;color:#231F20;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:6px">Download My Launch Kit</a></p>
<p style="margin:0 0 16px">You have the roadmap. Now find out how ready your business is and which agencies you should target with the Comprehensive Readiness Review.</p>
<p style="margin:24px 0 0">To your success,<br><strong>Towan Isom</strong><br>Founder, GoGovCon</p>`);
      await sendEmail("Your GovCon Launch Kit: receipt and download", html, `kit-${saleId}`);
    }

    if (isVip || isReview) {
      let creditRedeemed = false;
      if (isVip) {
        // Redeem an active $497 credit from a Readiness Review purchase (single use).
        const { data: prior } = await sb.from("clients").select("id, credit_expires_at")
          .ilike("email", email).eq("product", "readiness_review_bundle")
          .is("credit_redeemed_at", null).gt("credit_expires_at", now).limit(1);
        if (prior?.length) {
          await sb.from("clients").update({ credit_redeemed_at: now }).eq("id", prior[0].id);
          creditRedeemed = true;
        }
      }
      const { data: client } = await sb.from("clients").insert({
        email,
        product: productKey,
        ...(isReview && { credit_expires_at: new Date(Date.now() + 14 * 86400000).toISOString() }),
      }).select("portal_token").single();

      if (client) {
        const portalUrl = `${origin}/portal?t=${client.portal_token}`;
        const subject = isVip ? "Your VIP Engagement: next steps" : "Your Readiness Review: complete your intake";
        const bodyLine = isVip
          ? "Your VIP Engagement is confirmed. Use your private portal to complete your intake and share your materials so Towan can prepare for your two-hour intensive."
          : "Your Readiness Review is confirmed. Use your private portal to complete your intake, upload your documents, and see the materials to prepare before your 60-minute planning session with Towan.";
        const creditLine = creditRedeemed
          ? `<p style="margin:16px 0 0">Your $497 Readiness Review credit has been applied to this purchase.</p>`
          : "";
        const html = shell(`
<p style="margin:0 0 16px">Hi,</p>
<p style="margin:0 0 16px">${bodyLine}</p>
<p style="margin:24px 0"><a href="${portalUrl}" style="display:inline-block;background:#B79B44;color:#231F20;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:6px">Complete My Intake &amp; Upload Documents</a></p>
<p style="margin:0 0 8px;font-size:13px">Please have your intake in before your session so Towan can review everything first. The portal saves your progress, and anything you do not have yet can be marked as such.</p>
${creditLine}
<p style="margin:24px 0 0">To your success,<br><strong>Towan Isom</strong><br>Founder, GoGovCon</p>`);
        await sendEmail(subject, html, `portal-${client.portal_token}`);
      }
    }

    return json({ ok: true });
  } catch (e) {
    console.error("payhip-webhook error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Webhook failed" }, 500);
  }
});
