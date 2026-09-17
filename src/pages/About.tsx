import { ArrowRight, Award, BookOpen, Mic, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import towanHero from "@/assets/towan-hero.jpg";
import { BRAND, FIGURES, SEAL_DISCLAIMER, STATS } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const timeline = [
  {
    period: "Early career",
    title: "Learning the craft before owning it",
    text: "Towan built her foundation in marketing and strategic communications — writing, pitching, managing accounts and answering to clients who expected results. Those years taught her the discipline that federal work demands: clear scope, hard deadlines, documented performance.",
  },
  {
    period: "1996–2009",
    title: "A company started in a basement",
    text: "She founded Isom Global Strategies in the basement of a Washington, D.C. townhome, with no investors and no federal past performance. She learned the contracting system the hard way — registrations, codes, capability positioning, teaming, proposal after proposal — because nobody handed her a roadmap.",
  },
  {
    period: "2009–2016",
    title: "From one contract to a national firm",
    text: "The firm grew into a woman-owned small business leading teams of 100+ employees and consultants, and became a three-time Inc. 5000 honoree — climbing to No. 643 in 2015 as revenue moved from roughly $800K to several million a year.",
  },
  {
    period: "Today",
    title: "Still contracting, and now teaching",
    text: `${FIGURES.contracts} contracts and task orders managed, ${FIGURES.contractValue} in federal contract value executed, ${FIGURES.companyRevenue} in company revenue — placing the firm in the top 3% of women-owned businesses by revenue. Towan still sits in current bid reviews while teaching ${BRAND.method} through ${BRAND.platform}.`,
  },
];

const credentials = [
  {
    icon: Users,
    title: "SBA Emerging Leaders",
    text: "Instructor and subject-matter expert for the U.S. Small Business Administration's Emerging Leaders program.",
  },
  {
    icon: Mic,
    title: "Nationally recognized speaker",
    text: "Dozens of national stages on federal contracting, small-business growth, leadership and brand strategy.",
  },
  {
    icon: BookOpen,
    title: "Author",
    text: "Author of Chasing Greatness: The Young Professional's Guide to a Dynamic Life.",
  },
  {
    icon: Award,
    title: "Three-time Inc. 5000 honoree",
    text: "Recognized among the fastest-growing private companies in America in 2014, 2015 and 2016.",
  },
];

const agencies = [
  "U.S. Marine Corps",
  "U.S. Army (Telemedicine & Advanced Technology Research Center)",
  "Department of Veterans Affairs",
  "U.S. Coast Guard",
  "Department of Health and Human Services",
  "Centers for Medicare & Medicaid Services",
  "Air National Guard",
  "Department of Commerce",
];

const caseMetrics = [
  { value: FIGURES.applicationsGenerated, label: "Applications generated" },
  { value: "Under 5 weeks", label: "Time to deliver" },
  { value: `${FIGURES.cohorts} cohorts`, label: "Markets covered" },
  { value: FIGURES.tasksDelivered, label: "Contract tasks delivered career-wide" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
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
                  {BRAND.method}. She is President and CEO of Isom Global Strategies, a woman-owned
                  marketing and strategic communications firm in Washington, D.C. that has executed{" "}
                  {FIGURES.contracts} federal contracts and task orders and crossed{" "}
                  {FIGURES.companyRevenue} in revenue.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/assessment"
                    onClick={() => trackCta("about-hero-assessment")}
                    className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-sm"
                  >
                    Take the Free Readiness Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => trackCta("about-hero-book")}
                    className="rounded-md border border-primary/40 px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    Book a Strategy Call
                  </Link>
                </div>
              </div>
              <img
                src={towanHero}
                alt={`${BRAND.founder}, ${BRAND.founderRole}`}
                className="w-full aspect-[4/5] object-cover object-[center_20%] rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
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

        {/* Bio */}
        <section className="bg-background py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="space-y-5">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  The work behind the teaching
                </h2>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Towan has pursued, won, staffed, managed and delivered federal work for agencies
                  including the U.S. Marine Corps, the Army, Veterans Affairs, the Coast Guard, HHS
                  and the Department of Commerce — {FIGURES.tasksDelivered} contract tasks personally
                  delivered across those engagements, leading teams that have averaged 60-plus people
                  and, at points, exceeded 100 employees and consultants.
                </p>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Her firm has crossed {FIGURES.companyRevenue} in company revenue, placing it in the
                  top 3% of women-owned businesses by revenue, and earned three consecutive Inc. 5000
                  rankings during its fastest-growth years. She has also led international engagements
                  with a global communications firm, which means she understands how government
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
                  Emerging Leaders, where she serves as an instructor and subject-matter expert.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Early career timeline */}
        <section className="section-navy py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="space-y-4">
                <p className="eyebrow text-xs">Early career to now</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
                  From a townhome basement to{" "}
                  <em className="text-primary italic">{FIGURES.contractValue} in contract value.</em>
                </h2>
              </div>

              <div className="space-y-4">
                {timeline.map((t) => (
                  <div
                    key={t.period}
                    className="rounded-xl p-6 grid md:grid-cols-[140px_1fr] gap-4"
                    style={{
                      background: "hsl(0 0% 100% / 0.05)",
                      border: "1px solid hsl(0 0% 100% / 0.1)",
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary pt-1">
                      {t.period}
                    </p>
                    <div className="space-y-2">
                      <h3 className="font-display text-lg font-bold text-white">{t.title}</h3>
                      <p className="text-sm text-white/75 leading-relaxed">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Credentials */}
        <section className="bg-background py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto space-y-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Credentials and recognition
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {credentials.map((c) => (
                  <div key={c.title} className="bg-card border border-border rounded-xl p-6 space-y-3">
                    <c.icon className="h-6 w-6 text-primary" />
                    <h3 className="font-display text-base font-bold text-foreground">{c.title}</h3>
                    <p className="text-sm text-foreground/75 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Agencies and programs supported
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agencies.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground/80"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{SEAL_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Full case study */}
        <section className="py-20" style={{ background: "hsl(0 0% 4%)" }}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="space-y-4">
                <p className="eyebrow text-xs">Case Study in full</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
                  {FIGURES.applicationsGenerated} applications in fewer than{" "}
                  <em className="text-primary italic">five weeks</em>, across {FIGURES.cohorts}{" "}
                  cohorts.
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {caseMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl p-5"
                    style={{
                      background: "hsl(0 0% 100% / 0.05)",
                      border: "1px solid hsl(0 0% 100% / 0.1)",
                    }}
                  >
                    <p className="font-display text-2xl font-bold text-primary">{m.value}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-white/60 leading-relaxed">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-6 text-sm text-white/75 leading-relaxed">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    The situation
                  </p>
                  <p>
                    A national small-business development program needed qualified applicants fast —
                    across dozens of separate markets, inside a short application window, with no
                    established pipeline and no existing list to lean on. Previous outreach efforts had
                    produced thin, uneven response from market to market.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    What Towan's team built
                  </p>
                  <p>
                    Audience definition market by market, rather than one national message. Message
                    testing to find the language that made owners self-identify as eligible. Partner
                    and community channels — chambers, lenders, trade groups, agency small-business
                    offices — activated in place of paid reach alone. A cohort-by-cohort follow-up
                    sequence so no interested applicant sat unattended, and weekly reporting so
                    underperforming markets were reworked while the window was still open.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    The result
                  </p>
                  <p>
                    {FIGURES.applicationsGenerated} applications generated in fewer than five weeks
                    across {FIGURES.cohorts} cohorts, with every market reporting qualified volume
                    rather than a handful of strong cities carrying the total.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Why it matters to you
                  </p>
                  <p>
                    The same discipline — define who you are actually for, say it in their language,
                    reach them where they already are, and follow up on a schedule — is exactly what
                    turns a federal target list into contract awards. {BRAND.method} is that process,
                    written down.
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/50">
                Figures reflect program delivery data. Individual results vary by business, market and
                effort. No program can guarantee a contract award.
              </p>
            </div>
          </div>
        </section>

        {/* Quote + CTA */}
        <section className="bg-background py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto space-y-10">
              <blockquote className="border-l-2 border-primary pl-5 py-2">
                <p className="text-lg text-foreground italic leading-relaxed">
                  "What you need isn't more advice from people who haven't been in the trenches — you
                  need someone who's done the work."
                </p>
                <p className="mt-3 text-sm font-bold text-foreground">{BRAND.founder}</p>
                <p className="text-xs text-muted-foreground">{BRAND.founderRole}</p>
              </blockquote>

              <div className="rounded-2xl border border-primary/25 bg-card p-8 text-center space-y-5">
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Find out where your business actually stands
                </h2>
                <p className="text-sm text-foreground/75 leading-relaxed max-w-lg mx-auto">
                  Eight questions, a few minutes, and a clear read on your next step — free.
                </p>
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
