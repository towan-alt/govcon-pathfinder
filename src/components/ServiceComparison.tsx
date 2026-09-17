import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { trackCta } from "@/lib/track";

const rows = [
  {
    id: "free-session",
    offer: "Free Strategy Session",
    bestFor: "Unsure where to begin",
    outcome: "Readiness diagnosis and a clear first step",
    investment: "Free",
    cta: { label: "Book a session", to: "/book" },
    featured: false,
  },
  {
    id: "masterclass",
    offer: "Monthly Masterclass",
    bestFor: "Learning with ongoing support",
    outcome: "Monthly live training, templates and Q&A",
    investment: "$197/month",
    cta: { label: "See what's covered", to: "/#masterclass" },
    featured: false,
  },
  {
    id: "vip",
    offer: "VIP Engagement",
    bestFor: "Needs a customized plan",
    outcome: "Targeting, positioning and a written action plan",
    investment: "$997",
    cta: { label: "See what's included", to: "/#vip-dfy" },
    featured: true,
  },
];

const ServiceComparison = () => {
  return (
    <section id="services" className="py-20 lg:py-24" style={{ background: "hsl(0 0% 96%)" }}>
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-4">
            <p className="eyebrow-dark text-xs">Ways To Work Together</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
              Three ways in.{" "}
              <em className="text-primary italic">One that fits you.</em>
            </h2>
            <p className="text-base text-foreground/75 max-w-2xl leading-relaxed">
              Not sure which one? The free readiness assessment picks for you, based on where your
              business actually is today.
            </p>
          </div>

          {/* Desktop comparison table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-left">
              <caption className="sr-only">Comparison of GoGovCon services</caption>
              <thead>
                <tr className="border-b border-border" style={{ background: "hsl(0 0% 98%)" }}>
                  {["Offer", "Best for", "Outcome", "Investment", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-5 py-5 align-top">
                      <span className="font-display text-base font-bold text-foreground">{r.offer}</span>
                      {r.featured && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary align-middle">
                          Most in-depth
                        </span>
                      )}
                    </th>
                    <td className="px-5 py-5 align-top text-sm text-foreground/75">{r.bestFor}</td>
                    <td className="px-5 py-5 align-top text-sm text-foreground/75">{r.outcome}</td>
                    <td className="px-5 py-5 align-top font-display text-base font-bold text-foreground">
                      {r.investment}
                    </td>
                    <td className="px-5 py-5 align-top">
                      <Link
                        to={r.cta.to}
                        onClick={() => trackCta(`service-${r.id}`)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary whitespace-nowrap"
                      >
                        {r.cta.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-base font-bold text-foreground">{r.offer}</h3>
                  <p className="font-display text-base font-bold text-foreground whitespace-nowrap">
                    {r.investment}
                  </p>
                </div>
                <p className="text-sm text-foreground/75">
                  <span className="font-semibold text-foreground">Best for:</span> {r.bestFor}
                </p>
                <p className="text-sm text-foreground/75">
                  <span className="font-semibold text-foreground">Outcome:</span> {r.outcome}
                </p>
                <Link
                  to={r.cta.to}
                  onClick={() => trackCta(`service-${r.id}-mobile`)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary"
                >
                  {r.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/assessment"
              onClick={() => trackCta("services-help-me-choose")}
              className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-md text-sm"
            >
              Help Me Choose
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceComparison;
