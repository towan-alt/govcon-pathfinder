import { Check } from "lucide-react";

const diagnosticQuestions = [
  { number: 1, question: "What does your business primarily sell today?", signal: "Clarity of offer" },
  { number: 2, question: "Who are your current customers?", signal: "Proof it's a real business" },
  { number: 3, question: "What's your top revenue-generating service or product?", signal: "Focus vs. trying to do everything" },
  { number: 4, question: "What results or past projects can you point to?", signal: "Credibility and performance" },
  { number: 5, question: "What revenue goal are you aiming for in the next 12 months?", signal: "Realistic expectations" },
  { number: 6, question: "Are you looking to win contracts as a prime or partner as a subcontractor?", signal: "Strategy awareness" },
  { number: 7, question: "Do you know which government agencies buy what you offer?", signal: "Targeting vs. guessing" },
  { number: 8, question: "How ready are you to invest time and resources into pursuing contracts?", signal: "Commitment level" },
];

const outcomes = [
  { green: "Clear", red: "Scattered" },
  { green: "Proven", red: "Untested" },
  { green: "Strategic", red: "Guessing" },
  { green: "Committed", red: "Curious" },
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
              8 high-signal questions that quickly assess your readiness for government contracting — so you leave with clarity, not confusion.
            </p>
          </div>

          {/* Why Free box */}
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

          {/* 8 Questions */}
          <div className="space-y-6 mb-12">
            <h3 className="font-display text-xl font-bold text-white text-center uppercase tracking-wide mb-8">
              Here's What We'll Diagnose in 15 Minutes:
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {diagnosticQuestions.map((q) => (
                <div
                  key={q.number}
                  className="rounded-xl bg-white border border-white/20 p-5 flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="font-display text-sm font-bold text-primary">{q.number}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-sm font-bold text-foreground">{q.question}</p>
                    <p className="text-xs text-primary italic">{q.signal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcome signals */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 md:p-8 mb-12">
            <p className="font-display text-base font-bold text-white text-center mb-6">
              These questions quickly reveal where you stand:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {outcomes.map((o) => (
                <div key={o.green} className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">{o.green}</span>
                  </div>
                  <p className="text-xs text-white/40">vs.</p>
                  <span className="text-sm text-white/50">{o.red}</span>
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