import { useEffect, useState } from "react";
import { Check, Download, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { PayhipCheckoutButton } from "@/components/PayhipCheckoutButton";
import { StickyMobileCta, FunnelFaq } from "@/components/funnel/FunnelBits";
import { KIT_PRICE, KIT_TAGLINE, KIT_INCLUDES, KIT_NO_CALL_NOTE, KIT_NEXT_OFFER, REVIEW_PRICE } from "@/lib/funnel";
import { trackCta, trackEvent } from "@/lib/track";

const faq = [
  {
    q: "Is this a course or a call?",
    a: "Neither. The Launch Kit is a self-guided booklet and setup roadmap you download and work through at your own pace. It does not include a consultation.",
  },
  {
    q: "How do I get it after I pay?",
    a: "Right after checkout you land on a confirmation page with your download, and we email you the receipt and download link so you always have it.",
  },
  {
    q: "What if I already have my EIN and SAM.gov registration?",
    a: "The kit still helps you check that everything is set up correctly and shows you what to prepare next, but if your foundation is solid, the Readiness Review is likely the better fit.",
  },
  {
    q: "What is the Readiness Review?",
    a: `A ${REVIEW_PRICE} comprehensive review of how prepared your business is to pursue, win and deliver government contracts, with a scorecard, five target agencies, a 90-day plan and a 60-minute session with Towan.`,
  },
];

const LaunchKit = () => {
  useEffect(() => {
    trackEvent("view_launch_kit");
  }, []);

  const buyBtn = (
    <PayhipCheckoutButton
      product="launch_kit"
      onStart={() => trackCta("launch-kit-buy")}
      className="btn-gold w-full inline-flex items-center justify-center gap-2 text-sm px-8 py-4 rounded-md font-bold"
    >
      Get the Launch Kit · {KIT_PRICE}
    </PayhipCheckoutButton>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-ti-pattern pt-32 pb-16 lg:pt-36 lg:pb-20">
          <div className="container mx-auto px-6 max-w-5xl grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <p className="eyebrow-dark text-xs">The GovCon Launch Kit</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground !leading-[1.12]">
                {KIT_TAGLINE.split(" in place")[0]}{" "}
                <em className="text-gold-dark italic">in place.</em>
              </h1>
              <p className="text-base text-foreground/75 leading-relaxed max-w-xl">
                Before you chase contracts, your foundation has to be right: registrations, codes,
                banking and the setup agencies expect. The Launch Kit walks you through all of it,
                step by step.
              </p>
              <ul className="space-y-3">
                {["Download it the moment you pay", "Work through it at your own pace", "Know exactly what to prepare next"].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-sm text-foreground/80">
                    <Check className="h-4 w-4 text-primary shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div id="buy-card" className="rounded-md bg-navy p-8 shadow-xl space-y-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">One-time purchase</p>
              <p className="font-display text-5xl font-extrabold text-white">{KIT_PRICE}</p>
              <p className="text-sm text-white/70 leading-relaxed">
                The booklet, the roadmap and the resource links. Yours to keep.
              </p>
              {buyBtn}
              <p className="text-xs text-white/60 text-center">Secure checkout by Payhip. Download right after payment.</p>
            </div>
          </div>
        </section>

        {/* What's inside */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-10 !leading-[1.15]">
              What is inside
            </h2>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
              {KIT_INCLUDES.map((item, i) => (
                <div key={item.title} className="flex gap-4 border-t border-border pt-5">
                  <span className="font-display text-2xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-foreground/70 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">{KIT_NO_CALL_NOTE}</p>
          </div>
        </section>

        {/* Next step */}
        <section className="section-navy py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-3xl text-center space-y-6">
            <Download className="h-8 w-8 text-primary mx-auto" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white !leading-[1.15]">
              After the kit, <em className="text-primary italic">the diagnosis.</em>
            </h2>
            <p className="text-base text-white/75 leading-relaxed">{KIT_NEXT_OFFER}</p>
            <p className="text-sm text-white/60">
              The Comprehensive Readiness Review ({REVIEW_PRICE}) scores your business across ten areas
              and ends with a 60-minute planning session with Towan.
            </p>
          </div>
        </section>

        <FunnelFaq id="faq" items={faq} />

        {/* Final CTA */}
        <section className="section-navy py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-3xl text-center space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white !leading-[1.15]">
              Start with the foundation.{" "}
              <em className="text-primary italic">Everything else builds on it.</em>
            </h2>
            <div className="max-w-sm mx-auto">{buyBtn}</div>
          </div>
        </section>
      </main>
      <SiteFooter />

      <StickyMobileCta watchId="buy-card">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-lg font-bold text-white">{KIT_PRICE}</p>
          <PayhipCheckoutButton
            product="launch_kit"
            onStart={() => trackCta("launch-kit-buy-sticky")}
            className="btn-gold inline-flex items-center gap-2 text-sm px-6 py-3 rounded-md font-bold"
          >
            Get the Kit <ArrowRight className="h-4 w-4" />
          </PayhipCheckoutButton>
        </div>
      </StickyMobileCta>
    </div>
  );
};

export default LaunchKit;
