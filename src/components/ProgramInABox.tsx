import { ArrowRight, Calendar } from "lucide-react";

const workshops = [
  {
    number: "01",
    date: "April 29, 2026",
    title: "The GovCon Entry Blueprint",
    desc: "Get registered, positioned, and ready to pursue contracts in 30 days.",
  },
  {
    number: "02",
    date: "May 6, 2026",
    title: "Winning the Work: Proposal Strategy & Positioning",
    desc: "Learn how to write proposals that actually win.",
  },
  {
    number: "03",
    date: "May 13, 2026",
    title: "Building a Revenue Engine (Beyond One Contract)",
    desc: "Create a predictable pipeline so you're not chasing contracts.",
  },
  {
    number: "04",
    date: "May 20, 2026",
    title: "The Subcontractor to Prime Playbook",
    desc: "Transition from subcontractor to prime—and take control of your revenue.",
  },
];

const ProgramInABox = () => {
  return (
    <section id="program" className="py-20 lg:py-24" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="space-y-6 lg:sticky lg:top-24">
              <p className="eyebrow text-xs">Live Virtual Series</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
                GovCon Workshop{" "}
                <em className="block text-primary italic">Series</em>
              </h2>
              <p className="text-base text-white/60 leading-relaxed">
                Four high-impact sessions every Wednesday from 12:30 – 2:00 PM EST. 
                Go from curious to contract-ready with live, actionable strategy.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/60 font-body">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Every Wednesday
                </span>
                <span>12:30 – 2:00 PM EST</span>
                <span className="font-semibold text-white">$29/session</span>
              </div>
              <div className="rounded-lg p-4" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
                <p className="text-sm font-semibold text-white font-body">
                  🔥 All 4 workshops for just $79{" "}
                  <span className="text-primary">(Save $37)</span>
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="/events"
                  className="btn-gold text-sm px-8 py-3.5 rounded-md inline-flex items-center gap-2"
                >
                  View & Register
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              {workshops.map((ws) => (
                <div
                  key={ws.number}
                  className="flex items-start gap-5 rounded-xl p-6 hover:shadow-md transition-shadow"
                  style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
                >
                  <span className="font-display text-2xl font-bold flex-shrink-0 w-10" style={{ color: "hsl(var(--gold) / 0.3)" }}>
                    {ws.number}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 font-body">
                      {ws.date} · Wednesday
                    </p>
                    <h3 className="font-display text-base font-bold text-white mb-1">{ws.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{ws.desc}</p>
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
