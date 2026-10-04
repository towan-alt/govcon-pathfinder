import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import { TRAINING_MINUTES } from "@/lib/funnel";
import { trackCta } from "@/lib/track";

const TrainingBanner = () => (
  <section className="bg-primary py-6">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
      <div className="flex items-center gap-3">
        <PlayCircle className="h-8 w-8 shrink-0 text-primary-foreground hidden md:block" />
        <p className="font-display text-lg md:text-xl font-bold text-primary-foreground !leading-[1.3]">
          Free {TRAINING_MINUTES}-minute training: The 5 costly mistakes that keep small businesses from winning their first federal contract
        </p>
      </div>
      <Link to="/training" onClick={() => trackCta("home-training-banner")} className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-bold text-white">
        Watch the Free Training <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </section>
);

export default TrainingBanner;
