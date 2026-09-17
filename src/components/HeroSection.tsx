import { Play } from "lucide-react";
import { useState } from "react";
import towanHero from "@/assets/towan-hero.jpg";
import { trackCta } from "@/lib/track";

const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="section-navy min-h-[90vh] flex items-center relative overflow-hidden">
      <div className="container mx-auto px-6 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <p className="eyebrow text-xs">
              Government Contract Strategist · SBA Emerging Leaders Expert
            </p>

            <div className="space-y-2">
              <p className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-none">
                $27M
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                in federal contracts executed
              </p>
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.15]">
              I help small businesses{" "}
              <em className="text-primary not-italic">win</em> in the federal marketplace.
            </h1>

            <p className="text-base text-white/60 leading-relaxed max-w-lg">
              With 25+ years of experience, 105+ contracts executed, and 6,500+ businesses coached — 
              I'll show you exactly how to land your first (or next) government contract.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/book"
                onClick={() => trackCta("hero-book")}
                className="btn-gold text-sm px-8 py-3.5 rounded-md"
              >
                Book a Strategy Call
              </a>
              <a href="#about" className="btn-outline-light text-sm px-8 py-3.5 rounded-md">
                Learn More
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-2xl" style={{ background: "hsl(0 0% 8%)" }}>
              {!isPlaying ? (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer z-10"
                  aria-label="Play video"
                >
                  <img
                    src={towanHero}
                    alt="Towan Isom"
                    className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-black ml-0.5" fill="currentColor" />
                  </div>
                </button>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "hsl(0 0% 6%)" }}>
                  <p className="text-white/50 text-sm">Video player — paste your embed URL here</p>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 text-center">
              Government Contract Strategist <span className="text-primary">·</span> SBA Emerging Leaders Expert
            </p>

            <div className="rounded-lg p-5" style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.1)" }}>
              <p className="text-sm text-white/70 italic leading-relaxed">
                "She doesn't just talk strategy — she hands you the actual playbook that won contracts. 
                Game-changing."
              </p>
              <p className="text-xs text-white/40 mt-2 font-semibold">— Workshop Participant</p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-10 max-w-5xl">
          {[
            { number: "105+", label: "Federal Contracts Executed" },
            { number: "$25M+", label: "Revenue Generated" },
            { number: "6,500+", label: "Small Businesses Coached" },
            { number: "25+", label: "Years of Experience" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-display text-2xl font-bold text-primary md:text-3xl">{stat.number}</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
