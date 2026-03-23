import { Play } from "lucide-react";
import { useState } from "react";

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-display">
            See It In Action
          </p>
          <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl">
            How Small Businesses Are Winning Government Contracts
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch Towan break down exactly how everyday businesses land their first federal contract — even with zero government experience.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-foreground/95 border border-border shadow-2xl">
            {!isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 group cursor-pointer z-10"
                aria-label="Play video"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/80 to-foreground/90" />

                {/* Play button */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                </div>
                <span className="relative z-10 text-sm font-semibold text-white/80 uppercase tracking-wider">
                  Watch Now
                </span>
              </button>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/60 text-sm font-display">
                  Video player — paste your YouTube or Vimeo embed URL here
                </p>
              </div>
            )}

            {/* Placeholder thumbnail area */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/20 text-xs font-display uppercase tracking-widest">
                  Video Thumbnail
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
