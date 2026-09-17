import { ArrowRight, Award, BadgeCheck, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import towanHero from "@/assets/towan-hero.jpg";
import { BRAND, FIGURES, SEAL_DISCLAIMER, STATS } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const timeline = [
  {
    period: "1996",
    title: "Launched in Washington, D.C.",
    text: "Towan founded Isom Global Strategies in Washington, D.C. and built it into a 30-year government contractor — no shortcuts, learning the contracting system registration by registration, proposal by proposal.",
  },
  {
    period: "The full lifecycle",
    title: "Every stage, firsthand",
    text: "She has worked every stage of the contracting lifecycle herself: registrations and certifications, market research and agency targeting, capture and competitive intelligence, go/no-go decisions, compliant proposal development, pricing, award, contract performance, CPARS ratings, and recompetes.",
  },
  {
    period: "Recognition",
    title: "Credentials earned through delivery",
    text: "Under her leadership, IGS holds a GSA Multiple Award Schedule contract, carries WOSB, EDWOSB, SDB, WBENC, NMSDC MBE and DC CBE certifications, earned a PRSA Thoth Award, and landed on the Inc. 5000 list twice.",
  },
  {
    period: "Today",
    title: "Still contracting, and now teaching",
    text: `Towan teaches what she has done, not what she has read. That full-lifecycle experience is the foundation of ${BRAND.platform} and ${BRAND.method}, her coaching platform that shows small businesses how to find, win, and keep government work — with ${FIGURES.winsSupported} in contract wins supported for the businesses she has assisted.`,
  },
];

const credentials = [
  {
    icon: BadgeCheck,
    title: "SBA & University of Maryland MBOC SME",
    text: "Subject-matter expert for the U.S. Small Business Administration and the University of Maryland MBOC.",
  },
  {
    icon: Users,
    title: "Trainer at national scale",
    text: `Delivered SBA's T.H.R.I.V.E. Emerging Leaders program — a ${FIGURES.thriveValue} national initiative that trained more than ${FIGURES.thriveTrained} small business owners.`,
  },
  {
    icon: ShieldCheck,
    title: "Certified & scheduled",
    text: "IGS holds a GSA Multiple Award Schedule contract and WOSB, EDWOSB, SDB, WBENC, NMSDC MBE and DC CBE certifications.",
  },
  {
    icon: Award,
    title: "Award-winning firm",
    text: "PRSA Thoth Award winner and a two-time Inc. 5000 honoree among America's fastest-growing private companies.",
  },
];

const agencies = [
  "U.S. Department of Health and Human Services",
  "CDC",
  "FDA",
  "HRSA",
  "U.S. Small Business Administration",
  "U.S. Marine Corps",
  "National Park Service",
];

const thriveMetrics = [
  { value: FIGURES.thriveValue, label: "National program value" },
  { value: FIGURES.thriveTrained, label: "Small business owners trained" },
  { value: `${FIGURES.thriveRate}%`, label: "Recommendation rate" },
  { value: "Exceptional", label: "CPARS rating" },
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
                  A 30-year federal contractor who{" "}
                  <em className="text-primary italic">teaches what she still does.</em>
                </h1>
                <p className="text-base text-white/75 leading-relaxed">
                  {BRAND.founder} is a federal contracting strategist, trainer, and the Founder,
                  President, and CEO of {BRAND.firm}, a Washington, D.C. firm she launched in 1996
                  and built into a 30-year government contractor. IGS has executed{" "}
                  {FIGURES.contracts} federal contracts across {FIGURES.agencies} agencies, including
                  long-running work with HHS, CDC, FDA, HRSA, SBA, the U.S. Marine Corps and the
                  National Park Service.
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
                  Towan teaches what she has done, not what she has read. She has worked every stage
                  of the contracting lifecycle firsthand — registrations and certifications, market
                  research and agency targeting, capture and competitive intelligence, go/no-go
                  decisions, compliant proposal development, pricing, award, contract performance,
                  CPARS ratings, and recompetes.
                </p>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Her guidance has supported more than $27 million in contract wins for the
                  businesses she has assisted. That full-lifecycle experience is the foundation of{" "}
                  {BRAND.platform} and {BRAND.method} — her coaching platform that shows small
                  businesses how to find, win, and keep government work.
                </p>
                <p className="text-base text-foreground/80 leading-relaxed">
                  Towan's position is simple: small business owners rarely lack the skill to compete
                  for government contracts. They lack the roadmap and the confidence — and she
                  supplies both.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Career timeline */}
        <section className="section-navy py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="space-y-4">
                <p className="eyebrow text-xs">1996 to now</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
                  Thirty years in federal contracting,{" "}
                  <em className="text-primary italic">and counting.</em>
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
                  Agencies served
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
                <p className="text-xs text-muted-foreground">
                  Contracts delivered across {FIGURES.agencies} federal agencies. {SEAL_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* T.H.R.I.V.E. case study */}
        <section className="py-20" style={{ background: "hsl(0 0% 4%)" }}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="space-y-4">
                <p className="eyebrow text-xs">Case Study in full</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
                  A {FIGURES.thriveValue} national program that trained{" "}
                  <em className="text-primary italic">{FIGURES.thriveTrained} small business owners.</em>
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {thriveMetrics.map((m) => (
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
                    The U.S. Small Business Administration needed a national emerging-leaders
                    initiative delivered to small business owners across the country — with real,
                    measurable outcomes, not attendance counts.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    What Towan's firm delivered
                  </p>
                  <p>
                    IGS delivered SBA's T.H.R.I.V.E. Emerging Leaders program end to end — a{" "}
                    {FIGURES.thriveValue} national initiative built on the same full-lifecycle
                    training Towan now teaches: positioning, agency targeting, capture, compliant
                    proposals, pricing and contract performance.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    The result
                  </p>
                  <p>
                    More than {FIGURES.thriveTrained} small business owners trained, a{" "}
                    {FIGURES.thriveRate}% recommendation rate, and an Exceptional CPARS rating on the
                    contract.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Why it matters to you
                  </p>
                  <p>
                    The same lifecycle discipline that earned an Exceptional rating on a national
                    federal program is exactly what turns a federal target list into contract
                    awards. {BRAND.method} is that process, written down.
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
                  "Small business owners rarely lack the skill to compete for government contracts.
                  They lack the roadmap and the confidence — and that is exactly what I supply."
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
