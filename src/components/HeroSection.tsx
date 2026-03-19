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
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(42, 80%, 55%) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />
      
      <div className="container relative z-10 mx-auto px-6 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-8 animate-fade-up">
            <p className="eyebrow">
              The #1 Resource for Small Businesses Ready to Win Government Contracts
            </p>
            
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl" style={{ color: 'hsl(40, 20%, 99%)' }}>
              Stop Leaving Federal Dollars on the Table.
            </h1>
            
            <p className="text-lg leading-relaxed opacity-80 max-w-xl" style={{ color: 'hsl(40, 30%, 90%)' }}>
              The U.S. government spends over $7 trillion a year — and they need businesses just like yours. Towan Isom has executed 105+ federal contracts, built a $25M+ business from her basement, and now she's handing you the blueprint.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#vip" className="btn-gold">
                Get Your Roadmap →
              </a>
              <a href="#about" className="btn-outline-gold">
                Learn More
              </a>
            </div>
          </div>
          
          <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{
              boxShadow: '0 25px 60px hsl(0, 0%, 0%, 0.4), 0 0 0 1px hsl(42, 80%, 55%, 0.2)',
            }}>
              <img
                src={towanHero}
                alt="Towan Isom — CEO and GovCon Strategist"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
            </div>
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 lg:mt-24">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <p className="font-display text-3xl font-bold text-gold md:text-4xl">{stat.number}</p>
              <p className="text-sm font-medium opacity-70" style={{ color: 'hsl(40, 30%, 85%)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
