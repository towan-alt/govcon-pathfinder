import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, PlayCircle } from "lucide-react";
import { formatSession, nextSessionStart, TRAINING_MINUTES } from "@/lib/funnel";
import { trackCta } from "@/lib/track";

const POINTS = [
  "The 5 costly mistakes that stall a first federal contract",
  "How to pick 3 to 5 target agencies instead of chasing every RFP",
  "What to put in place next, starting with the $19 Launch Kit",
];

const WebinarSection = () => {
  const session = useMemo(() => nextSessionStart(), []);
  return (
    <section id="webinar" className="section-navy py-16 md:py-20">
      <div className="container mx-auto px-5 md:px-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
        <div>
          <p className="eyebrow text-xs">Free Webinar</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-white !leading-[1.15]">
            Prefer to watch first? Join the free {TRAINING_MINUTES}-minute webinar.
          </h2>
          <ul className="mt-6 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-white/85">
                <Check className="h-5 w-5 shrink-0 text-gold" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-gold/40 bg-white/5 p-6 md:p-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
            <CalendarDays className="h-4 w-4" /> Next session
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-white !leading-[1.2]">{formatSession(session)}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
            <PlayCircle className="h-4 w-4" /> Or pick an on-demand replay when you register.
          </p>
          <Link
            to="/webinar"
            onClick={() => trackCta("home-webinar-register")}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-gold px-6 py-4 text-sm font-bold uppercase tracking-wide text-navy"
          >
            Save My Free Seat <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WebinarSection;
