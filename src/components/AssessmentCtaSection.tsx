import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BRAND } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const promises = [
  "8 questions, about two minutes",
  "A readiness score across positioning, registration and capture",
  "One recommended next step — not a menu of options",
];

const AssessmentCtaSection = () => {
  return (
    <section id="assessment" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto rounded-2xl border border-primary/25 bg-card p-8 md:p-12 text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Start Here · Free
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
            The Free GovCon Readiness Assessment
          </h2>
          <p className="text-base text-foreground/80 leading-relaxed max-w-2xl mx-auto">
            Answer eight questions about your business and {BRAND.method} will tell you where you
            actually stand in the federal marketplace — and which step to take next.
          </p>

          <ul className="grid sm:grid-cols-3 gap-4 text-left pt-2">
            {promises.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <Link
              to="/assessment"
              onClick={() => trackCta("assessment-band")}
              className="btn-gold inline-flex items-center gap-2 px-9 py-4 rounded-md text-base"
            >
              Take the Free Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssessmentCtaSection;
