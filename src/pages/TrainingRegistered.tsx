import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarPlus, Copy, Download, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { StatsStrip } from "@/components/funnel/FunnelBits";
import CountdownBoxes from "@/components/training/CountdownBoxes";
import { formatEt, getLead, googleCalendarUrl, icsDataUrl, nextSessionStart, REG_KEY } from "@/lib/funnel";
import { useNow, useTrainingReg } from "@/lib/trainingApi";
import { trackCta } from "@/lib/track";

const STEPS = [
  { title: "Put it on your calendar", text: "Add the session now so it doesn't get buried." },
  { title: "Bring one question", text: "Write down the one thing you most want to figure out about federal contracting." },
  { title: "Get your score early", text: "Take the free Readiness Assessment before the session so you know where you stand." },
];

const TrainingRegistered = () => {
  const [params] = useSearchParams();
  const id = params.get("r") ?? sessionStorage.getItem(REG_KEY);
  const { reg, state } = useTrainingReg(id);
  const lead = getLead();
  const now = useNow();
  const [copied, setCopied] = useState(false);

  const session = useMemo(() => {
    if (reg) return new Date(reg.session_start);
    const iso = lead?.sessionIso ? new Date(lead.sessionIso) : null;
    return iso && iso.getTime() > Date.now() - 3600000 ? iso : nextSessionStart();
  }, [reg, lead?.sessionIso]);
  const origin = window.location.origin;
  const watchUrl = id ? `${origin}/training/watch?r=${id}` : `${origin}/training/watch`;
  const name = reg?.first_name ?? lead?.firstName;
  const isLive = reg?.session_type === "live";
  const msLeft = session.getTime() - now;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(watchUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="section-navy pt-28 pb-14 lg:pt-36">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <p className="eyebrow text-xs">Registration confirmed{name ? ` · ${name}` : ""}</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-4 !leading-[1.12]">
              You're registered for <em className="text-primary italic">{formatEt(session)}</em>
            </h1>
            <p className="text-white/80 mt-4">
              {isLive ? "Live with Towan, including live Q&A." : "A scheduled showing of the 30-minute training."}
            </p>
            <div className="mt-8">
              {msLeft > 0 ? <CountdownBoxes ms={msLeft} /> : (
                <Link to={`/training/watch${id ? `?r=${id}` : ""}`} className="btn-gold gap-2">Join the training now <ArrowRight className="h-4 w-4" /></Link>
              )}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href={googleCalendarUrl(session, origin)} target="_blank" rel="noopener noreferrer" onClick={() => trackCta("registered-gcal")} className="btn-outline-light gap-2">
                <CalendarPlus className="h-4 w-4" /> Add to Google Calendar
              </a>
              <a href={icsDataUrl(session, origin)} download="gogovcon-training.ics" onClick={() => trackCta("registered-ics")} className="btn-outline-light gap-2">
                <Download className="h-4 w-4" /> Download .ics file
              </a>
            </div>
            <div className="mt-8 rounded-lg border border-white/15 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Your personal watch link</p>
              <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                <a href={watchUrl} className="text-teal-on-dark underline break-all text-sm flex-1">{watchUrl}</a>
                <button onClick={copy} className="btn-outline-light gap-2 text-xs py-2"><Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy link"}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-background">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-xl border border-border bg-card p-6 text-center">
                  <p className="font-display text-3xl font-bold text-primary">Step {i + 1}</p>
                  <h2 className="font-display text-lg font-bold text-foreground mt-2">{s.title}</h2>
                  <p className="text-sm text-foreground/80 mt-2">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/launch-kit" onClick={() => trackCta("registered-launch-kit")} className="btn-gold gap-2">
                Get the Launch Kit while you wait · $19 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        <section className="section-navy py-12">
          <div className="container mx-auto px-6 max-w-5xl"><StatsStrip /></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default TrainingRegistered;
