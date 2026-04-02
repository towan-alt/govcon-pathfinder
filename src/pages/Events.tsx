import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, MapPin, Users, Zap, Gift, ArrowRight, Check } from "lucide-react";

const workshops = [
  {
    date: "April 27, 2026",
    title: "The GovCon Entry Blueprint",
    description: "Get registered, positioned, and ready to pursue contracts in 30 days.",
    topics: [
      "SAM.gov registration walkthrough",
      "NAICS code alignment",
      "Capability statement essentials",
      "30-day action plan",
    ],
  },
  {
    date: "May 4, 2026",
    title: "Winning the Work: Proposal Strategy & Positioning",
    description: "Learn how to write proposals that actually win.",
    topics: [
      "Proposal structure that evaluators love",
      "Past performance positioning",
      "Pricing strategy fundamentals",
      "Common disqualifiers to avoid",
    ],
  },
  {
    date: "May 11, 2026",
    title: "Building a Revenue Engine (Beyond One Contract)",
    description: "Create a predictable pipeline so you're not chasing contracts.",
    topics: [
      "Pipeline development framework",
      "Agency research & forecasting",
      "Teaming & partnership strategy",
      "Revenue diversification tactics",
    ],
  },
  {
    date: "May 18, 2026",
    title: "The Subcontractor to Prime Playbook",
    description: "Transition from subcontractor to prime—and take control of your revenue.",
    topics: [
      "When to make the leap to prime",
      "Building your own past performance",
      "Capture management basics",
      "Scaling your team & capacity",
    ],
  },
];

const Events = () => {
  const [selectedBundle, setSelectedBundle] = useState(false);
  const [selectedWorkshops, setSelectedWorkshops] = useState<number[]>([]);

  const toggleWorkshop = (index: number) => {
    if (selectedBundle) return;
    setSelectedWorkshops((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const selectBundle = () => {
    setSelectedBundle(true);
    setSelectedWorkshops([0, 1, 2, 3]);
  };

  const total = selectedBundle ? 79 : selectedWorkshops.length * 29;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-foreground pt-28 pb-16 lg:pt-36 lg:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--navy-light)),transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-widest mb-6 font-body">
              <Zap className="h-4 w-4" /> Live Virtual Workshop Series
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              GovCon Workshop{" "}
              <em className="text-primary italic">Series</em>
            </h1>
            <p className="text-lg text-white/60 font-body leading-relaxed max-w-xl mx-auto mb-8">
              Four high-impact sessions to take you from curious to contract-ready.
              Live with Towan Isom — no fluff, just strategy.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70 font-body">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Every Monday
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> 12:30 – 2:00 PM EST
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Live Virtual (Zoom)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Banner */}
      <div className="bg-primary py-3">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm font-semibold text-primary-foreground font-body">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Limited to 50 seats per session
            </span>
            <span className="hidden md:inline text-primary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              🔴 Live only — no replays available
            </span>
            <span className="hidden md:inline text-primary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <Gift className="h-4 w-4" /> First 50 registrants get a bonus template
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">

            {/* Bundle CTA */}
            <div
              onClick={selectBundle}
              className={`rounded-2xl p-6 md:p-8 mb-12 cursor-pointer transition-all duration-300 border-2 ${
                selectedBundle
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    selectedBundle ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}>
                    {selectedBundle && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        🔥 All 4 Workshops Bundle
                      </h3>
                      <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-body">
                        Save $37
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm font-body">
                      Get access to the complete series. Best value — most popular option.
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 md:text-right pl-10 md:pl-0">
                  <span className="font-display text-3xl font-bold text-foreground">$79</span>
                  <span className="text-sm text-muted-foreground line-through font-body">$116</span>
                </div>
              </div>
            </div>

            {/* Individual Workshops */}
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-body">
                Or select individual workshops — $29 each
              </p>

              {workshops.map((workshop, index) => (
                <div
                  key={index}
                  onClick={() => toggleWorkshop(index)}
                  className={`rounded-xl border-2 p-6 md:p-8 cursor-pointer transition-all duration-300 ${
                    selectedWorkshops.includes(index)
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                  } ${selectedBundle ? "pointer-events-none" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${
                      selectedWorkshops.includes(index) ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}>
                      {selectedWorkshops.includes(index) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 font-body">
                            {workshop.date} · Monday
                          </p>
                          <h3 className="font-display text-lg md:text-xl font-bold text-foreground">
                            {workshop.title}
                          </h3>
                        </div>
                        <span className="font-display text-2xl font-bold text-foreground flex-shrink-0">
                          $29
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 font-body">
                        {workshop.description}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {workshop.topics.map((topic) => (
                          <span key={topic} className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                            <Check className="h-3 w-3 text-primary flex-shrink-0" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Bottom Bar */}
            {selectedWorkshops.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-foreground border-t border-white/10 py-4 px-6 z-50 shadow-2xl">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                  <div>
                    <p className="text-white font-body text-sm">
                      {selectedBundle
                        ? "All 4 workshops selected"
                        : `${selectedWorkshops.length} workshop${selectedWorkshops.length > 1 ? "s" : ""} selected`}
                    </p>
                    <p className="text-white font-display text-2xl font-bold">
                      ${total}
                      {selectedBundle && (
                        <span className="text-sm text-white/40 line-through ml-2 font-body">$116</span>
                      )}
                    </p>
                  </div>
                  <a
                    href="/book"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-[hsl(var(--gold-light))] text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-colors font-body"
                  >
                    Register Now
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Bottom spacer when sticky bar is visible */}
            {selectedWorkshops.length > 0 && <div className="h-24" />}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Events;
