import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import programBriefing from "@/assets/program-briefing.jpg";
import VideoFrame from "@/components/VideoFrame";
import { BRAND } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const points = [
  "How the federal marketplace actually buys",
  "What makes you competitive — positioning, not tenure",
  "The steps from registered to consistently bidding",
];

const VideoSection = () => {
  return (
    <section className="section-navy py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="eyebrow text-xs">See It In Action</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
              Watch {BRAND.founder} walk through {BRAND.method}
            </h2>
            <p className="text-base text-white/75 leading-relaxed">
              A short overview of how the system works end to end, from choosing the right codes to
              deciding which opportunities deserve a bid.
            </p>
            <ul className="space-y-3 pt-1">
              {points.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm text-white/80">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/assessment"
              onClick={() => trackCta("video-assessment")}
              className="btn-gold inline-flex items-center gap-2 text-sm px-7 py-3.5 rounded-md"
            >
              Take the Free Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <VideoFrame
            poster={programBriefing}
            posterAlt="Towan Isom presenting the GovCon Blueprint to business owners"
            title={`${BRAND.method} overview`}
            videoId="blueprint-overview"
            transcript={`${BRAND.founder} walks through ${BRAND.method}: how the federal marketplace buys, why positioning beats tenure, how to choose codes and agencies based on real buying history, how to build a capability statement an evaluator will actually read, and how to decide bid or no-bid so your time goes to opportunities you can win and deliver.`}
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
