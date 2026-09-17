import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import towanHero from "@/assets/towan-hero.jpg";
import VideoFrame from "@/components/VideoFrame";
import { BRAND, FIGURES } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const HeroSection = () => {
  return (
    <section className="section-navy flex items-center relative overflow-hidden">
      <div className="container mx-auto px-6 pt-32 pb-20 lg:pt-36 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-7">
            <p className="eyebrow text-xs">
              {BRAND.method} · from {BRAND.platform}
            </p>

            <h1 className="font-display text-3xl md:text-4xl lg:text-[3rem] font-bold text-white leading-[1.12]">
              Build a Government Contracting Business That Can{" "}
              <em className="text-primary not-italic">Compete</em>—and{" "}
              <em className="text-primary not-italic">Deliver</em>.
            </h1>

            <p className="text-base text-white/75 leading-relaxed max-w-xl">
              Learn the strategy, positioning, capture, proposal and delivery systems{" "}
              {BRAND.founder} used to execute more than 100 government contracts and coach thousands
              of small businesses.
            </p>

            <div className="flex flex-wrap gap-4 pt-1">
              <Link
                to="/assessment"
                onClick={() => trackCta("hero-assessment")}
                className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-4 rounded-md"
              >
                Take the Free GovCon Readiness Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/book"
                onClick={() => trackCta("hero-book")}
                className="btn-outline-light text-sm px-8 py-4 rounded-md"
              >
                Book a Strategy Call
              </Link>
            </div>

            <p className="text-xs text-white/60">
              Free · 8 questions · about two minutes · one recommended next step
            </p>
          </div>

          <div className="space-y-5">
            <VideoFrame
              poster={towanHero}
              posterAlt={`${BRAND.founder}, ${BRAND.founderRole}`}
              title={`${BRAND.founder} on competing in the federal marketplace`}
              videoId="hero-intro"
              transcript={`In this short introduction, ${BRAND.founder} explains what separates small businesses that win federal work from those that stall: correct registration and codes, positioning built around what a specific agency buys, a disciplined capture and follow-up rhythm, and the capacity to actually deliver once an award lands. She draws on ${FIGURES.contracts} contracts and task orders managed and ${FIGURES.contractValue} in federal contract value executed.`}
            />

            <div
              className="rounded-lg p-5 text-center"
              style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.1)" }}
            >
              <p className="text-sm text-white/85 leading-relaxed">
                <strong className="text-primary">{BRAND.founder}</strong> — Government Contract
                Strategist, SBA Emerging Leaders expert, and an active federal contractor today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
