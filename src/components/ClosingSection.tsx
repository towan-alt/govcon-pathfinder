const paths = [
  { need: "A done-for-you strategy engagement", solution: "VIP Strategy Session", href: "#vip-dfy", price: "$997" },
  { need: "Ongoing training and community", solution: "Monthly Masterclass", href: "#masterclass", price: "$197/mo" },
  { need: "Weekly intel and strategy", solution: "Subscribe to Substack", href: "#substack", price: "$27/mo" },
];

const ClosingSection = () => {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="divider mx-auto" />
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl">
            Start Winning Contracts Now.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You don't need a team of 50, a fancy office, or a decade of experience. You need the right strategy, 
            the right guidance, and a proven system to start landing contracts now.
          </p>
        </div>
        
        <div className="mt-14 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {paths.map((path) => (
            <a
              key={path.solution}
              href={path.href}
              className="group rounded-xl bg-card p-8 border-2 border-border text-center space-y-4 transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-2 active:scale-[0.98]"
            >
              <p className="text-sm text-muted-foreground">{path.need}</p>
              <p className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                {path.solution}
              </p>
              <p className="font-display text-2xl font-extrabold text-primary">{path.price}</p>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary/80 group-hover:text-primary transition-colors">
                Learn More →
              </span>
            </a>
          ))}
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
