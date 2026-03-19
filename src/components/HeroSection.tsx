import towanHero from "@/assets/towan-hero.jpg";

const stats = [
  { number: "105+", label: "Federal Contracts Executed" },
  { number: "$25M+", label: "In Revenue Generated" },
  { number: "6,500+", label: "Small Businesses Coached" },
  { number: "SBA", label: "Emerging Leaders Expert" },
];

const HeroSection = () => {
  return (
    <section className="section-navy relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-6 py-24 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-8 animate-fade-up">
            <p className="eyebrow">
              The #1 Resource for Small Businesses Ready to Win Government Contracts
            </p>

            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              How to Make Money Working with the Government.
            </h1>

            <p className="text-lg leading-relaxed text-white/70 max-w-xl">
              The U.S. government spends over $7 trillion a year — and they need businesses just like yours. Towan Isom has executed 105+ federal contracts, built a $25M+ business from her basement, and now she's handing you the blueprint.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#vip" className="btn-white">
                Get Your Roadmap →
              </a>
              <a href="#about" className="btn-outline">
                Learn More
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img
                src={towanHero}
                alt="Towan Isom — CEO and GovCon Strategist"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4 lg:mt-28 border-t border-white/10 pt-10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <p className="font-display text-3xl font-bold text-white md:text-4xl">{stat.number}</p>
              <p className="text-sm font-medium text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
