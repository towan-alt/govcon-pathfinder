import { Mail, ArrowRight } from "lucide-react";

const perks = [
  "Weekly GovCon strategy articles written by Towan",
  "First access to upcoming masterclass topics and free trainings",
  "Behind-the-scenes breakdowns of real contract wins and losses",
  "Subscriber-only resources and tools",
  "Early-bird pricing on all programs",
];

const sampleIssues = [
  "\"Why Your Capability Statement is Killing Your Win Rate\"",
  "\"The 3 NAICS Code Mistakes That Are Costing You Contracts\"",
  "\"How I Won My First $500K Contract Without a Proposal Writer\"",
  "\"What Contracting Officers Actually Look for Before They Call You\"",
];

const OfferSubstack = () => {
  return (
    <section id="substack" className="section-navy py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 font-display">
              Weekly Intelligence · Paid Subscription
            </p>
            <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
              The GovCon Insider: Weekly Strategy Straight from the Source
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              This isn't a newsletter. It's intel. Market shifts, procurement trends, agency updates, 
              bid strategy breakdowns, and real talk you won't find in a Google search.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">What Subscribers Get:</h3>
              <ul className="space-y-3">
                {perks.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Mail className="h-4 w-4 flex-shrink-0 mt-1 text-white/50" />
                    <span className="text-sm leading-relaxed text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">Sample Issues:</h3>
              <ul className="space-y-3">
                {sampleIssues.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 flex-shrink-0 mt-1 text-white/50" />
                    <span className="text-sm leading-relaxed italic text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-14 text-center space-y-5">
            <p className="font-display text-5xl font-extrabold text-white">
              $27<span className="text-lg font-normal text-white/70">/month</span>
            </p>
            <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Join thousands winning in the federal marketplace
            </p>
            <a href="#" className="btn-white text-lg px-14 py-6 rounded-xl">
              Subscribe to The GovCon Insider →
            </a>
            <p className="text-xs text-white/40">
              Cancel anytime. Full archive access and bonus content included.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferSubstack;
