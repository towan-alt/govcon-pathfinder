// Server-side Payhip product catalog. Keep in sync with PAYHIP_PRODUCTS in src/lib/funnel.ts.
// Prices live here so the browser never sets its own price; the webhook maps each
// Payhip product permalink back to one of these keys.
export const PRODUCTS: Record<string, { name: string; cents: number; returnPath: string }> = {
  launch_kit: { name: "GovCon Launch Kit", cents: 1900, returnPath: "/launch-kit/confirmed" },
  readiness_review_bundle: { name: "Readiness Review Bundle", cents: 49700, returnPath: "/readiness-review/confirmed" },
  vip_engagement: { name: "VIP Engagement", cents: 250000, returnPath: "/vip-engagement/confirmed" },
};

// Payhip permalink -> product key. Fill in when the Payhip products exist.
// Permalinks look like "https://payhip.com/b/RGsF"; match on the trailing code.
export const PERMALINK_TO_PRODUCT: Record<string, string> = {
  // "RGsF": "launch_kit",
};

export function productKeyForItems(items: Array<{ product_permalink?: string; product_key?: string }>): string | null {
  for (const item of items ?? []) {
    const link = String(item.product_permalink ?? "");
    const code = link.split("/").filter(Boolean).pop() ?? String(item.product_key ?? "");
    if (code && PERMALINK_TO_PRODUCT[code]) return PERMALINK_TO_PRODUCT[code];
  }
  return null;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
