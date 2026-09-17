import { Play } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/track";

type VideoFrameProps = {
  /** Poster image shown before playback. */
  poster: string;
  posterAlt: string;
  title: string;
  /** Identifier used for play tracking. */
  videoId: string;
  /** Plain-text transcript shown under the player. */
  transcript: string;
  /** Optional embed URL. When absent, a placeholder explains the video is coming. */
  src?: string;
};

const VideoFrame = ({ poster, posterAlt, title, videoId, transcript, src }: VideoFrameProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    setIsPlaying(true);
    void trackEvent("video_play", videoId);
  };

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "hsl(0 0% 8%)" }}
      >
        {!isPlaying ? (
          <>
            <img
              src={poster}
              alt={posterAlt}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-black/50" />
            <button
              onClick={play}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 group cursor-pointer z-10"
              aria-label={`Play video: ${title}`}
            >
              <span className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 text-black ml-0.5" fill="currentColor" />
              </span>
              <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                Play video · Captions available
              </span>
            </button>
          </>
        ) : src ? (
          <iframe
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
            style={{ background: "hsl(0 0% 6%)" }}
          >
            <p className="text-white/70 text-sm">
              This video is being captioned and will appear here shortly.
            </p>
          </div>
        )}
      </div>

      <details className="rounded-lg border border-white/15 px-4 py-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-white/70 hover:text-primary">
          Read the transcript
        </summary>
        <p className="mt-3 text-sm text-white/75 leading-relaxed">{transcript}</p>
      </details>
    </div>
  );
};

export default VideoFrame;
