import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const Body = z.object({ returnUrl: z.string().url().max(500).optional(), environment: z.enum(["sandbox", "live"]) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
    const { data: { user } } = token ? await sb.auth.getUser(token) : { data: { user: null } };
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: sub } = await sb.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).eq("environment", parsed.data.environment).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: "No subscription found" }, 404);
    const stripe = createStripeClient(parsed.data.environment as StripeEnv);
    const portal = await stripe.billingPortal.sessions.create({ customer: sub.stripe_customer_id, ...(parsed.data.returnUrl && { return_url: parsed.data.returnUrl }) });
    return json({ url: portal.url });
  } catch (e) {
    console.error("portal error", e);
    return json({ error: "Could not open billing portal" }, 500);
  }
});
