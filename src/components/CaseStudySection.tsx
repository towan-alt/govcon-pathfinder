import { FIGURES } from "@/lib/brand";

const proofPoints = [
  {
    value: FIGURES.thriveValue,
    label: "National program value",
  },
  { value: FIGURES.thriveTrained, label: "Small business owners trained" },
  { value: `${FIGURES.thriveRate}%`, label: "Recommendation rate" },
  { value: "Exceptional", label: "CPARS rating" },
];

const CaseStudySection = () => {
  return (
    <section id="results" className="section-navy py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-4">
            <p className="eyebrow text-xs">Case Study</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
              SBA's T.H.R.I.V.E. Emerging Leaders program,{" "}
              <em className="text-primary italic">delivered by Towan's firm.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {proofPoints.map((p) => (
              <div
                key={p.label}
                className="rounded-xl p-6"
                style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.1)" }}
              >
                <p className="font-display text-3xl font-bold text-primary">{p.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/60 leading-relaxed">
                  {p.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-sm text-white/75 leading-relaxed">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Challenge</p>
              <p>
                The SBA needed a national emerging-leaders initiative delivered to small business
                owners across the country — with measurable outcomes, not attendance counts.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Approach</p>
              <p>
                Towan's firm delivered the {FIGURES.thriveValue} program end to end, built on the
                same full-lifecycle training she teaches today — positioning, targeting, capture,
                proposals, pricing and performance.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Result</p>
              <p>
                {FIGURES.thriveTrained} small business owners trained, a {FIGURES.thriveRate}%
                recommendation rate, and an Exceptional CPARS rating — the same discipline the{" "}
                readiness assessment applies to your own pipeline.
              </p>
            </div>
          </div>

          <p className="text-xs text-white/50">
            Figures reflect program delivery data. Individual results vary by business, market and effort.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CaseStudySection;
