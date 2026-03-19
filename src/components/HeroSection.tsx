import heroBg from "@/assets/hero-bg.jpg";
import towanHero from "@/assets/towan-hero.jpg";
import { Monitor, FileCheck, Clock, DollarSign } from "lucide-react";

const details = [
  { icon: Monitor, label: "Format", value: "Virtual & Online" },
  { icon: FileCheck, label: "Contracts Won", value: "105+" },
  { icon: Clock, label: "Experience", value: "25+ Years" },
  { icon: DollarSign, label: "Revenue Generated", value: "$25M+" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,60%,18%)] via-[hsl(215,60%,18%,0.85)] to-[hsl(215,60%,18%,0.6)]" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px] items-start">
          {/* Left: headline + photo */}
          <div className="space-y-8 animate-fade-up">
            <p className="eyebrow">
              The #1 Resource for Small Businesses Ready to Win Government Contracts
            </p>

            <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl uppercase">
              How to Make Money Working with the{" "}
              <span className="text-[hsl(210,90%,70%)]">Government</span>
            </h1>

            <p className="text-lg leading-relaxed text-white/80 max-w-xl">
              The U.S. government spends over $7 trillion a year — and they need businesses just like yours. Towan Isom has the blueprint.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#vip" className="btn-white">
                Get Your Roadmap →
              </a>
              <a href="#about" className="btn-outline">
                Learn More
              </a>
            </div>

            {/* Inline photo */}
            <div className="pt-4 flex items-center gap-5">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white/20 flex-shrink-0">
                <img
                  src={towanHero}
                  alt="Towan Isom — CEO and GovCon Strategist"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white font-display font-bold text-lg">Towan Isom</p>
                <p className="text-white/60 text-sm">CEO, Isom Global Strategies · SBA Emerging Leaders Expert</p>
              </div>
            </div>
          </div>

          {/* Right: Program Details card (UK Online style) */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-[hsl(215,80%,42%)] px-6 py-4">
              <h2 className="font-display text-lg font-bold text-white uppercase tracking-wide">
                Program Details
              </h2>
            </div>
            <div className="p-6 space-y-0">
              {details.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between py-4 ${
                    i < details.length - 1 ? "border-b border-[hsl(210,20%,92%)]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-[hsl(215,80%,42%)]" />
                    <span className="text-sm font-bold uppercase tracking-wide text-[hsl(215,25%,30%)]">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[hsl(215,25%,20%)]">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 space-y-3">
              <a href="#vip" className="btn-primary w-full text-center text-sm">
                Reserve VIP Strategy Session
              </a>
              <a href="#masterclass" className="btn-outline w-full text-center text-sm !border-[hsl(215,80%,42%)] !text-[hsl(215,80%,42%)] hover:!bg-[hsl(215,80%,42%,0.08)]">
                Join Monthly Masterclass
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:mt-20 border-t border-white/15 pt-8">
          {[
            { number: "105+", label: "Federal Contracts Executed" },
            { number: "$25M+", label: "In Revenue Generated" },
            { number: "6,500+", label: "Small Businesses Coached" },
            { number: "SBA", label: "Emerging Leaders Expert" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <p className="font-display text-3xl font-extrabold text-white md:text-4xl">{stat.number}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
