import { useEffect } from "react";
import { Link } from "react-router-dom";
import coverUrl from "@/assets/govcon-launch-kit-cover.png";
import { trackCta, trackEvent } from "@/lib/track";

const painPoints = [
  {
    title: "You've heard the money is there — but not where to start",
    body: "The federal government buys everything from IT support to janitorial services. But the alphabet soup (SAM, UEI, NAICS, CAGE) stops most small businesses before they ever bid on a single contract.",
  },
  {
    title: "You've registered… and nothing happened",
    body: "A SAM.gov profile by itself wins zero contracts. Most businesses register, wait, and quit — because nobody showed them the actions that actually create revenue after registration.",
  },
  {
    title: "You've paid for advice that led nowhere",
    body: "Generic webinars and recycled checklists don't account for your business, your NAICS codes, or the order of operations that gets a company contract-ready without wasted months.",
  },
];

const outcomes = [
  "Understand GovCon in plain English — what the government actually buys and from whom",
  "Know exactly what “contract-ready” means — and the myths that waste your time",
  "Follow the setup roadmap in the only order that makes sense",
  "Get your business foundation, EIN and banking set up the GovCon way",
  "Complete SAM.gov registration step by step — and avoid UEI validation delays",
  "Choose the right NAICS codes, with real examples",
];

const chapters = [
  "GovCon in plain English",
  "What “contract-ready” really means",
  "The setup roadmap in the right order",
  "Business foundation before the EIN",
  "Getting your EIN the right way",
  "GovCon-ready business banking",
  "SAM.gov registration, step by step",
  "UEI, entity validation & delays",
  "After SAM.gov: actions that create revenue",
  "Choosing the right NAICS codes",
];

const faqs = [
  {
    q: "Is the Launch Kit really free?",
    a: "Yes. The full booklet is free. You'll confirm your email address (so it reaches a real inbox), and the download unlocks immediately.",
  },
  {
    q: "Who is this for?",
    a: "Small business owners who are brand new to government contracting, or who registered on SAM.gov and stalled. No prior GovCon knowledge needed.",
  },
  {
    q: "How long does it take to read?",
    a: "About 30 minutes. It's written to be acted on — each chapter ends with the specific step to take next.",
  },
  {
    q: "What happens after I download it?",
    a: "You work through the roadmap at your own pace. If you want help, you can book a free strategy call with Towan — but there's no obligation.",
  },
];

const LaunchKit = () => {
  useEffect(() => {
    void trackEvent("launchkit_view");
    window.scrollTo(0, 0);
  }, []);

  const cta = (id: string, label: string) => (
    <div className="space-y-3">
      <Link
        to="/kit"
        onClick={() => trackCta(id)}
        className="btn-gold inline-block text-sm px-10 py-4 rounded-md"
      >
        {label}
      </Link>
      <p className="text-xs text-white/30">Free instant download · Confirm your email · No spam</p>
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      {/* Minimal funnel header — logo only, no nav distractions */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="font-display text-base font-bold tracking-tight text-white">
            Go<span className="text-primary">GovCon</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <div className="space-y-7">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary border border-primary/30 rounded-full px-4 py-1.5">
                Free booklet · Instant download
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08]">
                New opportunities. New business.{" "}
                <em className="text-primary italic">New money.</em>
              </h1>
              <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-xl">
                The GovCon Launch Kit takes you from “I've never sold to the government” to a
                registered, verified, contract-ready business — in the right order, without the
                guesswork.
              </p>
              {cta("launchkit-hero-cta", "Get the free Launch Kit")}
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src={coverUrl}
                alt="GovCon Launch Kit Booklet cover"
                className="w-64 md:w-80 rounded-lg shadow-2xl border rotate-1"
                style={{ borderColor: "hsl(45 55% 55% / 0.25)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20" style={{ background: "hsl(0 0% 6%)" }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center space-y-4 mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Sound familiar?</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Government contracting feels closed to outsiders.{" "}
              <em className="text-primary italic">It isn't.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((p) => (
              <div
                key={p.title}
                className="rounded-lg border p-7 space-y-3"
                style={{ borderColor: "hsl(0 0% 100% / 0.08)", background: "hsl(0 0% 8%)" }}
              >
                <h3 className="font-display text-lg font-bold text-white leading-snug">{p.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-white/50 text-sm mt-10 max-w-2xl mx-auto leading-relaxed">
            The Launch Kit fixes all three — with the exact roadmap, in plain English, from someone
            who has done it for 25+ years.
          </p>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">What you'll walk away with</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                From curious to{" "}
                <em className="text-primary italic">contract-ready</em>
              </h2>
              <p className="text-sm text-white/55 leading-relaxed max-w-md">
                This isn't theory. Every chapter maps to a concrete step in getting your business
                set up to sell to the federal government.
              </p>
              {cta("launchkit-outcomes-cta", "Download the free kit")}
            </div>
            <ul className="space-y-3">
              {outcomes.map((o) => (
                <li
                  key={o}
                  className="flex gap-3 rounded-lg border p-4 text-sm text-white/75 leading-relaxed"
                  style={{ borderColor: "hsl(0 0% 100% / 0.08)", background: "hsl(0 0% 7%)" }}
                >
                  <span className="text-primary mt-0.5 shrink-0">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Chapter list */}
      <section className="py-20" style={{ background: "hsl(0 0% 6%)" }}>
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Inside the booklet</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-12">
            10 chapters. <em className="text-primary italic">One roadmap.</em>
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-left">
            {chapters.map((c, i) => (
              <div
                key={c}
                className="flex items-center gap-4 rounded-lg border p-4"
                style={{ borderColor: "hsl(0 0% 100% / 0.08)", background: "hsl(0 0% 8%)" }}
              >
                <span className="font-display text-lg font-bold text-primary shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-white/75">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Towan */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-lg border p-8 md:p-12 space-y-6" style={{ borderColor: "hsl(45 55% 55% / 0.25)", background: "hsl(0 0% 7%)" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Written by Towan Isom</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white leading-snug">
              There is a difference between someone who teaches government contracting and someone
              who <em className="text-primary italic">does it</em> — and has done it for decades at
              the highest levels.
            </h2>
            <p className="text-sm md:text-base text-white/60 leading-relaxed">
              Towan has executed 105+ federal contracts, generated $25M+ in revenue, and coached
              more than 6,500 small businesses into the government marketplace. The Launch Kit
              distills that track record into the exact sequence she wishes every new contractor
              had on day one.
            </p>
            <div className="flex flex-wrap gap-10 pt-2">
              {[
                ["105+", "Federal contracts executed"],
                ["$25M+", "Revenue generated"],
                ["6,500+", "Small businesses coached"],
                ["25+", "Years of experience"],
              ].map(([num, label]) => (
                <div key={label} className="text-center">
                  <p className="font-display text-2xl font-bold text-primary">{num}</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/40 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{ background: "hsl(0 0% 6%)" }}>
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Questions, <em className="text-primary italic">answered</em>
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border p-6"
                style={{ borderColor: "hsl(0 0% 100% / 0.08)", background: "hsl(0 0% 8%)" }}
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-display text-base font-bold text-white">{f.q}</span>
                  <span className="text-primary text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-sm text-white/55 leading-relaxed mt-4">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-6 max-w-2xl space-y-6">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
            Your first federal contract starts with{" "}
            <em className="text-primary italic">the right first step.</em>
          </h2>
          <p className="text-sm md:text-base text-white/55 leading-relaxed">
            Download the GovCon Launch Kit free — confirm your email and it's yours in under a
            minute.
          </p>
          {cta("launchkit-final-cta", "Send me the free Launch Kit")}
        </div>
      </section>
    </main>
  );
};

export default LaunchKit;
