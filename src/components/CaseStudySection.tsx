import { FIGURES } from "@/lib/brand";

const proofPoints = [
  {
    value: FIGURES.applicationsGenerated,
    label: "Applications generated in under five weeks",
  },
  { value: `${FIGURES.cohorts} cohorts`, label: "National small-business program outreach" },
  { value: FIGURES.tasksDelivered, label: "Contract tasks personally delivered" },
];

const CaseStudySection = () => {
  return (
    <section id="results" className="section-navy py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-4">
            <p className="eyebrow text-xs">Case Study</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
              A national outreach program that filled{" "}
              <em className="text-primary italic">{FIGURES.applicationsGenerated} applications</em>{" "}
              in under five weeks.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
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
                A national small-business program needed qualified applicants fast, across dozens of
                markets, with a short application window and no established pipeline.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Approach</p>
              <p>
                Towan's team built the outreach system: audience targeting, message testing, partner
                channels, and a cohort-by-cohort follow-up sequence run across {FIGURES.cohorts} cohorts.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Result</p>
              <p>
                {FIGURES.applicationsGenerated} applications generated in fewer than five weeks — the
                same capture-and-follow-up discipline the {" "}
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
