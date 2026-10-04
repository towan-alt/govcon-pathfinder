import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import TestimonialsSection from "@/components/TestimonialsSection";
import { SandboxNote, SquareCheckoutButton, getSquareStatus } from "@/components/SquareCheckoutButton";
import { FunnelFaq, StatsStrip, StickyMobileCta } from "@/components/funnel/FunnelBits";
import { BRAND, FIGURES } from "@/lib/brand";
import {
  getAssessmentResult, getLead, PILLAR_LABELS, REVIEW_CREDIT_LINE, REVIEW_INCLUDES, REVIEW_PRICE,
} from "@/lib/funnel";
import { trackCta, trackEvent } from "@/lib/track";
import { trainingAction } from "@/lib/trainingApi";

const HOW = [
  { title: "Book and pay", text: "Secure checkout in under a minute." },
  { title: "Get your Starter Kit", text: "Delivered the moment you book." },
  { title: "Meet 1:1 for 60 minutes", text: `A working session with ${BRAND.founder}.` },
  { title: "Receive your written plan", text: "Your 90-Day Federal Action Plan within 48 hours." },
];

const FAQ = [
  { q: "What happens after I pay?", a: "You'll pick your session time right away, download your GovCon Starter Kit, and complete a short intake so Towan can review your business before you meet." },
  { q: "Is this a sales call?", a: "No. It's a working session that produces your plan. If a GoGovCon program fits, it's mentioned at the end along with your 14-day credit. There's no obligation." },
  { q: "APEX Accelerators offer free counseling. Why pay?", a: `APEX is a valuable free resource and you should use yours. This is different: a working session with a practitioner who has bid and won federal work for ${FIGURES.years} years, plus deliverables you keep, including your agency list and written plan.` },
  { q: "I haven't taken the assessment yet.", a: "Take it first. It's free, takes about 3 minutes, and makes your session more focused." },
  { q: "Can you guarantee a contract?", a: "No. Agencies make awards. You get the plan, the agency list and the next steps so you compete with a strategy." },
];

const ReadinessReview = () => {
  const result = getAssessmentResult();
  const lead = getLead();
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getSquareStatus>> | undefined>(undefined);

  useEffect(() => {
    void trackEvent("review_view");
    void getSquareStatus().then(setStatus);
  }, []);

  const start = (ctaId: string) => {
    trackCta(ctaId);
    void trackEvent("review_checkout_start");
    if (lead?.email) void trainingAction({ action: "checkout", email: lead.email });
  };
  const buy = (ctaId: string, cls: string, label: React.ReactNode) => (
    <SquareCheckoutButton product="readiness_review_bundle" email={lead?.email || undefined} status={status} onStart={() => start(ctaId)} className={cls}>
      {label}
    </SquareCheckoutButton>
  );

  const gapLabel = result?.gap ? PILLAR_LABELS[result.gap] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="section-navy pt-28 pb-14 lg:pt-36 lg:pb-20">
          <div className="container mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div>
              <p className="eyebrow text-xs">The Readiness Review</p>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-4 !leading-[1.12]">
                Turn your score into a <em className="text-primary italic">90-Day Federal Action Plan</em>
              </h1>
              {result ? (
                <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 px-4 py-3">
                  <span className="font-display text-2xl font-bold text-primary">Your score: {result.score}/100</span>
                  {gapLabel && <span className="text-sm text-white/85">We start with your {gapLabel} gap.</span>}
                </div>
              ) : (
                <p className="mt-5 text-white/80 text-lg leading-relaxed max-w-xl">
                  A 60-minute working session with {BRAND.founder}, plus the agency list and written plan you need to pursue federal work with focus.
                </p>
              )}
              <ul className="mt-8 space-y-3 hidden lg:block">
                {REVIEW_INCLUDES.slice(0, 4).map((i) => (
                  <li key={i.title} className="flex gap-3 text-white/85"><Check className="h-5 w-5 text-primary shrink-0" />{i.title}</li>
                ))}
              </ul>
            </div>

            <div id="price-card" className="rounded-2xl bg-card p-6 md:p-8 shadow-2xl border-t-4 border-primary space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Readiness Review Bundle</p>
              <p className="font-display text-5xl font-bold text-foreground">{REVIEW_PRICE}</p>
              <p className="text-sm text-foreground/80">One-time payment. {REVIEW_CREDIT_LINE}</p>
              {buy("review-hero-buy", "btn-gold w-full gap-2 py-4", <>Book My Readiness Review · {REVIEW_PRICE}</>)}
              <SandboxNote status={status} />
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground text-center">
                <Lock className="h-3.5 w-3.5" /> Secure checkout. You'll pick your session time right after payment.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-6 max-w-6xl">
            <p className="eyebrow-dark text-xs">What's included</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-10 !leading-[1.15]">Everything you need to start with focus</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {REVIEW_INCLUDES.map((i) => (
                <div key={i.title} className="rounded-xl border border-border bg-card p-6">
                  <Check className="h-6 w-6 text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground mt-3">{i.title}</h3>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{i.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm font-semibold text-foreground">{REVIEW_CREDIT_LINE}</p>
          </div>
        </section>

        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6 max-w-5xl">
            <p className="eyebrow-dark text-xs">How it works</p>
            <h2 className="font-display text-3xl font-bold text-foreground mt-3 mb-10 !leading-[1.15]">Four steps from payment to plan</h2>
            <ol className="grid md:grid-cols-4 gap-5">
              {HOW.map((h, i) => (
                <li key={h.title} className="rounded-xl bg-card border border-border p-5">
                  <p className="font-display text-3xl font-bold text-primary">{i + 1}</p>
                  <p className="font-bold text-foreground mt-2">{h.title}</p>
                  <p className="text-sm text-foreground/80 mt-1">{h.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-navy py-16">
          <div className="container mx-auto px-6 max-w-5xl text-center">
            <blockquote className="font-display italic text-2xl md:text-3xl text-white !leading-[1.3] max-w-3xl mx-auto">
              "They lack the roadmap and the confidence, and that is exactly what I supply."
            </blockquote>
            <p className="mt-4 text-sm text-white/70">{BRAND.founder}, {BRAND.founderRole}</p>
            <div className="mt-12"><StatsStrip /></div>
          </div>
        </section>

        <TestimonialsSection />
        <FunnelFaq id="review-faq" items={FAQ} />

        <section className="section-navy py-16 text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white !leading-[1.15]">Leave with a plan you can act on Monday</h2>
            <div className="mt-8 flex justify-center">{buy("review-final-buy", "btn-gold gap-2", <>Book My Readiness Review · {REVIEW_PRICE} <ArrowRight className="h-4 w-4" /></>)}</div>
            {!result && (
              <p className="mt-5 text-sm text-white/70">
                No score yet? <Link to="/assessment" onClick={() => trackCta("review-take-assessment")} className="text-teal underline">Take the free assessment first</Link>.
              </p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <StickyMobileCta watchId="price-card">
        {buy("review-sticky-buy", "btn-gold w-full py-3", <>Book My Readiness Review · {REVIEW_PRICE}</>)}
      </StickyMobileCta>
    </div>
  );
};

export default ReadinessReview;
