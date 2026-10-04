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
    return json({ paid, email, name: null });
  } catch (e) {
    console.error("square-verify error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Could not verify payment." }, 500);
  }
});
