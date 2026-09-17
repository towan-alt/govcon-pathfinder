import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import towanHero from "@/assets/towan-hero.jpg";
import { BRAND, FIGURES, STATS } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="section-navy pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_320px] gap-12 items-center">
              <div className="space-y-6">
                <p className="eyebrow text-xs">About {BRAND.founder}</p>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-[1.1]">
                  An active federal contractor who{" "}
                  <em className="text-primary italic">teaches what she still does.</em>
                </h1>
                <p className="text-base text-white/75 leading-relaxed">
                  {BRAND.founder} is the founder of {BRAND.platform} and the practitioner behind{" "}
                  {BRAND.method}. She has managed {FIGURES.contracts} contracts and task orders,
                  executed {FIGURES.contractValue} in federal contract value, and built a woman-owned
                  contracting and marketing firm that now works across five continents.
                </p>
              </div>
              <img
                src={towanHero}
                alt={`${BRAND.founder}, ${BRAND.founderRole}`}
                className="w-full aspect-[4/5] object-cover object-[center_20%] rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        <section className="py-16" style={{ background: "hsl(0 0% 4%)" }}>
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/60 leading-relaxed">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="space-y-5">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  The work behind the teaching
                </h2>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Towan has pursued, won, staffed, managed and delivered federal work with the U.S.
                  Marine Corps, the Army, Veterans Affairs, the Department of Commerce and other
                  agencies — {FIGURES.tasksDelivered} contract tasks personally delivered across those
                  engagements, leading teams that have averaged 60-plus people.
                </p>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Her firm has crossed {FIGURES.companyRevenue} in company revenue, placing it in the
                  top 3% of women-owned businesses by revenue. She has also led international
                  engagements with Fleishman Hillard, which means she understands how government
                  interfaces with large institutional operations, not only small contract vehicles.
                </p>
              </div>

              <div className="space-y-5">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Why she teaches
                </h2>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Towan built her own path into federal contracting without a roadmap, and watched
                  capable small businesses lose winnable work for reasons that were entirely fixable:
                  wrong codes, generic positioning, no target list, no follow-up. So she built the
                  training she wishes she had had.
                </p>
                <p className="text-base text-foreground/80 leading-relaxed">
                  She has directly trained {FIGURES.trained} small businesses and coached or supported{" "}
                  {FIGURES.coached} more through national small-business programs, including SBA
                  Emerging Leaders. She is a nationally recognized speaker on federal contracting and
                  small-business growth.
                </p>
              </div>

              <div className="space-y-5">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Still in the game
                </h2>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Towan is not describing what worked twenty years ago. She runs an active contracting
                  business today, sits in current bid reviews, and works with how AI is reshaping
                  federal and state bid preparation. In a market that changes every year, currency
                  matters as much as history.
                </p>
                <blockquote className="border-l-2 border-primary pl-5 py-2">
                  <p className="text-lg text-foreground italic leading-relaxed">
                    "What you need isn't more advice from people who haven't been in the trenches —
                    you need someone who's done the work."
                  </p>
                  <p className="mt-3 text-sm font-bold text-foreground">{BRAND.founder}</p>
                  <p className="text-xs text-muted-foreground">{BRAND.founderRole}</p>
                </blockquote>
              </div>

              <div className="rounded-2xl border border-primary/25 bg-card p-8 text-center space-y-5">
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Find out where your business actually stands
                </h2>
                <Link
                  to="/assessment"
                  onClick={() => trackCta("about-page-assessment")}
                  className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-md text-sm"
                >
                  Take the Free Readiness Assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default About;
