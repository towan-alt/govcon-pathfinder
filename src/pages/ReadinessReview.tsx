import { useEffect, useState } from "react";

import { ArrowRight, Check, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import BrandLogo from "@/components/BrandLogo";
import { PayhipCheckoutButton } from "@/components/PayhipCheckoutButton";
import { StickyMobileCta } from "@/components/funnel/FunnelBits";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BRAND, FIGURES } from "@/lib/brand";
import {
  getAssessmentResult, getLead, PILLAR_LABELS, REVIEW_AREAS, REVIEW_CREDIT_DAYS, REVIEW_CREDIT_LINE, REVIEW_INCLUDES, REVIEW_PRICE, REVIEW_PROMISE,
} from "@/lib/funnel";
import { trackCta, trackEvent } from "@/lib/track";
import { trainingAction } from "@/lib/trainingApi";
import towanHero from "@/assets/towan-hero.jpg";

const CARD_ITEMS = [
  `60-minute planning session with ${BRAND.founder.split(" ")[0]}, plus the recording`,
  "Readiness scorecard and executive summary",
  "Five target agencies and a written 90-day plan",
  "Slack, WhatsApp, matched opportunities and monthly sessions",
];

const HOW = [
  { title: "Book and pay", text: "Secure checkout in under a minute." },
  { title: "Get your Starter Kit", text: "Delivered the moment you book." },
  { title: "Meet 1:1 for 60 minutes", text: `A working session with ${BRAND.founder}.` },
  { title: "Receive your written plan", text: "Your 90-Day Federal Action Plan within 48 hours." },
];

const PLAN = [
  { days: "Days 1 to 30", text: "Fix the foundation: registrations, capability statement and positioning." },
  { days: "Days 31 to 60", text: "Build the pipeline: target notices, introductions and small business contacts." },
  { days: "Days 61 to 90", text: "Compete: first responses, teaming conversations and a bid/no-bid rhythm." },
];

const AGENCIES = [
  ["Agency 1", "Buys your core NAICS", "Small business specialist", "Request a capability briefing"],
  ["Agency 2", "Recurring set-aside spend", "Program office lead", "Respond to the sources sought"],
  ["Agency 3", "Upcoming recompete", "Incumbent prime", "Open a teaming conversation"],
];

const FAQ = [
  { q: "What happens after I pay?", a: "You'll get a confirmation email with a button to complete your intake and upload documents, pick your session time, and send the materials Towan reviews before you meet. Anything you don't have yet, you can mark as such." },
  { q: "Is this a sales call?", a: "No. It's a working session that produces your plan. If a GoGovCon program fits, it's mentioned at the end along with your 14-day credit. There's no obligation." },
  { q: "APEX Accelerators offer free counseling. Why pay?", a: `APEX is a valuable free resource and you should use yours. This is different: a working session with a practitioner who has bid and won federal work for ${FIGURES.years} years, plus deliverables you keep, including your agency list and written plan.` },
  { q: "Who prepares the review?", a: "Research and drafting are supported by automation, and a qualified reviewer verifies every finding before anything is delivered to you. Verified information, what you told us, and open questions are clearly distinguished." },
  { q: "Can you guarantee a contract?", a: "No. Agencies make awards. You get the plan, the agency list and the next steps so you compete with a strategy." },
];

const PROOF = [
  { value: FIGURES.years, label: "Years in federal contracting" },
  { value: FIGURES.contracts, label: "Federal contracts executed" },
  { value: FIGURES.agencies, label: "Federal agencies served" },
  { value: FIGURES.winsSupported, label: "In contract wins supported" },
];

const ReadinessReview = () => {
  const result = getAssessmentResult();
  const lead = getLead();

  useEffect(() => {
    void trackEvent("review_view");
  }, []);

  const start = (ctaId: string) => {
    trackCta(ctaId);
    void trackEvent("review_checkout_start");
    if (lead?.email) void trainingAction({ action: "checkout", email: lead.email });
  };
  const buy = (ctaId: string, cls: string, label: React.ReactNode) => (
    <PayhipCheckoutButton product="readiness_review_bundle" onStart={() => start(ctaId)} className={`${cls} !rounded-[2px] uppercase tracking-wider`}>
      {label}
    </PayhipCheckoutButton>
  );

  const gapLabel = result?.gap ? PILLAR_LABELS[result.gap] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* a) Hero */}
        <section className="bg-secondary bg-ti-pattern pt-28 pb-14 lg:pt-36 lg:pb-20">
          <div className="container mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <BrandLogo width={150} className="mb-6" />
              <p className="eyebrow-dark text-xs">The Readiness Review</p>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-4 !leading-[1.12]">
                Turn your score into a <em className="italic text-gold-dark">90-Day Federal Action Plan.</em>
              </h1>
              <p className="mt-5 text-foreground/85 text-lg leading-relaxed max-w-xl">
                {REVIEW_PROMISE}
              </p>
              {result && (
                <div className="mt-6 inline-flex flex-wrap border border-foreground text-sm font-semibold text-foreground rounded-[2px]">
                  <span className="px-4 py-2 bg-foreground text-background">Your score: {result.score}/100</span>
                  {gapLabel && <span className="px-4 py-2 bg-background">Biggest gap: {gapLabel}</span>}
                </div>
              )}
              <ul className="mt-7 space-y-2.5">
                {["Starter Kit the moment you book", "Written plan within 48 hours", `${REVIEW_PRICE} credited for ${REVIEW_CREDIT_DAYS} days`].map((t) => (
                  <li key={t} className="flex gap-3 text-foreground font-medium"><Check className="h-5 w-5 text-gold-dark shrink-0" />{t}</li>
                ))}
              </ul>
            </div>

            <div id="price-card" className="section-navy rounded-[2px] p-6 md:p-8 shadow-[0_30px_60px_-15px_hsl(var(--navy)/0.6)] space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">One-time investment</p>
              <p className="font-display text-6xl font-bold text-white">{REVIEW_PRICE}</p>
              <ol className="space-y-3">
                {CARD_ITEMS.map((t, i) => (
                  <li key={t} className="flex gap-3 text-white/90 border-t border-white/15 pt-3">
                    <span className="font-display font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>{t}
                  </li>
                ))}
              </ol>
              {buy("review-hero-buy", "btn-gold w-full gap-2 py-4", <>Book My Readiness Review</>)}
              <p className="flex items-center justify-center gap-1.5 text-xs text-white/75 text-center">
                <Lock className="h-3.5 w-3.5" /> Secure checkout by Payhip. Pick your session time right after payment.
              </p>
              <p className="text-xs text-white/75 text-center">{REVIEW_CREDIT_LINE}</p>
            </div>
          </div>
        </section>

        {/* b) Proof strip */}
        <section className="section-navy py-10">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {PROOF.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl md:text-4xl font-bold text-gold-light">{s.value}</p>
                <p className="text-xs uppercase tracking-wider text-white/75 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* c) Deliverables */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 !leading-[1.15]">Every deliverable. One clear direction.</h2>
            <p className="text-foreground/75 mb-10 max-w-2xl leading-relaxed">Your review covers ten areas: {REVIEW_AREAS.join(", ").toLowerCase()}.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
              {REVIEW_INCLUDES.map((d, i) => (
                <div key={d.title} className="border-r border-b border-border p-6">
                  <p className="font-display text-3xl font-bold text-gold">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-bold text-foreground mt-3">{d.title}</h3>
                  <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">{d.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* d) Sample documents */}
        <section className="py-16 lg:py-20 bg-secondary">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10 !leading-[1.15]">Not advice you forget. Documents you work from.</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border border-t-4 border-t-gold rounded-[2px] p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-foreground">90-Day Federal Action Plan</h3>
                  <span className="text-[10px] font-bold tracking-widest border border-foreground px-2 py-1 text-foreground">SAMPLE FORMAT</span>
                </div>
                <div className="mt-5 divide-y divide-border">
                  {PLAN.map((p) => (
                    <div key={p.days} className="py-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground">{p.days}</p>
                      <p className="text-sm text-foreground/80 mt-1">{p.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border border-t-4 border-t-gold rounded-[2px] p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-foreground">Top 5 Target Agency List</h3>
                  <span className="text-[10px] font-bold tracking-widest border border-foreground px-2 py-1 text-foreground">SAMPLE FORMAT</span>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-xs text-left text-foreground">
                    <thead><tr className="border-b border-foreground">{["Agency", "Why it fits", "Who to contact", "Next move"].map((h) => <th key={h} className="py-2 pr-3 font-bold">{h}</th>)}</tr></thead>
                    <tbody>
                      {AGENCIES.map((r) => <tr key={r[0]} className="border-b border-border">{r.map((c, i) => <td key={i} className={`py-2 pr-3 ${i === 0 ? "font-semibold" : "text-foreground/80"}`}>{c}</td>)}</tr>)}
                      <tr><td colSpan={4} className="py-2 italic text-foreground/80">Agencies 4 and 5: built live in your session</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* e) How it works */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-6 max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10 !leading-[1.15]">How it works</h2>
            <ol className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {HOW.map((h, i) => (
                <li key={h.title} className="border-t-4 border-foreground pt-4">
                  <p className="font-display text-3xl font-bold text-gold">{String(i + 1).padStart(2, "0")}</p>
                  <p className="font-bold text-foreground mt-2">{h.title}</p>
                  <p className="text-sm text-foreground/80 mt-1">{h.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* f) Host */}
        <section className="section-navy py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-6xl grid md:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
            <img src={towanHero} alt={BRAND.founder} loading="lazy" className="w-full max-w-sm mx-auto rounded-[2px] object-cover aspect-[4/5]" />
            <div>
              <p className="eyebrow text-xs">Your session is with</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-3 !leading-[1.1]">{BRAND.founder}</h2>
              <p className="text-white/85 mt-5 leading-relaxed">
                {BRAND.founderRole}. {FIGURES.years} years in federal contracting, {FIGURES.contracts} contracts executed across {FIGURES.agencies} agencies, and {FIGURES.winsSupported} in contract wins supported for the businesses she coaches.
              </p>
              <blockquote className="font-display italic text-2xl md:text-3xl text-gold mt-8 !leading-[1.3]">
                "I don't just teach federal contracting. I win federal contracts, every year."
              </blockquote>
            </div>
          </div>
        </section>

        {/* g) Credit explainer */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6 max-w-4xl flex flex-col md:flex-row items-stretch gap-4">
            <div className="flex-1 border-2 border-foreground rounded-[2px] p-6 text-center">
              <p className="text-xs font-bold tracking-widest text-foreground">TODAY</p>
              <p className="font-display text-4xl font-bold text-foreground mt-2">{REVIEW_PRICE}</p>
              <p className="text-sm text-foreground/80 mt-1">Your Readiness Review</p>
            </div>
            <div className="flex items-center justify-center"><ArrowRight className="h-8 w-8 text-gold rotate-90 md:rotate-0" /></div>
            <div className="flex-1 section-navy rounded-[2px] p-6 text-center">
              <p className="text-xs font-bold tracking-widest text-white/75">WITHIN {REVIEW_CREDIT_DAYS} DAYS</p>
              <p className="font-display text-4xl font-bold text-gold mt-2">{REVIEW_PRICE} off</p>
              <p className="text-sm text-white/85 mt-1">Any GoGovCon program you join</p>
            </div>
          </div>
        </section>

        {/* h) FAQ */}
        <section id="review-faq" className="bg-secondary py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 !leading-[1.15]">Frequently asked</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ.map((f) => (
                <AccordionItem key={f.q} value={f.q} className="border border-border bg-card rounded-[2px] px-5">
                  <AccordionTrigger className="text-left font-semibold text-foreground">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* i) Final CTA */}
        <section className="section-navy py-16 text-center">
          <div className="container mx-auto px-6 max-w-2xl flex flex-col items-center">
            <BrandLogo width={100} onDark className="mb-8" />
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white !leading-[1.15]">
              Stop guessing. <em className="italic text-gold">Get the plan.</em>
            </h2>
            <p className="text-white/85 mt-4">60 minutes with Towan. Your Top 5 agencies. A written 90-day plan in 48 hours.</p>
            <div className="mt-8">{buy("review-final-buy", "btn-gold gap-2", <>Get My Comprehensive Readiness Review · {REVIEW_PRICE}</>)}</div>
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
