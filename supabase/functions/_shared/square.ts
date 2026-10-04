// Server-side product catalog. Keep in sync with SQUARE_PRODUCTS in src/lib/funnel.ts.
// Prices live here too so the browser can never set its own price.
export const PRODUCTS: Record<string, { name: string; cents: number; returnPath: string }> = {
  readiness_review_bundle: { name: "Readiness Review Bundle", cents: 49700, returnPath: "/readiness-review/confirmed" },
  launch_kit_pro: { name: "GovCon Launch Kit Pro", cents: 9700, returnPath: "/checkout/return" },
};

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

export function squareConfig() {
  const token = Deno.env.get("SQUARE_ACCESS_TOKEN") ?? "";
  const locationId = Deno.env.get("SQUARE_LOCATION_ID") ?? "";
  const environment = (Deno.env.get("SQUARE_ENVIRONMENT") ?? "sandbox").toLowerCase() === "production" ? "production" : "sandbox";
  const base = environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
  return { configured: Boolean(token && locationId), token, locationId, environment, base };
}

export async function squareFetch(path: string, init: RequestInit = {}) {
  const cfg = squareConfig();
  const res = await fetch(`${cfg.base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Square-Version": "2025-01-23",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Square ${res.status}: ${JSON.stringify(data?.errors ?? data).slice(0, 300)}`);
  return data;
}
