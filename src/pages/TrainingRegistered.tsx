import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { StatsStrip } from "@/components/funnel/FunnelBits";
import { formatSession, getLead, googleCalendarUrl, icsDataUrl, nextSessionStart } from "@/lib/funnel";
import { trackCta } from "@/lib/track";

const STEPS = [
  { title: "Put it on your calendar", text: "Add the session now so it doesn't get buried." },
  { title: "Bring one question", text: "The live Q&A is where the best answers happen. Come with your biggest one." },
  { title: "Get your score early", text: "Take the free Readiness Assessment before the session so you know where you stand." },
];

const TrainingRegistered = () => {
  const lead = getLead();
  const session = useMemo(() => {
    const iso = lead?.sessionIso ? new Date(lead.sessionIso) : null;
    return iso && iso.getTime() > Date.now() - 3600000 ? iso : nextSessionStart();
  }, [lead?.sessionIso]);
  const origin = window.location.origin;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="section-navy pt-28 pb-14 lg:pt-36">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <p className="eyebrow text-xs">Registration confirmed</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-4 !leading-[1.12]">
              You're in{lead?.firstName ? `, ${lead.firstName}` : ""}.
            </h1>
            <p className="text-lg text-white/80 mt-4">Your live training: <strong className="text-white">{formatSession(session)}</strong></p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a href={googleCalendarUrl(session, origin)} target="_blank" rel="noopener noreferrer" onClick={() => trackCta("registered-gcal")} className="btn-outline-light gap-2">
                <CalendarPlus className="h-4 w-4" /> Add to Google Calendar
              </a>
              <a href={icsDataUrl(session, origin)} download="gogovcon-training.ics" onClick={() => trackCta("registered-ics")} className="btn-outline-light gap-2">
                <Download className="h-4 w-4" /> Download .ics file
              </a>
            </div>
          </div>
        </section>

        <section className="py-14 bg-background">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="grid md:grid-cols-3 gap-5">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-xl border border-border bg-card p-6">
                  <p className="font-display text-3xl font-bold text-primary">{i + 1}</p>
                  <h2 className="font-display text-lg font-bold text-foreground mt-2">{s.title}</h2>
                  <p className="text-sm text-foreground/80 mt-2">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/assessment" onClick={() => trackCta("registered-assessment")} className="btn-gold gap-2">
                Get Your Free Readiness Score <ArrowRight className="h-4 w-4" />
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
