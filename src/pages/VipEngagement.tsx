import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import TestimonialsSection from "@/components/TestimonialsSection";
import { SandboxNote, SquareCheckoutButton, getSquareStatus } from "@/components/SquareCheckoutButton";
import { FunnelFaq, StatsStrip, StickyMobileCta } from "@/components/funnel/FunnelBits";
import { BRAND, FIGURES } from "@/lib/brand";
import { getLead, VIP_INCLUDES, VIP_PRICE, VIP_SESSION_LINE } from "@/lib/funnel";
import { trackCta, trackEvent } from "@/lib/track";
import { trainingAction } from "@/lib/trainingApi";

const HOW = [
  { title: "Book and pay", text: "Secure checkout in under a minute." },
  { title: "Pre-session review", text: `${BRAND.founder} reviews your business before you meet.` },
  { title: "Meet virtually for 2 hours", text: `A working intensive with ${BRAND.founder}.` },
  { title: "Execute with support", text: "Your written plan, recording, Slack and WhatsApp access, and teaming help." },
];

const FAQ = [
  { q: "What happens after I pay?", a: "You'll pick your session time right away and complete a short intake so Towan can review your business before you meet. Your Slack and WhatsApp invitations follow by email." },
  { q: "Is the session really virtual?", a: "Yes. The full 2-hour intensive happens over video, so you can join from anywhere. You get the recording afterward." },
  { q: "How is this different from the Readiness Review?", a: "The Readiness Review is a 60-minute session that produces your 90-day plan. The VIP Engagement is a 2-hour intensive with deeper pre-session research, teaming recommendations and assistance, and ongoing access through Slack, WhatsApp and email." },
  { q: "What do you mean by teaming assistance?", a: "Towan identifies teaming partners that strengthen your bids and helps you approach them, so you can pursue work you could not carry alone." },
  { q: "Can you guarantee a contract?", a: "No. Agencies make awards. You get the strategy, the plan, the introductions and the support to compete with focus." },
];

const VipEngagement = () => {
  const lead = getLead();
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getSquareStatus>> | undefined>(undefined);

  useEffect(() => {
    void trackEvent("vip_view");
    void getSquareStatus().then(setStatus);
  }, []);

  const start = (ctaId: string) => {
    trackCta(ctaId);
    void trackEvent("vip_checkout_start");
    if (lead?.email) void trainingAction({ action: "checkout", email: lead.email });
  };
  const buy = (ctaId: string, cls: string, label: React.ReactNode) => (
    <SquareCheckoutButton product="vip_engagement" email={lead?.email || undefined} status={status} onStart={() => start(ctaId)} className={cls}>
      {label}
    </SquareCheckoutButton>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="section-navy pt-28 pb-14 lg:pt-36 lg:pb-20">
          <div className="container mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div>
              <p className="eyebrow text-xs">The VIP Engagement</p>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-4 !leading-[1.12]">
                Two hours with Towan. <em className="text-primary italic">A plan you can execute.</em>
              </h1>
              <p className="mt-5 text-white/80 text-lg leading-relaxed max-w-xl">
                {VIP_SESSION_LINE} Deeper research, a written plan, teaming assistance and ongoing access while you put it to work.
              </p>
              <ul className="mt-8 space-y-3 hidden lg:block">
                {VIP_INCLUDES.slice(0, 4).map((i) => (
                  <li key={i.title} className="flex gap-3 text-white/85"><Check className="h-5 w-5 text-primary shrink-0" />{i.title}</li>
                ))}
              </ul>
            </div>

            <div id="price-card" className="rounded-2xl bg-card p-6 md:p-8 shadow-2xl border-t-4 border-primary space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">VIP Engagement</p>
              <p className="font-display text-5xl font-bold text-foreground">{VIP_PRICE}</p>
              <p className="text-sm text-foreground/80">One-time payment. {VIP_SESSION_LINE}</p>
              {buy("vip-hero-buy", "btn-gold w-full gap-2 py-4", <>Book My VIP Engagement · {VIP_PRICE}</>)}
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-10 !leading-[1.15]">Everything that comes with your session</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VIP_INCLUDES.map((i) => (
                <div key={i.title} className="rounded-xl border border-border bg-card p-6">
                  <Check className="h-6 w-6 text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground mt-3">{i.title}</h3>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{i.text}</p>
                </div>
              ))}
            </div>
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
        <FunnelFaq id="vip-faq" items={FAQ} />

        <section className="section-navy py-16 text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white !leading-[1.15]">Two hours. One plan. Real support after.</h2>
            <div className="mt-8 flex justify-center">{buy("vip-final-buy", "btn-gold gap-2", <>Book My VIP Engagement · {VIP_PRICE} <ArrowRight className="h-4 w-4" /></>)}</div>
            <p className="mt-5 text-sm text-white/70">
              Want a smaller first step? <Link to="/readiness-review" onClick={() => trackCta("vip-to-review")} className="text-teal underline">Start with the Readiness Review</Link>.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <StickyMobileCta watchId="price-card">
        {buy("vip-sticky-buy", "btn-gold w-full py-3", <>Book My VIP Engagement · {VIP_PRICE}</>)}
      </StickyMobileCta>
    </div>
  );
};

export default VipEngagement;
