import { ArrowRight, Briefcase, Layers, Radar } from "lucide-react";
import { Link } from "react-router-dom";
import towanHero from "@/assets/towan-hero.jpg";
import { BRAND, FIGURES } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const differentiators = [
  {
    icon: Briefcase,
    title: "An active federal contractor",
    text: `Towan runs a government contracting business today — ${FIGURES.contracts} contracts and task orders pursued, staffed, managed and delivered.`,
  },
  {
    icon: Layers,
    title: "The whole cycle, not one slice",
    text: "Positioning, capture, proposals, staffing and delivery — taught by someone accountable for the outcome of each one.",
  },
  {
    icon: Radar,
    title: "Current, not historical",
    text: "Today's evaluation criteria, today's set-aside landscape, and how AI is reshaping bid preparation.",
  },
];

const WhyTowanSection = () => {
  return (
    <section id="about" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-14 items-start">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Why {BRAND.founder}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
                You are not learning from someone who only{" "}
                <span className="text-primary italic">teaches</span> government contracting.
              </h2>
              <p className="text-base text-foreground/80 leading-relaxed">
                You are learning from an active federal contractor who has pursued, won, staffed,
                managed and delivered the work — with the U.S. Marine Corps, Army, Veterans Affairs,
                the Department of Commerce and others — then built the training that put{" "}
                {FIGURES.trained} other small businesses on the same path.
              </p>
              <p className="text-base text-foreground/80 leading-relaxed">
                She started the firm herself, grew it into a woman-owned company working across five
                continents, and still sits in the bid reviews. {BRAND.method} is that experience,
                written down as a repeatable system.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/assessment"
                  onClick={() => trackCta("about-assessment")}
                  className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm"
                >
                  Take the Free Readiness Assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/about"
                  onClick={() => trackCta("about-full-bio")}
                  className="text-sm font-semibold text-foreground hover:text-primary inline-flex items-center gap-1.5"
                >
                  Read the full story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[320px]">
              <img
                src={towanHero}
                alt={`${BRAND.founder}, ${BRAND.founderRole}`}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover object-[center_20%] rounded-2xl shadow-xl"
              />
              <p className="mt-3 text-sm font-bold text-foreground">{BRAND.founder}</p>
              <p className="text-xs text-muted-foreground">{BRAND.founderRole}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {differentiators.map((d) => (
              <div key={d.title} className="bg-card border border-border rounded-xl p-6 space-y-3">
                <d.icon className="h-6 w-6 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">{d.title}</h3>
                <p className="text-sm text-foreground/75 leading-relaxed">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyTowanSection;
