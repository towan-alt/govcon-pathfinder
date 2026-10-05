import { createClient } from "npm:@supabase/supabase-js@2";
import { PRODUCTS, corsHeaders, json, squareConfig, squareFetch } from "../_shared/square.ts";

// Confirms a Square payment-link checkout actually completed.
// Square appends orderId (and transactionId) to the redirect URL.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = String(body.orderId ?? "");
    const productKey = String(body.product ?? "");
    if (!/^[A-Za-z0-9_-]{6,100}$/.test(orderId)) return json({ error: "Invalid order" }, 400);
    const product = PRODUCTS[productKey];
    if (!product) return json({ error: "Unknown product" }, 400);
    const cfg = squareConfig();
    if (!cfg.configured) return json({ paid: false, reason: "not_configured" });

    const { order } = await squareFetch(`/v2/orders/${orderId}`);
    if (!order || order.location_id !== cfg.locationId) return json({ paid: false });
    const matches = (order.line_items ?? []).some((li: { name?: string }) => li.name === product.name);
    const total = Number(order.total_money?.amount ?? 0);
    if (!matches || total < product.cents) return json({ paid: false });

    let email: string | null = null;
    let paid = false;
    for (const t of order.tenders ?? []) {
      const pid = t.payment_id ?? t.id;
      if (!pid) continue;
      const { payment } = await squareFetch(`/v2/payments/${pid}`);
      if (payment?.status === "COMPLETED") {
        paid = true;
        email = payment.buyer_email_address ?? email;
      }
    }
    if (paid && email) {
      // Stops the training follow-up sequence for this buyer.
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await sb.from("training_registrations").update({ purchased_at: new Date().toISOString() })
        .ilike("email", email).is("purchased_at", null);
      await sb.from("assessment_results").update({ purchased_at: new Date().toISOString() })
        .ilike("email", email).is("purchased_at", null);

      // Create the client portal record and send the onboarding email.
      const origin = /^https?:\/\/[^\s/]+$/.test(String(body.origin ?? "")) ? String(body.origin) : "https://gogovcon.com";
      const isVip = productKey === "vip_engagement";
      const isReview = productKey === "readiness_review_bundle";
      if (isVip || isReview) {
        let creditRedeemed = false;
        if (isVip) {
          // Redeem an active $497 credit from a Readiness Review purchase (single use).
          const { data: prior } = await sb.from("clients").select("id, credit_expires_at")
            .ilike("email", email).eq("product", "readiness_review_bundle")
            .is("credit_redeemed_at", null).gt("credit_expires_at", new Date().toISOString()).limit(1);
          if (prior?.length) {
            await sb.from("clients").update({ credit_redeemed_at: new Date().toISOString() }).eq("id", prior[0].id);
            creditRedeemed = true;
          }
        }
        const { data: client } = await sb.from("clients").insert({
          email: email.toLowerCase(),
          product: productKey,
          ...(isReview && { credit_expires_at: new Date(Date.now() + 14 * 86400000).toISOString() }),
        }).select("portal_token").single();

        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (client && resendKey) {
          const { EMAIL_FROM, MAILING_ADDRESS } = await import("../_shared/training-templates.ts");
          const portalUrl = `${origin}/portal?t=${client.portal_token}`;
          const subject = isVip ? "Your VIP Engagement: next steps" : "Your Readiness Review: complete your intake";
          const bodyLine = isVip
            ? "Your VIP Engagement is confirmed. Use your private portal to complete your intake and share your materials so Towan can prepare for your two-hour intensive."
            : "Your Readiness Review is confirmed. Use your private portal to complete your intake, upload your documents, and see the materials to prepare before your 60-minute planning session with Towan.";
          const creditLine = creditRedeemed
            ? `<p style="margin:16px 0 0">Your $497 Readiness Review credit has been applied to this purchase.</p>`
            : "";
          const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Montserrat,Arial,sans-serif;color:#231F20">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#231F20;padding:20px 28px;border-bottom:4px solid #B79B44"><span style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#ffffff">Go<span style="color:#B79B44">GovCon</span></span></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">
<p style="margin:0 0 16px">Hi,</p>
<p style="margin:0 0 16px">${bodyLine}</p>
<p style="margin:24px 0"><a href="${portalUrl}" style="display:inline-block;background:#B79B44;color:#231F20;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:6px">Complete My Intake &amp; Upload Documents</a></p>
<p style="margin:0 0 8px;font-size:13px">Please have your intake in before your session so Towan can review everything first. The portal saves your progress, and anything you do not have yet can be marked as such.</p>
${creditLine}
<p style="margin:24px 0 0">To your success,<br><strong>Towan Isom</strong><br>Founder, GoGovCon</p></td></tr>
<tr><td style="background:#F4F4F4;padding:18px 28px;font-size:12px;line-height:1.5">You received this because you purchased from GoGovCon.<br>${MAILING_ADDRESS}</td></tr>
</table></td></tr></table></body></html>`;
          const r = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "Idempotency-Key": `portal-${client.portal_token}` },
            body: JSON.stringify({ from: EMAIL_FROM, to: [email], subject, html }),
          });
          if (!r.ok) console.error(`portal email failed [${r.status}]: ${(await r.text()).slice(0, 200)}`);
        }
      }
    }
    return json({ paid, email, name: null });
  } catch (e) {
    console.error("square-verify error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Could not verify payment." }, 500);
  }
});
