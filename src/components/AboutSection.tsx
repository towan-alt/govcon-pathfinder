import { Check, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import towanHero from "@/assets/towan-hero.jpg";

const credentials = [
  "Built a federal contracting firm from scratch → now operating across five continents",
  "Secured and executed contracts with the U.S. Marine Corps, Army, VA, Department of Commerce, and more",
  "Among the top 3% of women-owned businesses to surpass $25M in revenue",
  "Coached 6,500+ small businesses through SBA and national programs",
  "Led campaigns and projects for brands like Nike, Comcast Xfinity, MedStar, and GlaxoSmithKline",
];

const benefits = [
  "Real proposal strategies—not theory",
  "Proven positioning frameworks that win contracts",
  "Access to the same documents, structures, and thinking used to secure millions in revenue",
  "A clear path from "interested in GovCon" → to winning and scaling contracts",
];

const failures = [
  "They chase the wrong opportunities",
  "They don't understand positioning",
  "Their proposals sound like everyone else",
];

const AboutSection = () => {
  return (
    <section id="about" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Intro */}
          <div className="grid lg:grid-cols-[280px_1fr] gap-12 items-start">
            <div className="flex justify-center lg:justify-start">
              <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/20">
                <img
                  src={towanHero}
                  alt="Towan Isom"
                  className="w-full h-full object-cover object-[center_25%]"
                />
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                About Towan Isom
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
                You don't need another GovCon "expert"{" "}
                <span className="text-primary italic">who's never actually won.</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                You need someone who's built, bid, lost, won, scaled—and knows exactly what it
                takes to land and grow federal contracts. <strong className="text-foreground">That's Towan Isom.</strong>
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                She didn't learn GovCon from a course. She built a woman-owned federal contracting
                and marketing firm from the ground up—growing it into a multinational company
                operating across five continents.
              </p>
              <p className="text-base text-foreground font-medium leading-relaxed">
                She's not here to motivate you. She's here to show you exactly how contracts are
                won—and how to position your business to get paid.
              </p>
            </div>
          </div>

          {/* What makes Towan different */}
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-foreground">
              What makes Towan <span className="text-primary italic">different</span>
            </h3>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {credentials.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="h-4 w-4 flex-shrink-0 mt-1 text-primary" />
                  <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Two-column: What you get + Reality check */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* What you get */}
            <div className="bg-card border border-border rounded-2xl p-8 space-y-5">
              <h3 className="font-display text-xl font-bold text-foreground">
                What you actually get working with Towan
              </h3>
              <ul className="space-y-3">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 flex-shrink-0 mt-1 text-primary" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reality check */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 space-y-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h3 className="font-display text-xl font-bold text-foreground">Reality check</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Most businesses fail in government contracting because:
              </p>
              <ul className="space-y-2">
                {failures.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-destructive mt-0.5 text-sm">✕</span>
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-base font-bold text-foreground pt-2">Towan fixes that.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              If you're serious about winning contracts—not just learning about them—
            </p>
            <Link
              to="/events"
              className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold transition-colors"
            >
              Start with a $29 Workshop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
