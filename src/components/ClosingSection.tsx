import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { trackCta } from "@/lib/track";

const ClosingSection = () => {
  return (
    <section className="py-20 lg:py-24" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center space-y-7">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.15]">
            Find out where you stand{" "}
            <em className="text-primary italic">before you bid.</em>
          </h2>
          <p className="text-base text-white/75 max-w-xl mx-auto leading-relaxed">
            Eight questions, about two minutes, and one recommended next step based on where your
            business actually is today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/assessment"
              onClick={() => trackCta("closing-assessment")}
              className="btn-gold inline-flex items-center gap-2 text-sm px-10 py-4 rounded-md"
            >
              Take the Free Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/book"
              onClick={() => trackCta("closing-book")}
              className="btn-outline-light text-sm px-10 py-4 rounded-md"
            >
              Book a Strategy Call
            </Link>
          </div>
          <p className="text-xs text-white/60">
            No cost, no obligation. Nothing here guarantees a contract award.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClosingSection;
