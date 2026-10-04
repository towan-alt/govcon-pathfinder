import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import VideoFrame from "@/components/VideoFrame";
import { StatsStrip } from "@/components/funnel/FunnelBits";
import programBriefing from "@/assets/program-briefing.jpg";
import { ASSESSMENT_LENGTH, getLead, REPLAY_VIDEO_URL, TRAINING_TITLE } from "@/lib/funnel";
import { trackCta, trackEvent } from "@/lib/track";

const CHAPTERS = [
  "Registering and waiting",
  "Chasing every RFP",
  "A generic capability statement",
  "Missing the relationship window",
  "No past performance strategy",
];

const TrainingWatch = () => {
  const lead = getLead();
  useEffect(() => {
    void trackEvent("training_watch");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 section-navy pt-28 pb-16 lg:pt-36">
        <div className="container mx-auto px-6 max-w-6xl">
          <p className="eyebrow text-xs">On-demand training{lead?.firstName ? ` · Welcome, ${lead.firstName}` : ""}</p>
          <h1 className="font-display text-2xl md:text-4xl font-bold text-white mt-3 mb-8 !leading-[1.15]">{TRAINING_TITLE}</h1>
          <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
            <div className="space-y-8">
              <VideoFrame
                poster={programBriefing}
                posterAlt="Towan Isom presenting the training"
                title={TRAINING_TITLE}
                videoId="training-replay"
                src={REPLAY_VIDEO_URL || undefined}
                transcript="The full transcript will be posted here with the replay video."
              />
              <div>
                <h2 className="font-display text-xl font-bold text-white mb-4">Chapters</h2>
                <ol className="space-y-3">
                  {CHAPTERS.map((c, i) => (
                    <li key={c} className="flex gap-4 rounded-lg border border-white/10 p-4">
                      <span className="font-display text-xl font-bold text-primary">{i + 1}</span>
                      <span className="text-white/85">Mistake {i + 1}: {c}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <aside className="lg:sticky lg:top-28 rounded-2xl bg-card p-6 space-y-4 border-t-4 border-primary">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your next step</p>
              <h2 className="font-display text-2xl font-bold text-foreground !leading-[1.2]">Get your score</h2>
              <p className="text-sm text-foreground/80">Find out which of the five mistakes is costing you the most. {ASSESSMENT_LENGTH}, free.</p>
              <Link to="/assessment" onClick={() => trackCta("watch-assessment")} className="btn-gold w-full gap-2 py-3.5">
                Get My Free Score <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
          <div className="mt-16 pt-10 border-t border-white/10"><StatsStrip /></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default TrainingWatch;
