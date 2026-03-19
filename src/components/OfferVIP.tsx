import { Check } from "lucide-react";

const included = [
  "15-minute strategy session — a focused look at your business, goals, and GovCon positioning",
  "8 hours of hands-on work by Towan on your deliverables (capability statement, target list, proposals, etc.)",
  "30-minute final discussion to walk through your customized plan and next steps",
  "Pre-session intake audit of your business positioning, NAICS codes, and SAM.gov profile",
  "Customized Agency Target List — the specific agencies most likely to buy what you sell",
  "Capability Statement review and rewrite recommendations",
  "Bid/No-Bid decision framework tailored to your business",
  "Post-session written summary and action plan",
  "2-week follow-up check-in (email or voice note)",
];

const OfferVIP = () => {
  return (
    <section id="vip" className="section-navy py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 font-display">
              Free Strategy Session · No Obligation
            </p>
            <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
              Your Personal GovCon Roadmap — Built in a Single Engagement
            </h2>
            <p className="text-lg text-white/75 max-w-2xl mx-auto">
              This isn't a sales call. It's a focused 15-minute strategy session where we look at your business, 
              identify your best opportunities, and show you a clear path to winning government contracts — 
              completely free.
            </p>
          </div>

          {/* Recap box */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 md:p-8 mb-10 text-center space-y-3">
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
          
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-8 md:p-12 border border-white/15">
            <h3 className="font-display text-xl font-bold text-white mb-6 uppercase tracking-wide">What's Included:</h3>
            <ul className="space-y-4 mb-10">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-white/70" />
                  <span className="text-sm leading-relaxed text-white/85">{item}</span>
                </li>
              ))}
            </ul>
            
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
