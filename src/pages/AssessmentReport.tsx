import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Printer } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { trackCta, trackEvent } from "@/lib/track";

type Pillar = { key: string; name: string; sub: string; score: number; status: string; action: string; isGap: boolean };
type Report = {
  first_name: string; score: number; tier: string; gapName: string; tierParagraph: string;
  pillars: Pillar[]; answers: { question: string; answer: string }[];
  gapSection: { intro: string; moves: string[] };
  offer: { heading: string; intro: string; items: string[]; credit: string; button: string };
};

const AssessmentReport = () => {
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "invalid">("loading");
  const [r, setR] = useState<Report | null>(null);

  useEffect(() => {
    if (!/^[0-9a-f]{48}$/.test(token)) { setState("invalid"); return; }
    supabase.functions.invoke("assessment", { body: { action: "report", token } }).then(({ data, error }) => {
      if (error || !data || (data as { error?: string }).error) { setState("invalid"); return; }
      setR(data as Report); setState("ok");
      void trackEvent("report_view");
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="print:hidden"><Navbar /></div>
      <main className="flex-1 pt-28 pb-20 print:pt-0 print:pb-0">
        <div className="container mx-auto px-6 max-w-3xl print:max-w-none print:px-0">
          {state === "loading" && <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-foreground" /></div>}
          {state === "invalid" && (
            <div className="text-center space-y-5 py-16">
              <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.2]">We couldn't find that report</h1>
              <p className="text-foreground/80">The link may be incomplete. Take the free assessment to get a fresh Readiness Report in about 3 minutes.</p>
              <Link to="/assessment" className="btn-gold gap-2">Take the Assessment <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}
          {state === "ok" && r && (
            <article className="space-y-8 report-print">
              <header className="section-navy rounded-2xl p-6 md:p-8 print:rounded-none">
                <p className="font-display text-xl font-bold text-white">Go<span className="text-primary">GovCon</span></p>
                <p className="eyebrow text-xs mt-4">GovCon Readiness Report</p>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white !leading-[1.15] mt-2">Your Score: {r.score}/100, {r.tier}</h1>
                <p className="text-white/80 mt-2">Prepared for {r.first_name}</p>
              </header>

              <div className="flex flex-wrap gap-3 print:hidden">
                <button onClick={() => window.print()} className="btn-outline-dark gap-2 inline-flex items-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground">
                  <Printer className="h-4 w-4" /> Print or save as PDF
                </button>
                <Link to="/readiness-review" onClick={() => trackCta("report-top")} className="btn-gold gap-2">Book My Readiness Review <ArrowRight className="h-4 w-4" /></Link>
              </div>

              <section className="space-y-3">
                <p className="text-foreground/85 leading-relaxed">{r.tierParagraph}</p>
              </section>

              <section className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-foreground !leading-[1.2]">Your Five Pillars</h2>
                <p className="text-sm text-foreground/80">Each pillar is scored from 0 to 100. Strong is 67 and above, Building is 34 to 66, and Gap is 33 and below.</p>
                {r.pillars.map((p) => (
                  <div key={p.key} className={`rounded-lg p-4 break-inside-avoid ${p.isGap ? "border-2 border-primary" : "border border-border"}`}>
                    <div className="flex justify-between gap-3 text-sm">
                      <div>
                        <p className="font-bold text-foreground uppercase tracking-wide">{p.name}
                          {p.isGap && <span className="ml-2 rounded bg-primary px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary-foreground">Biggest gap</span>}
                        </p>
                        <p className="text-xs text-foreground/70">{p.sub}</p>
                      </div>
                      <p className="font-bold text-foreground whitespace-nowrap">{p.score}/100 · {p.status}</p>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden my-2 print:border print:border-border">
                      <div className="h-full bg-primary" style={{ width: `${Math.max(2, p.score)}%` }} />
                    </div>
                    <p className="text-sm text-foreground/85">{p.action}</p>
                  </div>
                ))}
              </section>

              <section className="space-y-3 break-inside-avoid">
                <h2 className="font-display text-2xl font-bold text-foreground !leading-[1.2]">Your Biggest Gap: {r.gapName}</h2>
                <p className="text-foreground/85">{r.gapSection.intro}</p>
                <p className="font-semibold text-foreground">Your next three moves:</p>
                <ol className="list-decimal pl-6 space-y-1.5 text-foreground/85">{r.gapSection.moves.map((m) => <li key={m}>{m}</li>)}</ol>
              </section>

              <section className="space-y-3">
                <h2 className="font-display text-2xl font-bold text-foreground !leading-[1.2]">Your Answers</h2>
                <table className="w-full text-sm">
                  <tbody>
                    {r.answers.map((a) => (
                      <tr key={a.question} className="border-b border-border align-top">
                        <td className="py-2 pr-4 text-foreground/80">{a.question}</td>
                        <td className="py-2 font-semibold text-foreground">{a.answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="rounded-2xl section-navy p-6 md:p-8 space-y-4 break-inside-avoid">
                <h2 className="font-display text-2xl font-bold text-white !leading-[1.2]">{r.offer.heading}</h2>
                <p className="text-white/85">{r.offer.intro}</p>
                <ul className="space-y-2">{r.offer.items.map((i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/85"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" />{i}</li>
                ))}</ul>
                <p className="text-sm text-white/75">{r.offer.credit}</p>
                <Link to="/readiness-review" onClick={() => trackCta("report-offer")} className="btn-gold gap-2 print:hidden">{r.offer.button} <ArrowRight className="h-4 w-4" /></Link>
              </section>

              <p className="text-foreground">To your success,<br /><strong>Towan Isom</strong><br />Founder, GoGovCon</p>
            </article>
          )}
        </div>
      </main>
      <div className="print:hidden"><SiteFooter /></div>
    </div>
  );
};

export default AssessmentReport;
