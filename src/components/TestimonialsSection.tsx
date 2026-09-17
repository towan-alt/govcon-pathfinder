import { Quote } from "lucide-react";
import towanHero from "@/assets/towan-hero.jpg";
import programBriefing from "@/assets/program-briefing.jpg";
import VideoFrame from "@/components/VideoFrame";
import { FIGURES } from "@/lib/brand";

const written = [
  {
    name: "Felicia Annette Embry",
    role: "Business Owner · Workshop Participant",
    result: "Rebuilt her market research before bidding",
    text: "New info after new info. I came in thinking I understood marketing — I didn't. Towan opened my eyes to the research side of business that nobody talks about.",
  },
  {
    name: "Abdul H. Jiwani",
    role: "Business Owner · Workshop Participant",
    result: "Moved from scattered tactics to one system",
    text: "Towan helped me see that winning in business isn't about isolated tactics — it's about the full system. Research, knowing your customer, strategic planning, execution, and feedback.",
  },
  {
    name: "Workshop Participant",
    role: "Small Business Owner",
    result: "Did more with a smaller budget",
    text: "Towan showed me that marketing isn't about spending more — it's about strategy. She helped me understand that with the right plan and follow-up process, I could do more with less budget.",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-24" style={{ background: "hsl(0 0% 4%)" }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
            <p className="eyebrow text-xs">Client Results</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
              What people say after doing{" "}
              <em className="text-primary italic">the work</em>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <VideoFrame
              poster={programBriefing}
              posterAlt="Towan Isom leading a small-business briefing"
              title="Workshop participants on what changed"
              videoId="testimonial-workshop"
              transcript="Participants from Towan's workshop series describe what changed in their businesses: identifying the agencies that actually buy their service, rewriting their capability statement around that buyer, and following a consistent weekly capture rhythm instead of reacting to whatever notice appeared that day."
            />
            <VideoFrame
              poster={towanHero}
              posterAlt="Towan Isom speaking with a client"
              title="A client walkthrough of the positioning process"
              videoId="testimonial-client"
              transcript="A client walks through the positioning process step by step: the intake audit, correcting NAICS codes, building an agency target list from real buying history, and the bid/no-bid framework used to decide which opportunities to pursue."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {written.map((t) => (
              <figure
                key={t.name}
                className="rounded-xl p-6 space-y-4"
                style={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
              >
                <Quote className="h-6 w-6 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {t.result}
                </p>
                <blockquote className="text-sm text-white/80 italic leading-relaxed">
                  "{t.text}"
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <span
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-primary"
                    style={{ background: "hsl(0 0% 100% / 0.08)", border: "1px solid hsl(45 55% 55% / 0.35)" }}
                    aria-hidden="true"
                  >
                    {initials(t.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-white">{t.name}</span>
                    <span className="block text-xs text-white/60">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="text-xs text-white/55">
            Company names withheld where participants asked. Program figures such as{" "}
            {FIGURES.applicationsGenerated} applications generated reflect delivery data from national
            program work; individual results vary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
