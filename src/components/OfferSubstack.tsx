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
            <p className="eyebrow">Free Weekly Intelligence · No Paywall to Start</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl" style={{ color: 'hsl(40, 20%, 99%)' }}>
              The GovCon Insider: Weekly Strategy Straight from the Source
            </h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto" style={{ color: 'hsl(40, 30%, 85%)' }}>
              This isn't a newsletter. It's intel. Market shifts, procurement trends, agency updates, 
              bid strategy breakdowns, and real talk you won't find in a Google search.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="font-display text-xl font-semibold text-gold">What Subscribers Get:</h3>
              <ul className="space-y-3">
                {perks.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Mail className="h-4 w-4 flex-shrink-0 mt-1 text-gold" />
                    <span className="text-sm leading-relaxed" style={{ color: 'hsl(40, 30%, 85%)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-display text-xl font-semibold text-gold">Sample Issues:</h3>
              <ul className="space-y-3">
                {sampleIssues.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 flex-shrink-0 mt-1 text-gold" />
                    <span className="text-sm leading-relaxed italic" style={{ color: 'hsl(40, 30%, 85%)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 text-center space-y-4">
            <p className="text-sm font-medium" style={{ color: 'hsl(40, 30%, 85%)' }}>
              Join thousands of small business owners learning to compete — and win — in the federal marketplace.
            </p>
            <a href="#" className="btn-gold">
              Subscribe Free to The GovCon Insider →
            </a>
            <p className="text-xs opacity-50" style={{ color: 'hsl(40, 30%, 85%)' }}>
              Free to subscribe. Paid tier available for full archive access and bonus content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferSubstack;
