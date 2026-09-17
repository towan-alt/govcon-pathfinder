import { STATS, FIGURES } from "@/lib/brand";

const StatsSection = () => {
  return (
    <section id="credibility" className="py-16 lg:py-20" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-xs text-center mb-10">The Track Record</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-bold text-primary">{s.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/60 leading-relaxed">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-white/70 leading-relaxed max-w-3xl mx-auto">
            {FIGURES.years} years in federal contracting. {FIGURES.contracts} contracts executed
            across {FIGURES.agencies} agencies; {FIGURES.winsSupported} represents contract wins
            supported for the businesses Towan has assisted. {FIGURES.thriveTrained} small business
            owners were trained through SBA's T.H.R.I.V.E. Emerging Leaders program.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
