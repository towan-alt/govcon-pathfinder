import { Check, BookOpen } from "lucide-react";

const benefits = [
  "2-hour live virtual masterclass with Towan",
  "Recorded replay available within 24 hours",
  "Downloadable resource (template, checklist, worksheet, or guide)",
  "Live Q&A — submit questions in advance or ask live",
  "Access to the private GovCon community",
  "Monthly \"Agency Spotlight\" breakdown",
];

const topics = [
  "How to Write a Capability Statement That Actually Gets Read",
  "Decoding SAM.gov: Finding Contracts Before Your Competitors",
  "Teaming Agreements: When to Partner and How to Protect Yourself",
  "The Set-Aside Advantage: 8(a), WOSB, SDVOSB & How to Use Them",
  "Writing a Winning Proposal: Structure, Language & What Evaluators Want",
  "From Zero to Prime: How to Win Your First Direct Federal Contract",
];

const OfferMasterclass = () => {
  return (
    <section id="masterclass" className="section-light py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <p className="eyebrow-dark">Monthly Live Training · Open Enrollment</p>
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
              The GovCon Masterclass: Monthly Intel from Someone Who's Actually Won
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every month, Towan goes deep on one high-impact topic. No fluff, no recycled content — 
              just tactical, field-tested strategies from 25+ years in the trenches.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-card p-8 shadow-sm border border-border">
              <h3 className="font-display text-xl font-semibold text-primary mb-6">What You Get Each Month:</h3>
              <ul className="space-y-4">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm leading-relaxed text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="rounded-xl bg-card p-8 shadow-sm border border-border">
              <h3 className="font-display text-xl font-semibold text-primary mb-6">Sample Monthly Topics:</h3>
              <ul className="space-y-4">
                {topics.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm leading-relaxed text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 text-center space-y-4">
            <p className="font-display text-4xl font-bold text-primary">
              $197<span className="text-lg font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground">Cancel anytime</p>
            <a href="#" className="btn-primary">
              Join the Monthly Masterclass →
            </a>
            <p className="text-xs text-muted-foreground">
              Enrollment is open. Your first session access begins immediately after checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferMasterclass;
