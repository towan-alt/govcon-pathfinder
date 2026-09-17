import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    let days = 30;
    try {
      const body = await req.json();
      const d = Number(body?.days);
      if ([7, 30, 90, 365].includes(d)) days = d;
    } catch { /* default */ }

    const since = new Date(Date.now() - days * 86400000).toISOString();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [{ data: kits, error: kitErr }, { data: leads, error: leadErr }] = await Promise.all([
      supabase
        .from("kit_leads")
        .select("email, verified, download_count, created_at, source")
        .gte("created_at", since),
      supabase.from("leads").select("email, created_at"),
    ]);

    if (kitErr) throw new Error(kitErr.message);
    if (leadErr) throw new Error(leadErr.message);

    const bookedEmails = new Map<string, string>();
    for (const l of leads ?? []) {
      const e = String(l.email ?? "").trim().toLowerCase();
      if (!e) continue;
      const prev = bookedEmails.get(e);
      if (!prev || new Date(l.created_at) < new Date(prev)) bookedEmails.set(e, l.created_at);
    }

    const rows = (kits ?? []).map((k) => {
      const email = String(k.email ?? "").trim().toLowerCase();
      const bookedAt = bookedEmails.get(email) ?? null;
      const daysToBook =
        bookedAt && new Date(bookedAt) >= new Date(k.created_at)
          ? Math.round((new Date(bookedAt).getTime() - new Date(k.created_at).getTime()) / 86400000)
          : null;
      return {
        verified: !!k.verified,
        downloaded: (k.download_count ?? 0) > 0,
        booked: !!bookedAt,
        daysToBook,
        source: k.source || "unknown",
      };
    });

    const subscribers = rows.length;
    const verified = rows.filter((r) => r.verified).length;
    const downloaded = rows.filter((r) => r.downloaded).length;
    const booked = rows.filter((r) => r.booked).length;

    const waits = rows.map((r) => r.daysToBook).filter((d): d is number => d !== null);
    const avgDaysToBook = waits.length
      ? Math.round((waits.reduce((a, b) => a + b, 0) / waits.length) * 10) / 10
      : null;

    const bySourceMap = new Map<string, { subscribers: number; verified: number; downloaded: number; booked: number }>();
    for (const r of rows) {
      const row = bySourceMap.get(r.source) ?? { subscribers: 0, verified: 0, downloaded: 0, booked: 0 };
      row.subscribers += 1;
      if (r.verified) row.verified += 1;
      if (r.downloaded) row.downloaded += 1;
      if (r.booked) row.booked += 1;
      bySourceMap.set(r.source, row);
    }

    return json({
      ok: true,
      days,
      totals: { subscribers, verified, downloaded, booked, avgDaysToBook },
      bySource: [...bySourceMap.entries()]
        .map(([source, v]) => ({ source, ...v }))
        .sort((a, b) => b.subscribers - a.subscribers),
    });
  } catch (e) {
    console.error("kit-sales error:", e instanceof Error ? e.message : String(e));
    return json({ error: "server", message: "Could not load the lead-to-sale numbers." }, 500);
  }
});
