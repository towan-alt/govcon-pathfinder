import { Check, Target, DollarSign, Award, Building2 } from "lucide-react";

const sessionSteps = [
  {
    icon: Target,
    title: "What Does Your Business Actually Do?",
    time: "2–3 min",
    points: [
      "What services or products do you sell today?",
      "Are you focused on a few things — or trying to do everything?",
      "We'll figure out exactly how the government would categorize what you offer.",
    ],
    insight: "The government uses special codes to find businesses like yours. We'll make sure you show up in the right searches.",
  },
  {
    icon: DollarSign,
    title: "What Are Your Goals?",
    time: "2–3 min",
    points: [
      "How much revenue do you want to bring in over the next year?",
      "Are you looking for smaller starter contracts or going after bigger ones?",
      "Do you want to lead projects or partner with another company?",
    ],
    insight: "Without a clear target, you'll waste time chasing the wrong opportunities. We'll help you focus.",
  },
  {
    icon: Award,
    title: "What Experience Do You Already Have?",
    time: "3–4 min",
    points: [
      "Have you done work for any clients — government, corporate, or local?",
      "Any projects you're proud of or can show results from?",
      "Even non-government work counts — we'll show you how to position it.",
    ],
    insight: "You don't need government experience to get started — you just need to present what you've done the right way.",
  },
  {
    icon: Building2,
    title: "Who Should You Be Selling To?",
    time: "3–4 min",
    points: [
      "Do you know which government agencies buy what you sell?",
      "We'll identify 2–3 agencies that are the best fit for your business.",
      "You'll leave knowing exactly where to focus your energy.",
    ],
    insight: "You don't need to pitch every agency — just the right ones. That's how contracts get won.",
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
              In 15 Minutes, You'll Know Exactly Why You're Not Winning — And What to Fix First.
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
              <a href="/book" className="text-white font-semibold underline underline-offset-4 hover:text-white/80 transition-colors">
                Book Here →
              </a>
            </p>
          </div>

          {/* 4 Steps */}
          <div className="space-y-6 mb-12">
            <h3 className="font-display text-xl font-bold text-white text-center uppercase tracking-wide mb-8">
              Here's Exactly What We Cover:
            </h3>
            
            <div className="grid gap-5 md:grid-cols-2">
              {sessionSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-xl bg-white border border-white/20 p-6 space-y-4"
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
                  
                  <p className="text-xs italic text-primary border-t border-border pt-3">
                    "{step.insight}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 text-center space-y-5">
            <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Limited spots available — book yours today
            </p>
            <a href="/book" className="btn-primary text-lg px-14 py-6 rounded-xl">
              Book Your Free Session Now →
            </a>
            <p className="text-xs text-white/40">
              No credit card required. You'll receive a confirmation email within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferVIP;