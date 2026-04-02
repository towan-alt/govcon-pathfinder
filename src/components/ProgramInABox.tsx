import { ArrowRight } from "lucide-react";

const steps = [
  { number: "01", title: "Positioning & Registration", desc: "NAICS codes, SAM.gov setup, capability statement, and certifications strategy" },
  { number: "02", title: "Infrastructure & Compliance", desc: "Compliance setup, contract vehicles, and organizational readiness" },
  { number: "03", title: "Market Intelligence", desc: "Target agencies, active opportunities, competitor analysis, and pipeline building" },
  { number: "04", title: "Business Development", desc: "Outreach scripts, teaming partner strategy, agency meeting preparation" },
  { number: "05", title: "Proposal Development", desc: "Templates, past performance positioning, capture strategy, and review process" },
  { number: "06", title: "Execution & Scale", desc: "SOPs, team roles, 90-day action plan, and ongoing performance tracking" },
];

const ProgramInABox = () => {
  return (
    <section id="program" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left — Header */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <p className="eyebrow-dark text-xs">For Organizations</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
                The 45-day federal contracting{" "}
                <em className="block text-primary italic">program</em>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A done-for-you buildout of your organization's government contracting program. 
                In just 45 days, we implement the strategy, systems, and pipeline you need to 
                pursue and win contracts.
              </p>
              <div className="pt-4">
                <a
                  href="/book"
                  className="btn-dark text-sm px-8 py-3.5 rounded-md inline-flex items-center gap-2"
                >
                  Apply for a Readiness Call
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Right — Steps */}
            <div className="space-y-6">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex items-start gap-5 rounded-xl bg-card border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <span className="font-display text-2xl font-bold text-primary/30 flex-shrink-0 w-10">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramInABox;
