import { Check, Building2, ArrowRight } from "lucide-react";

const deliverables = [
  { title: "Positioning", desc: "NAICS codes, capability statement, and clear offer" },
  { title: "Infrastructure", desc: "SAM.gov, certifications strategy, compliance setup" },
  { title: "Pipeline", desc: "Target agencies + real, active contract opportunities" },
  { title: "Business Development", desc: "Outreach scripts, partnership strategy, meeting flow" },
  { title: "Proposals", desc: "Templates, past performance positioning, capture strategy" },
  { title: "Execution", desc: "SOPs, team roles, and a 90-day action plan" },
];

const ProgramInABox = () => {
  return (
    <section id="program" className="bg-foreground py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">For Organizations</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-background md:text-4xl lg:text-5xl">
              Government Contracting<br />
              <span className="text-primary">Program-in-a-Box™</span>
            </h2>
            <p className="text-base text-background/60 max-w-2xl mx-auto leading-relaxed">
              We build your entire government contracting engine — so you can start winning contracts 
              without guessing what to do next.
            </p>
          </div>

          <div className="rounded-xl bg-background/5 border border-primary/20 p-8 md:p-12 mb-8">
            <p className="text-sm text-background/70 leading-relaxed mb-8">
              This is a done-for-you buildout of your organization's government contracting program. 
              In just <strong className="text-primary">45 days</strong>, we implement the strategy, systems, and pipeline 
              you need to pursue and win contracts.
            </p>

            <h3 className="font-display text-lg font-bold text-background mb-6 uppercase tracking-wide">
              What We Build
            </h3>
            <div className="grid gap-4 md:grid-cols-2 mb-10">
              {deliverables.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                  <div>
                    <span className="text-sm font-semibold text-background">{item.title}:</span>{" "}
                    <span className="text-sm text-background/60">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 border-t border-primary/10 pt-8">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Who It's For</p>
                <p className="text-sm text-background/60 leading-relaxed">
                  Organizations with an established service or product that are ready to seriously 
                  pursue government contracts and scale revenue.
                </p>
              </div>
              <div className="flex-shrink-0 text-center sm:text-right sm:border-l sm:border-primary/10 sm:pl-6">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Timeline</p>
                <p className="font-display text-4xl font-extrabold text-background">45</p>
                <p className="text-sm text-background/60">days to launch</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <a
              href="/book"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-base px-10 py-4 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Apply for a Readiness Call
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-xs text-background/40">
              We'll assess if your business is positioned to win — and if we're the right partner to build your program.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramInABox;
