import { Check, Target, DollarSign, Award, Building2, AlertTriangle } from "lucide-react";

const sessionSteps = [
  {
    icon: Target,
    title: "NAICS + Capability Alignment",
    time: "2–3 min",
    points: [
      "What NAICS codes are you registered under?",
      "Which ones actually match your revenue-generating services?",
      "Are you spread too thin or focused?",
    ],
    insight: "Most businesses pick NAICS codes… but don't align them with how agencies actually buy.",
  },
  {
    icon: DollarSign,
    title: "Revenue Goals + Contract Targets",
    time: "2–3 min",
    points: [
      "What's your revenue goal for the next 12 months?",
      "What size contracts are you going after? ($50K vs $5M matters)",
      "Prime vs subcontractor strategy?",
    ],
    insight: "If your targets aren't clear, you'll chase everything—and win nothing.",
  },
  {
    icon: Award,
    title: "Past Performance + Positioning",
    time: "3–4 min",
    points: [
      "What contracts or similar work have you done?",
      "Federal, state, commercial—ALL counts",
      "Do you have case studies or proof of impact?",
    ],
    insight: "You don't need more experience—you need to position what you already have the right way.",
  },
  {
    icon: Building2,
    title: "Target Agencies + Buyers",
    time: "3–4 min",
    points: [
      "Which 3 agencies are you targeting?",
      "Do you know their current contracts + expiring opportunities?",
      "Any existing relationships?",
    ],
    insight: "Winning in GovCon is about focus—3 agencies, not 30.",
  },
  {
    icon: AlertTriangle,
    title: "Immediate Gaps + Next Moves",
    time: "3–4 min",
    points: [
      "Missing certifications? (8a, WOSB, HUBZone)",
      "Weak capability statement?",
      "No pipeline or outreach strategy?",
    ],
    insight: "Here's exactly what's blocking you from winning in the next 90 days.",
  },
];

const OfferVIP = () => {
  return (
    <section id="vip" className="section-navy py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 font-display">
              Free Strategy Session · 15 Minutes · No Obligation
            </p>
            <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
              15 Minutes That Could Change Your GovCon Business
            </h2>
            <p className="text-lg text-white/75 max-w-3xl mx-auto">
              If you only have 15 minutes, you need a tight, high-impact diagnostic. We'll quickly 
              show you what's missing and exactly how to start winning contracts.
            </p>
          </div>

          {/* Recap box */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 md:p-8 mb-12 text-center space-y-3">
            <p className="font-display text-lg font-bold text-white uppercase tracking-wide">
              Why Is This Free?
            </p>
            <p className="text-sm text-white/75 max-w-2xl mx-auto leading-relaxed">
              We want you to experience the value firsthand — no risk, no commitment. This session is designed 
              to help you see exactly where you stand and what's possible in the federal marketplace. If it's a 
              fit, we'll talk about next steps.{" "}
              <a href="#" className="text-white font-semibold underline underline-offset-4 hover:text-white/80 transition-colors">
                Book Here →
              </a>
            </p>
          </div>

          {/* 5 Steps */}
          <div className="space-y-6 mb-12">
            <h3 className="font-display text-xl font-bold text-white text-center uppercase tracking-wide mb-8">
              Here's Exactly What We Cover:
            </h3>
            
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sessionSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`rounded-xl bg-white border border-white/20 p-6 space-y-4 ${
                    index === 4 ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.time}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {step.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 mt-1 text-primary/70" />
                        <span className="text-xs leading-relaxed text-foreground/70">{point}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-xs italic text-primary/80 border-t border-white/5 pt-3">
                    "{step.insight}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Closing diagnostic */}
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-8 md:p-12 border border-white/15">
            <h3 className="font-display text-lg font-bold text-white mb-4 uppercase tracking-wide">
              What You'll Walk Away With:
            </h3>
            <p className="text-sm text-white/75 leading-relaxed mb-6">
              "Based on what you shared, you're not far off—but you're missing a clear positioning and 
              agency targeting strategy. That's exactly what we help clients fix so they can start winning 
              contracts faster."
            </p>
            
            <div className="grid gap-3 sm:grid-cols-3 mb-8">
              {[
                "You're targeting too many NAICS codes",
                "You don't have positioned past performance",
                "You're not aligned to how agencies buy",
              ].map((diagnosis) => (
                <div key={diagnosis} className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-xs text-white/80">{diagnosis}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/15 pt-8 space-y-2">
              <p className="text-sm text-white/60">
                <strong className="text-white/80">Who it's for:</strong> Small business owners registered (or ready to register) in SAM.gov, 
                with a viable service or product. Also ideal for businesses who have bid before but aren't winning.
              </p>
            </div>
            
            <div className="mt-10 text-center space-y-4">
              <p className="font-display text-5xl font-extrabold text-white">FREE</p>
              <p className="text-sm text-white/50">
                Limited spots available — book yours today
              </p>
              <a href="#" className="btn-white">
                Reserve My Free Strategy Session →
              </a>
              <p className="text-xs text-white/40">
                100% free. No credit card required. You'll receive a confirmation email within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferVIP;
