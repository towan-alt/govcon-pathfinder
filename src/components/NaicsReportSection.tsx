import { ArrowRight, FileSearch, Inbox, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { trackCta } from "@/lib/track";

const points = [
  {
    icon: FileSearch,
    title: "Your suggested NAICS codes",
    text: "The codes that match what your business actually sells, with plain-language descriptions.",
  },
  {
    icon: Inbox,
    title: "Open opportunities, in your inbox",
    text: "A report of current federal opportunities posted for your code, plus new matches every week.",
  },
  {
    icon: Map,
    title: "A clear next step",
    text: "Where your work is being bought and what to do about it, without the guesswork.",
  },
];

const NaicsReportSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="eyebrow-dark text-xs">Start Here · Free</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground !leading-[1.15]">
              Find out which codes fit your business.{" "}
              <em className="text-primary italic">Then see who is buying.</em>
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              Most small businesses register under the wrong NAICS codes or miss the codes where
              agencies actually buy what they sell. Tell us about your business and we will send you
              suggested codes, plain-language explanations, and a report of open federal
              opportunities for your code.
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Suggestions are based on the official NAICS catalog and current SAM.gov postings. They
              are guidance, not an official classification.
            </p>
            <Link
              to="/naics"
              onClick={() => trackCta("home-naics-section")}
              className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-4 rounded-md"
            >
              Get My NAICS Codes + Report
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-5">
            {points.map((p) => (
              <div key={p.title} className="flex items-start gap-4 rounded-lg border border-border bg-card p-5">
                <p.icon className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{p.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NaicsReportSection;
