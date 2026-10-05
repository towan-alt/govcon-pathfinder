import { createClient } from "npm:@supabase/supabase-js@2";
import { PRODUCTS, corsHeaders, json } from "../_shared/payhip.ts";

// Confirmation pages call this with the buyer's email to check whether the
// Payhip webhook has recorded their purchase. Returns only a paid flag.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").toLowerCase().trim();
    const productKey = String(body.product ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Invalid email" }, 400);
    if (!PRODUCTS[productKey]) return json({ error: "Unknown product" }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data } = await sb.from("purchases").select("id")
      .ilike("email", email).eq("product", productKey).limit(1);
    return json({ paid: Boolean(data?.length) });
  } catch (e) {
    console.error("payhip-lookup error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Lookup failed" }, 500);
  }
});
