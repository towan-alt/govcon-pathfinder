import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, Radio, PlayCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import AgencyLogoBar from "@/components/AgencyLogoBar";
import TestimonialsSection from "@/components/TestimonialsSection";
import { FunnelFaq, StatsStrip, StickyMobileCta } from "@/components/funnel/FunnelBits";
import towanHero from "@/assets/towan-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, FIGURES } from "@/lib/brand";
import { formatSession, nextSessionStart, saveLead, getLead, TRAINING_MINUTES } from "@/lib/funnel";
import { getDevice, getSource, trackCta, trackEvent } from "@/lib/track";

const MISTAKES = [
  { title: "Registering and waiting", text: "Why SAM.gov registration alone produces zero contracts, and what has to happen next." },
  { title: "Chasing every RFP", text: "Bidding on everything spreads you thin. Pick 3 to 5 target agencies instead." },
  { title: "A generic capability statement", text: "The one-page mistake that gets you deleted in 10 seconds." },
  { title: "Missing the relationship window", text: "Contracts are shaped before the RFP posts. Learn when to show up." },
  { title: "No past performance strategy", text: "How to build a record the government trusts, even before your first prime award." },
];

const FOR_WHO = [
  "You run a registered business and want your first federal contract",
  "You're in SAM.gov but the calls never come",
  "You've been bidding and losing",
  "You hold or qualify for WOSB, 8(a), HUBZone or SDVOSB",
  "You want a plan, not another list of websites",
];

const FAQ = [
  { q: "Is it free?", a: "Yes. The training is free, and every attendee gets a free GovCon Readiness Score." },
  { q: "How long is it?", a: `${TRAINING_MINUTES} minutes, plus optional live Q&A at the end.` },
  { q: "What if I can't make it live?", a: "Choose the On-Demand Replay when you register and watch right away." },
  { q: "Do I need to be registered in SAM.gov first?", a: "No. The training covers what to do whether you're registered or not." },
  { q: "Will this guarantee me a contract?", a: "No one can guarantee an award. Agencies decide who wins. This training gives you the strategy and the order of operations so you compete with a plan." },
];

const CHIPS = [`${FIGURES.years} years contracting`, `${FIGURES.contracts} federal contracts`, `${FIGURES.agencies} agencies`, "SBA subject-matter expert", "Two-time Inc. 5000"];

function useCountdown(target: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    live: diff === 0,
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

const Training = () => {
  const navigate = useNavigate();
  const session = useMemo(() => nextSessionStart(), []);
  const sessionLabel = formatSession(session);
  const cd = useCountdown(session);

  const prior = getLead();
  const [choice, setChoice] = useState<"live" | "replay">("live");
  const [firstName, setFirstName] = useState(prior?.firstName ?? "");
  const [email, setEmail] = useState(prior?.email ?? "");
  const [phone, setPhone] = useState(prior?.phone ?? "");
  const [sms, setSms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void trackEvent("training_view");
  }, []);

  const scrollToForm = (id: string) => {
    trackCta(id);
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Please enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email.";
    if (phone.trim() && phone.replace(/\D/g, "").length < 10) errs.phone = "Please enter a 10-digit mobile number or leave it blank.";
    if (sms && !phone.trim()) errs.phone = "Add a mobile number to get text reminders.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    const label = choice === "live" ? `live ${sessionLabel}` : "replay";
    const { data, error } = await supabase.functions.invoke("submit-lead", {
      body: {
        firstName: firstName.trim(),
        lastName: "",
        email: email.trim(),
        phone: phone.trim(),
        recommendation: `Webinar registration: ${label}${sms ? " · SMS reminders opted in" : ""}`,
        device: getDevice(),
        source: getSource(),
        origin: window.location.origin,
      },
    });
    setSending(false);
    if (error || (data as { error?: string })?.error) {
      setErrors({ form: "We couldn't save your seat. Please try again; your details are still here." });
      return;
    }
    saveLead({ firstName: firstName.trim(), email: email.trim(), phone: phone.trim(), session: choice, sessionIso: session.toISOString() });
    void trackEvent("training_register", choice);
    navigate(choice === "live" ? "/training/registered" : "/training/watch");
  };

  const inputCls = "w-full rounded-md border bg-background px-4 py-2.5 md:py-3 text-sm text-foreground placeholder:text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* HERO */}
        <section className="section-navy pt-24 pb-14 lg:pt-36 lg:pb-20">
          <div className="container mx-auto px-5 md:px-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-5 lg:gap-14 items-start">
            <div>
              <p className="eyebrow text-xs">Free {TRAINING_MINUTES}-Minute Training for Small Business Owners</p>
              <h1 className="font-display text-[1.6rem] md:text-5xl font-bold text-white mt-3 !leading-[1.15]">
                The 5 Costly Mistakes That Keep Small Businesses From Winning Their{" "}
                <em className="text-primary italic">First Federal Contract</em>
              </h1>
              <p className="hidden lg:block mt-5 text-base md:text-lg text-white/80 leading-relaxed max-w-xl">
                The federal government sets aside billions in contracts for small businesses every year. In {TRAINING_MINUTES} minutes, learn why most never see a dollar of it, and the exact steps that change that.
              </p>
              <div className="hidden lg:block mt-8 space-y-6">
                <Countdown cd={cd} label={sessionLabel} />
                <p className="text-sm text-white/70 border-l-2 border-primary pl-4 max-w-lg">
                  Fiscal Year 2027 began October 1. Agency forecasts are posting now. The businesses that win in September start positioning in October.
                </p>
              </div>
            </div>

            {/* REGISTRATION CARD */}
            <form id="register" onSubmit={submit} noValidate className="rounded-2xl bg-card text-card-foreground p-5 md:p-7 shadow-2xl space-y-3 md:space-y-4 border-t-4 border-primary">
              <p className="hidden md:block font-display text-xl font-bold text-foreground">Save your free seat</p>
              <div className="grid gap-2 md:gap-3" role="radiogroup" aria-label="Choose your session">
                {([
                  { key: "live", icon: Radio, title: `Live: ${sessionLabel}`, sub: "Ask your questions live" },
                  { key: "replay", icon: PlayCircle, title: "On-Demand Replay", sub: "Watch now" },
                ] as const).map((o) => (
                  <label key={o.key} className={`flex items-start gap-3 rounded-lg border-2 p-3 md:p-4 cursor-pointer transition-colors ${choice === o.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                    <input type="radio" name="session" value={o.key} checked={choice === o.key} onChange={() => setChoice(o.key)} className="mt-1 accent-primary" />
                    <o.icon className="h-5 w-5 mt-0.5 shrink-0 text-foreground" />
                    <span>
                      <span className="block text-sm font-bold text-foreground">{o.title}</span>
                      <span className="block text-xs text-muted-foreground">{o.sub}</span>
                    </span>
                  </label>
                ))}
              </div>
              <Field id="t-first" label="First name" error={errors.firstName}>
                <input id="t-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} className={`${inputCls} ${errors.firstName ? "border-destructive" : "border-border"}`} />
              </Field>
              <Field id="t-email" label="Email" error={errors.email}>
                <input id="t-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={`${inputCls} ${errors.email ? "border-destructive" : "border-border"}`} />
              </Field>
              <Field id="t-phone" label="Mobile (optional)" error={errors.phone}>
                <input id="t-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} className={`${inputCls} ${errors.phone ? "border-destructive" : "border-border"}`} />
              </Field>
              <label className="flex items-start gap-2.5 text-xs text-foreground/80 leading-relaxed">
                <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="mt-0.5 accent-primary" />
                Text me reminders. Msg and data rates may apply. Reply STOP to opt out.
              </label>
              {errors.form && <p className="text-sm text-destructive" role="alert">{errors.form}</p>}
              <button type="submit" disabled={sending} className="btn-gold w-full gap-2 py-4 disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save My Seat
              </button>
              <p className="text-xs text-muted-foreground text-center">We respect your privacy. No spam, unsubscribe anytime.</p>
            </form>

            <div className="lg:hidden space-y-5">
              <p className="text-base text-white/80 leading-relaxed">
                The federal government sets aside billions in contracts for small businesses every year. In {TRAINING_MINUTES} minutes, learn why most never see a dollar of it, and the exact steps that change that.
              </p>
              <Countdown cd={cd} label={sessionLabel} />
              <p className="text-sm text-white/70 border-l-2 border-primary pl-4">
                Fiscal Year 2027 began October 1. Agency forecasts are posting now. The businesses that win in September start positioning in October.
              </p>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="section-navy py-12 border-t border-white/10">
          <div className="container mx-auto px-6 max-w-5xl"><StatsStrip /></div>
        </section>
        <AgencyLogoBar />

        {/* WHAT YOU'LL LEARN */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-6 max-w-6xl">
            <p className="eyebrow-dark text-xs">What you'll learn</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-10 !leading-[1.15]">
              The 5 mistakes, and how to fix each one
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MISTAKES.map((m, i) => (
                <div key={m.title} className="rounded-xl border border-border bg-card p-6">
                  <p className="font-display text-3xl font-bold text-primary">{i + 1}</p>
                  <h3 className="font-display text-lg font-bold text-foreground mt-2">{m.title}</h3>
                  <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{m.text}</p>
                </div>
              ))}
              <div className="rounded-xl bg-primary p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground">Bonus</p>
                  <h3 className="font-display text-xl font-bold text-primary-foreground mt-2">Every attendee gets a free GovCon Readiness Score</h3>
                </div>
                <button onClick={() => scrollToForm("training-bonus")} className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-bold text-white">
                  Save My Seat <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* WHO */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6 max-w-3xl">
            <p className="eyebrow-dark text-xs">Who this is for</p>
            <h2 className="font-display text-3xl font-bold text-foreground mt-3 mb-8 !leading-[1.15]">This training is for you if</h2>
            <ul className="space-y-4">
              {FOR_WHO.map((w) => (
                <li key={w} className="flex gap-3 text-base text-foreground">
                  <Check className="h-5 w-5 shrink-0 mt-0.5 text-foreground" />{w}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HOST */}
        <section className="section-navy py-16 lg:py-20">
          <div className="container mx-auto px-6 max-w-5xl grid md:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
            <img src={towanHero} alt={`${BRAND.founder}, host`} loading="lazy" width={480} height={600} className="rounded-2xl w-full max-w-sm mx-auto object-cover aspect-[4/5]" />
            <div>
              <p className="eyebrow text-xs">Meet your host</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3 !leading-[1.15]">{BRAND.founder}</h2>
              <p className="text-sm text-white/60 mt-1">{BRAND.founderRole}</p>
              <p className="text-white/80 mt-5 leading-relaxed">
                A {FIGURES.years}-year federal contractor who has executed {FIGURES.contracts} contracts across {FIGURES.agencies} agencies and trained {FIGURES.thriveTrained} small business owners through SBA's T.H.R.I.V.E. program.
              </p>
              <blockquote className="mt-6 border-l-2 border-primary pl-5 font-display italic text-xl text-white">
                "I don't just teach federal contracting. I win federal contracts, every year."
              </blockquote>
              <div className="mt-6 flex flex-wrap gap-2">
                {CHIPS.map((c) => (
                  <span key={c} className="rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold text-white/85">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection />
        <FunnelFaq id="training-faq" items={FAQ} />

        {/* FINAL CTA */}
        <section className="section-navy py-16 text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white !leading-[1.15]">
              Your first federal contract starts with <em className="text-primary italic">a plan</em>
            </h2>
            <p className="text-white/75 mt-4">Next live session: {sessionLabel}. Or watch the replay now.</p>
            <button onClick={() => scrollToForm("training-final")} className="btn-gold mt-8 gap-2">
              Save My Seat <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
      <SiteFooter />
      <StickyMobileCta watchId="register">
        <button onClick={() => scrollToForm("training-sticky")} className="btn-gold w-full py-3">Save My Seat</button>
      </StickyMobileCta>
    </div>
  );
};

const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const Countdown = ({ cd, label }: { cd: ReturnType<typeof useCountdown>; label: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-3">Next live session: {label}</p>
    {cd.live ? (
      <p className="text-primary font-bold">Live now</p>
    ) : (
      <div className="flex gap-3" aria-live="off">
        {[["Days", cd.d], ["Hours", cd.h], ["Min", cd.m], ["Sec", cd.s]].map(([l, v]) => (
          <div key={l as string} className="rounded-lg border border-primary/30 bg-navy-light px-3 py-2 text-center min-w-[60px]">
            <p className="font-display text-2xl font-bold text-primary tabular-nums">{String(v).padStart(2, "0")}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/60">{l}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Training;
