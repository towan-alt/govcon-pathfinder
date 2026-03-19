const paths = [
  { need: "A custom roadmap built for YOUR business", solution: "VIP Strategy Session", href: "#vip", price: "$997" },
  { need: "Ongoing training and community", solution: "Monthly Masterclass", href: "#masterclass", price: "$197/mo" },
  { need: "Weekly intel and strategy", solution: "Subscribe to the Substack", href: "#substack", price: "$27/mo" },
];

const ClosingSection = () => {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="divider mx-auto" />
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl">
            The Government Is Spending. Are You Getting Your Share?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You don't need a team of 50, a fancy office, or a decade of experience. You need the right strategy, 
            the right guidance, and someone who has already done what you're trying to do. That's Towan.
          </p>
        </div>
        
        <div className="mt-14 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
          {paths.map((path) => (
            <a
              key={path.solution}
              href={path.href}
              className="group rounded-xl bg-card p-8 border border-border text-center space-y-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
            >
              <p className="text-sm text-muted-foreground">{path.need}</p>
              <p className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                {path.solution}
              </p>
              <p className="font-display text-2xl font-extrabold text-primary">{path.price}</p>
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
