import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId ?? "");
    const environment = body.environment as StripeEnv;
    if (!/^cs_[a-zA-Z0-9_]+$/.test(sessionId) || sessionId.length > 300) return json({ error: "Invalid session" }, 400);
    if (environment !== "sandbox" && environment !== "live") return json({ error: "Invalid environment" }, 400);

    const stripe = createStripeClient(environment);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    return json({
      paid,
      email: session.customer_details?.email ?? null,
      name: session.customer_details?.name ?? null,
    });
  } catch (e) {
    console.error("verify-checkout error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Could not verify payment." }, 500);
  }
});
