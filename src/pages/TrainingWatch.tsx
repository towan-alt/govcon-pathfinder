import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, Play, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { StatsStrip } from "@/components/funnel/FunnelBits";
import CountdownBoxes from "@/components/training/CountdownBoxes";
import TrainingRegisterForm from "@/components/training/TrainingRegisterForm";
import programBriefing from "@/assets/program-briefing.jpg";
import {
  ASSESSMENT_LENGTH, CTA_AT_SECONDS, formatEt, formatTimeEt, REPLAY_HOURS, REPLAY_VIDEO_URL, TRAINING_TITLE, TRAINING_VIDEO_SECONDS,
} from "@/lib/funnel";
import { trainingAction, useNow, useTrainingReg } from "@/lib/trainingApi";
import { trackCta, trackEvent } from "@/lib/track";

const CHAPTERS = [
  "Registering and waiting",
  "Chasing every RFP",
  "A generic capability statement",
  "Missing the relationship window",
  "No past performance strategy",
];

const isFile = (u: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);

function withStart(url: string, seconds: number) {
  try {
    const u = new URL(url);
    u.searchParams.set("start", String(Math.floor(seconds)));
    u.searchParams.set("autoplay", "1");
    return u.toString();
  } catch {
    return url;
  }
}

const Agenda = () => (
  <div>
    <h2 className="font-display text-xl font-bold text-white mb-4">What we'll cover</h2>
    <ol className="space-y-3">
      {CHAPTERS.map((c, i) => (
        <li key={c} className="flex gap-4 rounded-lg border border-white/10 p-4">
          <span className="font-display text-xl font-bold text-primary">{i + 1}</span>
          <span className="text-white/85">Mistake {i + 1}: {c}</span>
        </li>
      ))}
    </ol>
  </div>
);

const TrainingWatch = () => {
  const [params] = useSearchParams();
  const id = params.get("r");
  const { reg, state } = useTrainingReg(id);
  const now = useNow();

  const [playing, setPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  const [playKey, setPlayKey] = useState(0);
  const [position, setPosition] = useState(0);
  const [ended, setEnded] = useState(false);
  const playStartedAt = useRef(0);
  const watched = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    void trackEvent("training_watch");
  }, []);

  const start = reg ? new Date(reg.session_start).getTime() : 0;
  const expiresAt = start + REPLAY_HOURS * 3600000;
  const before = reg && reg.session_type !== "instant" && now < start;
  const expired = reg && now > expiresAt;
  const inShowing = reg && reg.session_type !== "instant" && now >= start && now < start + TRAINING_VIDEO_SECONDS * 1000;

  const begin = (fromSeconds: number) => {
    setOffset(fromSeconds);
    setPosition(fromSeconds);
    setEnded(false);
    playStartedAt.current = Date.now();
    setPlaying(true);
    setPlayKey((k) => k + 1);
    void trackEvent("video_play", "training-replay");
    if (id) void trainingAction({ action: "progress", id, seconds: watched.current, pct: (fromSeconds / TRAINING_VIDEO_SECONDS) * 100 });
  };

  const join = () => begin(inShowing ? Math.floor((Date.now() - start) / 1000) : 0);

  // Position: real currentTime for file videos, wall clock otherwise.
  useEffect(() => {
    if (!playing || ended) return;
    const t = setInterval(() => {
      const v = videoRef.current;
      const pos = v ? v.currentTime : offset + (Date.now() - playStartedAt.current) / 1000;
      if (!v || !v.paused) watched.current += 1;
      setPosition(pos);
      const dur = v && v.duration && isFinite(v.duration) ? v.duration : TRAINING_VIDEO_SECONDS;
      if (pos >= dur - 0.5) setEnded(true);
    }, 1000);
    return () => clearInterval(t);
  }, [playing, ended, offset, playKey]);

  const report = useCallback(() => {
    if (!id || !playing) return;
    const dur = videoRef.current?.duration && isFinite(videoRef.current.duration) ? videoRef.current.duration : TRAINING_VIDEO_SECONDS;
    void trainingAction({ action: "progress", id, seconds: watched.current, pct: Math.min(100, (position / dur) * 100) });
  }, [id, playing, position]);

  // Save progress every 15 seconds.
  const reportRef = useRef(report);
  reportRef.current = report;
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => reportRef.current(), 15000);
    return () => { clearInterval(t); reportRef.current(); };
  }, [playing]);
  useEffect(() => { if (ended) report(); }, [ended, report]);

  const showCta = position >= CTA_AT_SECONDS || ended;
  const ctaClick = (ctaId: string) => {
    trackCta(ctaId);
    if (id) void trainingAction({ action: "cta", id });
  };

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center section-navy"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }

  const CtaPanel = ({ sticky }: { sticky?: boolean }) => (
    <div className={`${sticky ? "fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden" : "animate-fade-in"} `}>
      <div className="rounded-2xl bg-primary p-5 md:p-6 shadow-2xl flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <p className="font-display text-lg md:text-2xl font-bold text-primary-foreground !leading-[1.2]">Your next step: the $19 GovCon Launch Kit</p>
          {!sticky && <p className="text-sm text-primary-foreground/85 mt-1">Put your business foundation in place: EIN, banking, NAICS, SAM.gov and a setup roadmap.</p>}
        </div>
        <Link to="/launch-kit" onClick={() => ctaClick(sticky ? "watch-cta-sticky" : "watch-cta")} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-bold text-white">
          Get the Launch Kit · $19 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  // No registration or replay expired: show the picker.
  if (state === "missing" || expired) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 section-navy pt-28 pb-16 lg:pt-36">
          <div className="container mx-auto px-6 max-w-5xl grid lg:grid-cols-[1fr_1fr] gap-10 items-start">
            <div>
              <p className="eyebrow text-xs">{expired ? "Replay expired" : "Free 30-minute training"}</p>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-white mt-3 !leading-[1.15]">
                {expired ? "Your replay has expired. Pick a new time." : TRAINING_TITLE}
              </h1>
              <p className="text-white/80 mt-4">Choose a showing that fits your day, or watch right now.</p>
              <div className="mt-8"><Agenda /></div>
            </div>
            <TrainingRegisterForm heading="Pick your time" />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const src = REPLAY_VIDEO_URL;
  const afterShowing = reg && reg.session_type !== "instant" && !inShowing && !before;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 section-navy pt-28 pb-24 lg:pt-36">
        <div className="container mx-auto px-6 max-w-6xl">
          <p className="eyebrow text-xs">
            {reg?.session_type === "live" ? "Live with Towan" : reg?.session_type === "showing" ? "Scheduled showing" : "On-demand training"}
            {reg?.first_name ? ` · Welcome, ${reg.first_name}` : ""}
          </p>
          <h1 className="font-display text-2xl md:text-4xl font-bold text-white mt-3 mb-8 !leading-[1.15]">{TRAINING_TITLE}</h1>

          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
            <div className="space-y-8">
              {before ? (
                <div className="rounded-xl border border-white/15 p-8 text-center space-y-5">
                  <p className="text-white/80">Your training starts at <strong className="text-white">{formatTimeEt(new Date(start))}</strong>, {formatEt(new Date(start))}.</p>
                  <CountdownBoxes ms={start - now} />
                  <p className="text-xs text-white/60">Keep this page open. The player appears here when it's time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-navy">
                    {!playing ? (
                      <>
                        <img src={programBriefing} alt="Towan Isom presenting the training" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/55" />
                        <button onClick={join} className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" aria-label="Play the training">
                          <span className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg"><Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" /></span>
                          <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                            {inShowing ? "Join the showing in progress" : afterShowing ? "Watch the replay" : "Play the training"}
                          </span>
                        </button>
                      </>
                    ) : !src ? (
                      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                        <p className="text-white/70 text-sm">The training video is being captioned and will appear here shortly.</p>
                      </div>
                    ) : isFile(src) ? (
                      <video
                        key={playKey}
                        ref={videoRef}
                        src={src}
                        controls
                        autoPlay
                        playsInline
                        onLoadedMetadata={(e) => { e.currentTarget.currentTime = offset; }}
                        onEnded={() => setEnded(true)}
                        className="absolute inset-0 h-full w-full"
                      />
                    ) : (
                      <iframe key={playKey} src={withStart(src, offset)} title={TRAINING_TITLE} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
                    )}
                  </div>
                  {playing && offset > 0 && (
                    <button onClick={() => begin(0)} className="inline-flex items-center gap-2 text-sm text-teal-on-dark underline">
                      <RotateCcw className="h-4 w-4" /> Start from the beginning
                    </button>
                  )}
                </div>
              )}

              {showCta && <CtaPanel />}

              {(ended || afterShowing) && (
                <div className="rounded-xl border border-white/15 p-5 text-white/85 text-sm">
                  Missed part of it? Replay available for {REPLAY_HOURS} hours, until {formatEt(new Date(expiresAt))}.
                </div>
              )}

              <Agenda />
            </div>

            <aside className="lg:sticky lg:top-28 rounded-2xl bg-card p-6 space-y-4 border-t-4 border-primary">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your next step</p>
              <h2 className="font-display text-2xl font-bold text-foreground !leading-[1.2]">Get the Launch Kit</h2>
              <p className="text-sm text-foreground/80">Get your business foundation in place with the guide, setup roadmap and official resource links. $19, one time.</p>
              <Link to="/launch-kit" onClick={() => ctaClick("watch-launch-kit")} className="btn-gold w-full gap-2 py-3.5">
                Get the Launch Kit · $19 <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
          <div className="mt-16 pt-10 border-t border-white/10"><StatsStrip /></div>
        </div>
      </main>
      <SiteFooter />
      {showCta && <CtaPanel sticky />}
    </div>
  );
};

export default TrainingWatch;
