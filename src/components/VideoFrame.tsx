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
  const [failed, setFailed] = useState(false);

  const play = () => {
    setIsPlaying(true);
    void trackEvent("video_play", videoId);
  };

  // No embed source configured, or the embed failed to load: keep the poster
  // visible and explain instead of swapping to a dead panel.
  const showFallback = !src || failed;

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-video rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "hsl(var(--navy-light))" }}
      >
        {!isPlaying || showFallback ? (
          <>
            <img
              src={poster}
              alt={posterAlt}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-black/50" />
            {showFallback ? (
              <div className="absolute inset-x-0 bottom-0 z-10 bg-black/70 px-4 py-3 text-center">
                <p className="text-white/80 text-xs">
                  This video is being captioned and will appear here shortly.
                </p>
              </div>
            ) : (
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
            )}
          </>
        ) : (
          <iframe
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full"
          />
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
