import { PRODUCTS, corsHeaders, json, squareConfig, squareFetch } from "../_shared/square.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const cfg = squareConfig();

    if (body.action === "status") return json({ configured: cfg.configured, environment: cfg.environment });

    const key = String(body.product ?? "");
    const product = PRODUCTS[key];
    if (!product) return json({ error: "Unknown product" }, 400);
    if (!cfg.configured) return json({ configured: false }, 200);

    const origin = String(body.origin ?? "");
    if (!/^https?:\/\/[^\s/]+$/.test(origin)) return json({ error: "Invalid origin" }, 400);
    const email = typeof body.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) && body.email.length < 255
      ? body.email : undefined;

    const data = await squareFetch("/v2/online-checkout/payment-links", {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        quick_pay: {
          name: product.name,
          price_money: { amount: product.cents, currency: "USD" },
          location_id: cfg.locationId,
        },
        checkout_options: { redirect_url: `${origin}${product.returnPath}` },
        ...(email && { pre_populated_data: { buyer_email: email } }),
      }),
    });
    const url = data?.payment_link?.url ?? data?.payment_link?.long_url;
    if (!url) throw new Error("No payment link URL returned");
    return json({ configured: true, url, environment: cfg.environment });
  } catch (e) {
    console.error("square-checkout error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Could not start checkout. Please try again." }, 500);
  }
});
