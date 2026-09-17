import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Event = {
  event_name: string;
  cta_id: string | null;
  device: string | null;
  source: string | null;
  session_id: string | null;
  created_at: string;
};

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const pct = (a: number, b: number) => (b === 0 ? "—" : `${((a / b) * 100).toFixed(1)}%`);

const Analytics = () => {
  const [days, setDays] = useState(30);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const since = new Date(Date.now() - days * 86400000).toISOString();

    supabase
      .from("funnel_events")
      .select("event_name, cta_id, device, source, session_id, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) setError("Couldn't load the numbers right now.");
        else setEvents((data ?? []) as Event[]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days]);

  const stats = useMemo(() => {
    const sessions = new Map<string, { device: string; source: string; clicked: boolean; viewed: boolean; booked: boolean }>();

    for (const e of events) {
      const key = e.session_id ?? "unknown";
      const s =
        sessions.get(key) ??
        { device: e.device ?? "unknown", source: e.source ?? "unknown", clicked: false, viewed: false, booked: false };
      if (e.event_name === "cta_click") s.clicked = true;
      if (e.event_name === "book_view") s.viewed = true;
      if (e.event_name === "book_submit") s.booked = true;
      sessions.set(key, s);
    }

    const all = [...sessions.values()];

    const group = (field: "device" | "source") => {
      const map = new Map<string, { total: number; clicked: number; viewed: number; booked: number }>();
      for (const s of all) {
        const k = s[field] || "unknown";
        const row = map.get(k) ?? { total: 0, clicked: 0, viewed: 0, booked: 0 };
        row.total += 1;
        if (s.clicked) row.clicked += 1;
        if (s.viewed) row.viewed += 1;
        if (s.booked) row.booked += 1;
        map.set(k, row);
      }
      return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
    };

    const ctaMap = new Map<string, { clicks: number; booked: number }>();
    const clickedCtaBySession = new Map<string, Set<string>>();
    for (const e of events) {
      if (e.event_name !== "cta_click" || !e.cta_id) continue;
      const row = ctaMap.get(e.cta_id) ?? { clicks: 0, booked: 0 };
      row.clicks += 1;
      ctaMap.set(e.cta_id, row);
      const set = clickedCtaBySession.get(e.session_id ?? "unknown") ?? new Set<string>();
      set.add(e.cta_id);
      clickedCtaBySession.set(e.session_id ?? "unknown", set);
    }
    for (const [sessionId, ctas] of clickedCtaBySession) {
      if (!sessions.get(sessionId)?.booked) continue;
      for (const cta of ctas) {
        const row = ctaMap.get(cta);
        if (row) row.booked += 1;
      }
    }

    return {
      totals: {
        sessions: all.length,
        clicked: all.filter((s) => s.clicked).length,
        viewed: all.filter((s) => s.viewed).length,
        booked: all.filter((s) => s.booked).length,
      },
      byDevice: group("device"),
      bySource: group("source"),
      byCta: [...ctaMap.entries()].sort((a, b) => b[1].clicks - a[1].clicks),
    };
  }, [events]);

  const t = stats.totals;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-14 max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <Link to="/" className="text-xs font-semibold uppercase tracking-[0.18em] text-primary font-display">
              GoGovCon
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
              Funnel performance
            </h1>
            <p className="text-muted-foreground mt-2">
              How many visitors click a button, reach the booking page, and finish the form.
            </p>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  days === r.days
                    ? "border-primary bg-primary text-black font-semibold"
                    : "border-border text-muted-foreground hover:border-primary/60"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && <p className="text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="space-y-12">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Visitors", value: t.sessions, sub: "unique visits" },
                { label: "Clicked a button", value: t.clicked, sub: pct(t.clicked, t.sessions) + " of visitors" },
                { label: "Reached booking page", value: t.viewed, sub: pct(t.viewed, t.sessions) + " of visitors" },
                { label: "Completed the form", value: t.booked, sub: pct(t.booked, t.viewed) + " of booking visits" },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-border bg-card p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="font-display text-4xl font-extrabold text-primary mt-3">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {[
              { title: "By device", rows: stats.byDevice },
              { title: "By source", rows: stats.bySource },
            ].map((table) => (
              <div key={table.title} className="space-y-4">
                <h2 className="font-display text-xl font-bold text-foreground">{table.title}</h2>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Visitors</th>
                        <th className="px-4 py-3 font-semibold">Clicked</th>
                        <th className="px-4 py-3 font-semibold">Reached booking</th>
                        <th className="px-4 py-3 font-semibold">Completed</th>
                        <th className="px-4 py-3 font-semibold">Conversion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.length === 0 && (
                        <tr>
                          <td className="px-4 py-4 text-muted-foreground" colSpan={6}>
                            No visits recorded yet.
                          </td>
                        </tr>
                      )}
                      {table.rows.map(([name, r]) => (
                        <tr key={name} className="border-t border-border">
                          <td className="px-4 py-3 font-medium capitalize">{name}</td>
                          <td className="px-4 py-3">{r.total}</td>
                          <td className="px-4 py-3">{r.clicked}</td>
                          <td className="px-4 py-3">{r.viewed}</td>
                          <td className="px-4 py-3">{r.booked}</td>
                          <td className="px-4 py-3 font-semibold text-primary">{pct(r.booked, r.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground">By button</h2>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Button</th>
                      <th className="px-4 py-3 font-semibold">Clicks</th>
                      <th className="px-4 py-3 font-semibold">Led to a completed form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byCta.length === 0 && (
                      <tr>
                        <td className="px-4 py-4 text-muted-foreground" colSpan={3}>
                          No clicks recorded yet.
                        </td>
                      </tr>
                    )}
                    {stats.byCta.map(([cta, r]) => (
                      <tr key={cta} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{cta.replace(/-/g, " ")}</td>
                        <td className="px-4 py-3">{r.clicks}</td>
                        <td className="px-4 py-3 font-semibold text-primary">{r.booked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
