import Stripe from "https://esm.sh/stripe@22.0.2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string },
): Promise<string | undefined> {
  if (!options.email) return undefined;
  const existing = await stripe.customers.list({ email: options.email, limit: 1 });
  if (existing.data.length) return existing.data[0].id;
  const created = await stripe.customers.create({ email: options.email });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const priceId = String(body.priceId ?? "");
    const environment = body.environment as StripeEnv;
    const returnUrl = String(body.returnUrl ?? "");
    const customerEmail = body.customerEmail ? String(body.customerEmail) : undefined;

    if (!/^[a-zA-Z0-9_-]+$/.test(priceId)) throw new Error("Invalid priceId");
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");
    if (!returnUrl.startsWith("http")) throw new Error("Invalid returnUrl");

    const stripe = createStripeClient(environment);

    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) throw new Error("Price not found");
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const productId = typeof stripePrice.product === "string"
      ? stripePrice.product
      : stripePrice.product.id;
    const product = await stripe.products.retrieve(productId);

    const customerId = await resolveOrCreateCustomer(stripe, { email: customerEmail });

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerId && { customer: customerId }),
      ...(!isRecurring && { payment_intent_data: { description: product.name } }),
      managed_payments: { enabled: true },
      metadata: { managed_payments: "true", product: product.name },
    } as Stripe.Checkout.SessionCreateParams);

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: "Could not start checkout. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
