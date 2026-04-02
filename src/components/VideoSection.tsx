import { Play } from "lucide-react";
import { useState } from "react";
import towanHero from "@/assets/towan-hero.jpg";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="section-navy py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="eyebrow text-xs">See It In Action</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
              Watch Towan walk you through the program
            </h2>
            <p className="text-base text-white/60 leading-relaxed">
              In this overview, Towan breaks down exactly how everyday businesses land their first 
              federal contract — even with zero government experience.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                "How the federal marketplace actually works",
                "What makes you competitive (hint: it's not experience)",
                "The exact steps to go from registered to winning",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl" style={{ background: "hsl(0 0% 8%)" }}>
            {!isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group cursor-pointer z-10"
                aria-label="Play video"
              >
                <img
                  src={towanHero}
                  alt="Video thumbnail"
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
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
