import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import Stripe from "https://esm.sh/stripe@22.0.2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const ALLOWED_PRICES = ["opportunity_reports_monthly"];
const Body = z.object({ priceId: z.enum(ALLOWED_PRICES as [string]), returnUrl: z.string().url().max(500), environment: z.enum(["sandbox", "live"]) });

async function resolveOrCreateCustomer(stripe: Stripe, options: { email?: string; userId?: string }): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({ ...(options.email && { email: options.email }), ...(options.userId && { metadata: { userId: options.userId } }) });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const { priceId, returnUrl, environment } = parsed.data;
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
    const { data: { user } } = token ? await sb.auth.getUser(token) : { data: { user: null } };
    if (!user?.email) return json({ error: "Sign in to subscribe." }, 401);
    const { data: active } = await sb.rpc("has_active_subscription", { user_uuid: user.id, check_env: environment });
    if (active) return json({ error: "You already have an active subscription." }, 409);

    const stripe = createStripeClient(environment as StripeEnv);
    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) return json({ error: "Price not found" }, 404);
    const customerId = await resolveOrCreateCustomer(stripe, { email: user.email, userId: user.id });
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      customer: customerId,
      managed_payments: { enabled: true },
      metadata: { userId: user.id, managed_payments: "true" },
      subscription_data: { metadata: { userId: user.id } },
    } as Stripe.Checkout.SessionCreateParams);
    return json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error("create-checkout error", e);
    return json({ error: e instanceof Error ? e.message : "Checkout failed" }, 500);
  }
});
