import heroBg from "@/assets/hero-bg.jpg";
import towanHero from "@/assets/towan-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/95 via-navy/85 to-navy/70" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          {/* Photo — larger and more commanding */}
          <div className="flex justify-center">
            <div className="w-[200px] h-[200px] rounded-full overflow-hidden shadow-2xl" style={{ border: '3px solid hsl(45, 75%, 47%)' }}>
              <img
                src={towanHero}
                alt="Towan Isom — CEO and GovCon Strategist"
                className="w-full h-full object-cover object-top scale-110 translate-y-1"
              />
            </div>
          </div>

          <p className="eyebrow text-sm tracking-[0.25em]">
            Government Contract Strategist · SBA Emerging Leaders Expert
          </p>

          <h1 className="font-display leading-[1.1] text-white uppercase">
            <span className="block text-2xl md:text-3xl lg:text-4xl font-bold text-white/90">
              She Built a $25M Federal Contracting Firm.
            </span>
            <span className="block text-3xl md:text-5xl lg:text-6xl font-black text-primary mt-2">
              Now She'll Show You How to Win Yours.
            </span>
          </h1>

          <p className="text-lg md:text-xl leading-relaxed text-white/75 max-w-2xl mx-auto">
            The U.S. government spends over <strong className="text-white">$7 trillion</strong> a year.
            Towan Isom has helped 6,500+ small businesses capture their share — with
            over <strong className="text-white">$25M in revenue</strong> generated and <strong className="text-white">105+ contracts</strong> executed.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <a href="#vip" className="btn-primary text-lg px-12 py-6 rounded-xl shadow-[0_6px_30px_hsl(0,0%,0%/0.4)]">
              Reserve Your Free Strategy Session →
            </a>
          </div>
          <p className="text-xs text-white/40 pt-2">No cost. No obligation. Limited spots each month.</p>
        </div>

        {/* Stats bar — numbers in gold */}
        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4 border-t border-white/10 pt-10 max-w-5xl mx-auto">
          {[
            { number: "105+", label: "Federal Contracts Executed" },
            { number: "$25M+", label: "Revenue Generated" },
            { number: "6,500+", label: "Small Businesses Coached" },
            { number: "25+", label: "Years of Experience" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <p className="font-display text-3xl font-black text-primary md:text-4xl">{stat.number}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;