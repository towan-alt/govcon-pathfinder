import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type TrainingCounts = { registered: number; attended: number; watched50: number; cta: number; assessment: number; checkout: number; purchased: number };
type TrainingStats = { byType: Record<string, TrainingCounts>; messages: Record<string, { sent: number; skipped: number; failed: number }> };
const TRAINING_TYPES = [
  { key: "all", label: "All" },
  { key: "showing", label: "Showing" },
  { key: "live", label: "Live" },
  { key: "instant", label: "Instant" },
] as const;
const TRAINING_STEPS: { key: keyof TrainingCounts; label: string }[] = [
  { key: "registered", label: "Registered" },
  { key: "attended", label: "Showed up" },
  { key: "watched50", label: "Watched 50%+" },
  { key: "cta", label: "Clicked CTA" },
  { key: "assessment", label: "Completed assessment" },
  { key: "checkout", label: "Started checkout" },
  { key: "purchased", label: "Purchased" },
];

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
  const [training, setTraining] = useState<TrainingStats | null>(null);
  const [assess, setAssess] = useState<{ messages: Record<string, { sent: number; skipped: number; failed: number }>; reportViews: number; results: number; purchased: number } | null>(null);


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

    setTraining(null);
    supabase.functions.invoke("training", { body: { action: "stats", days } }).then(({ data }) => {
      if (!cancelled && data?.byType) setTraining(data as TrainingStats);
    });
    setAssess(null);
    supabase.functions.invoke("assessment", { body: { action: "stats", days } }).then(({ data }) => {
      if (!cancelled && data?.messages) setAssess(data);
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




  // Training funnel: unique sessions reaching each step
  const trainingSteps = useMemo(() => {
    const steps = [
      { key: "training_register", label: "Registered for training" },
      { key: "assessment_start", label: "Started assessment" },
      { key: "assessment_complete", label: "Completed assessment" },
      { key: "review_view", label: "Viewed Readiness Review" },
      { key: "review_checkout_start", label: "Started checkout" },
      { key: "review_purchased", label: "Purchased" },
    ];
    const sets = steps.map((st) => new Set(events.filter((e) => e.event_name === st.key).map((e) => e.session_id ?? "unknown")));
    return steps.map((st, i) => ({ ...st, count: sets[i].size }));
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

            {/* Training funnel */}
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Training funnel</h2>
                <p className="text-muted-foreground text-sm mt-1">Free training to assessment to Readiness Review purchase. Unique visitors per step.</p>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="p-3 font-semibold">Step</th>
                      <th className="p-3 font-semibold text-right">Visitors</th>
                      <th className="p-3 font-semibold text-right">From previous step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingSteps.map((st, i) => (
                      <tr key={st.key} className="border-b border-border last:border-0">
                        <td className="p-3 text-foreground">{st.label}</td>
                        <td className="p-3 text-right font-semibold text-foreground">{st.count}</td>
                        <td className="p-3 text-right text-foreground/80">{i === 0 ? "—" : pct(st.count, trainingSteps[i - 1].count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Training registrations by session type */}
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Training funnel by session type</h2>
                <p className="text-muted-foreground text-sm mt-1">Registrations matched to attendance, assessment and purchase by email.</p>
              </div>
              {!training ? (
                <p className="text-sm text-muted-foreground">Loading training numbers…</p>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="p-3 font-semibold">Step</th>
                        {TRAINING_TYPES.map((t) => <th key={t.key} className="p-3 font-semibold text-right">{t.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {TRAINING_STEPS.map((st, i) => (
                        <tr key={st.key} className="border-b border-border last:border-0">
                          <td className="p-3 text-foreground">{st.label}</td>
                          {TRAINING_TYPES.map((t) => {
                            const row = training.byType[t.key];
                            const v = row?.[st.key] ?? 0;
                            const prev = i === 0 ? null : row?.[TRAINING_STEPS[i - 1].key] ?? 0;
                            return (
                              <td key={t.key} className="p-3 text-right text-foreground">
                                <span className="font-semibold">{v}</span>
                                {prev !== null && <span className="block text-xs text-muted-foreground">{pct(v, prev)}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {training && (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="p-3 font-semibold">Follow-up message</th>
                        <th className="p-3 font-semibold text-right">Sent</th>
                        <th className="p-3 font-semibold text-right">Skipped</th>
                        <th className="p-3 font-semibold text-right">Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(training.messages).sort().map(([k, v]) => (
                        <tr key={k} className="border-b border-border last:border-0">
                          <td className="p-3 text-foreground">{k}</td>
                          <td className="p-3 text-right font-semibold text-foreground">{v.sent}</td>
                          <td className="p-3 text-right text-foreground/80">{v.skipped}</td>
                          <td className="p-3 text-right text-foreground/80">{v.failed}</td>
                        </tr>
                      ))}
                      {!Object.keys(training.messages).length && (
                        <tr><td colSpan={4} className="p-3 text-muted-foreground">No messages processed yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {assess && (
                <div className="rounded-xl border border-border bg-card overflow-x-auto">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-display text-lg font-bold text-foreground">Assessment emails</h3>
                    <p className="text-sm text-foreground/80">{assess.results} reports · {assess.reportViews} report page views · {assess.purchased} Readiness Review purchases from the assessment sequence</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="p-3 font-semibold">Message</th>
                        <th className="p-3 font-semibold text-right">Sent</th>
                        <th className="p-3 font-semibold text-right">Skipped</th>
                        <th className="p-3 font-semibold text-right">Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(assess.messages).sort().map(([k, v]) => (
                        <tr key={k} className="border-b border-border last:border-0">
                          <td className="p-3 text-foreground">{k}</td>
                          <td className="p-3 text-right font-semibold text-foreground">{v.sent}</td>
                          <td className="p-3 text-right text-foreground/80">{v.skipped}</td>
                          <td className="p-3 text-right text-foreground/80">{v.failed}</td>
                        </tr>
                      ))}
                      {!Object.keys(assess.messages).length && (
                        <tr><td colSpan={4} className="p-3 text-muted-foreground">No messages processed yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};



export default Analytics;
