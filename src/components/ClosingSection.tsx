import { Star } from "lucide-react";

const paths = [
  {
    need: "A done-for-you strategy engagement",
    solution: "VIP Strategy Session",
    href: "#vip-dfy",
    price: "$997",
    badge: "Most Impactful",
    featured: true,
  },
  {
    need: "Ongoing training and community",
    solution: "Monthly Masterclass",
    href: "#masterclass",
    price: "$197/mo",
    badge: null,
    featured: false,
  },
  {
    need: "Weekly intel and strategy",
    solution: "Subscribe to Substack",
    href: "#substack",
    price: "$27/mo",
    badge: null,
    featured: false,
  },
];

const ClosingSection = () => {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="divider mx-auto" />
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl">
            Start Winning Contracts Now.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You don't need a team of 50, a fancy office, or a decade of experience. You need the right strategy, 
            the right guidance, and a proven system to start landing contracts now.
          </p>
        </div>
        
        {/* Stacked offer ladder with visual hierarchy */}
        <div className="mt-14 max-w-2xl mx-auto space-y-5">
          {paths.map((path) =>
            path.featured ? (
              /* VIP — large, dark, dominant */
              <a
                key={path.solution}
                href={path.href}
                className="group relative block rounded-2xl p-10 text-center space-y-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
                style={{
                  background: 'hsl(0, 0%, 8%)',
                  border: '2px solid hsl(45, 75%, 47%)',
                }}
              >
                {path.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{ background: 'hsl(45, 75%, 47%)', color: 'hsl(0, 0%, 8%)' }}>
                    <Star className="h-3 w-3" />
                    {path.badge}
                  </span>
                )}
                <p className="text-sm text-white/60">{path.need}</p>
                <p className="font-display text-2xl font-bold text-white">
                  {path.solution}
                </p>
                <p className="font-display text-4xl font-extrabold text-primary">{path.price}</p>
                <span className="btn-gold text-base px-10 py-4 rounded-xl inline-flex items-center justify-center">
                  Reserve My Spot →
                </span>
              </a>
            ) : path.price === "$197/mo" ? (
              /* Masterclass — medium, white card with border */
              <a
                key={path.solution}
                href={path.href}
                className="group block rounded-xl bg-card p-8 border-2 border-border text-center space-y-3 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 active:scale-[0.98]"
              >
                <p className="text-sm text-muted-foreground">{path.need}</p>
                <p className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {path.solution}
                </p>
                <p className="font-display text-3xl font-extrabold text-primary">{path.price}</p>
                <span className="inline-block text-sm font-bold uppercase tracking-wider text-foreground border-2 border-foreground rounded-lg px-8 py-3 group-hover:border-primary group-hover:text-primary transition-colors">
                  Join Now →
                </span>
              </a>
            ) : (
              /* Substack — smallest, text-link CTA */
              <a
                key={path.solution}
                href={path.href}
                className="group block rounded-xl bg-card p-6 border border-border text-center space-y-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
              >
                <p className="text-xs text-muted-foreground">{path.need}</p>
                <p className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {path.solution} — {path.price}
                </p>
                <span className="inline-block text-sm font-semibold text-primary underline underline-offset-4 group-hover:text-primary/80 transition-colors">
                  Subscribe →
                </span>
              </a>
            )
          )}
        </div>
        
        <div className="mt-14 text-center">
          <p className="text-muted-foreground max-w-xl mx-auto">
            Choose your starting point. Take the first step. The contracts are out there — Towan will show you how to win them.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-20 border-t border-border pt-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Towan Isom | GovCon Strategy Hub. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClosingSection;