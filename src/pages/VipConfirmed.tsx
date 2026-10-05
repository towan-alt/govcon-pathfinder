import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarClock, ClipboardList, Loader2, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { BOOKING_URL, getLead, saveLead, SUPPORT_EMAIL } from "@/lib/funnel";
import { trackCta, trackEvent } from "@/lib/track";

type State = "checking" | "paid" | "unpaid" | "error";

const VIP_PURCHASE_KEY = "ggc_vip_purchased";

const VipConfirmed = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("orderId") ?? params.get("order_id");
  const [state, setState] = useState<State>("checking");
  const [name, setName] = useState(getLead()?.firstName ?? "");

  useEffect(() => {
    if (!sessionId) {
      setState(localStorage.getItem(VIP_PURCHASE_KEY) ? "paid" : "unpaid");
      return;
    }
    supabase.functions
      .invoke("square-verify", { body: { orderId: sessionId, product: "vip_engagement", origin: window.location.origin } })
      .then(({ data, error }) => {
        if (error || !data) return setState("error");
        if (!data.paid) return setState("error");
        const first = (data.name as string | null)?.split(" ")[0];
        if (!name && first) setName(first);
        if (data.email) saveLead({ email: data.email, ...(first && !getLead()?.firstName ? { firstName: first } : {}) });
        if (!localStorage.getItem(VIP_PURCHASE_KEY)) void trackEvent("vip_purchased");
        localStorage.setItem(VIP_PURCHASE_KEY, sessionId);
        setState("paid");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {state === "checking" && (
          <div className="pt-40 pb-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-foreground" /></div>
        )}
        {(state === "unpaid" || state === "error") && (
          <section className="pt-36 pb-20">
            <div className="container mx-auto px-6 max-w-xl text-center space-y-5">
              <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.2]">
                {state === "error" ? "We're confirming your payment" : "No completed payment found"}
              </h1>
              <p className="text-foreground/80">
                {state === "error"
                  ? <>If you just paid, refresh in a moment. Still stuck? Email <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">{SUPPORT_EMAIL}</a> and we'll sort it out.</>
                  : "If you just paid, refresh in a moment. Otherwise you can book your engagement below."}
              </p>
              <Link to="/vip-engagement" className="btn-gold gap-2">Book a VIP Engagement <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </section>
        )}
        {state === "paid" && (
          <>
            <section className="section-navy pt-28 pb-12 lg:pt-36">
              <div className="container mx-auto px-6 max-w-3xl text-center">
                <p className="eyebrow text-xs">Payment received</p>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-white mt-4 !leading-[1.12]">
                  You're confirmed{name ? `, ${name}` : ""}.
                </h1>
                <p className="text-white/80 mt-4">Three quick steps to get the most out of your VIP Engagement.</p>
              </div>
            </section>
            <section className="py-14 bg-background">
              <div className="container mx-auto px-6 max-w-3xl space-y-6">
                <Step n={1} icon={CalendarClock} title="Choose your session time">
                  {BOOKING_URL ? (
                    <iframe src={BOOKING_URL} title="Choose your session time" className="w-full h-[640px] rounded-lg border border-border" loading="lazy" />
                  ) : (
                    <Placeholder text="Your scheduling link will appear here. Towan's team will also email you a link within one business day." />
                  )}
                </Step>
                <Step n={2} icon={ClipboardList} title="Complete your pre-session intake">
                  <p className="text-sm text-foreground/80 mb-4">A short form so Towan can review your business before you meet.</p>
                  <Link to="/book" onClick={() => trackCta("vip-confirmed-intake")} className="btn-gold gap-2">
                    Prepare for Your VIP Engagement <ArrowRight className="h-4 w-4" />
                  </Link>
                </Step>
                <Step n={3} icon={MessageSquare} title="Watch for your invitations">
                  <Placeholder text="Your private Slack channel and WhatsApp group invitations will arrive by email within one business day, along with your video link for the session." />
                </Step>
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

const Step = ({ n, icon: Icon, title, children }: { n: number; icon: typeof CalendarClock; title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
    <div className="flex items-center gap-3 mb-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{n}</span>
      <Icon className="h-5 w-5 text-foreground" />
      <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

const Placeholder = ({ text }: { text: string }) => (
  <div className="rounded-lg border-2 border-dashed border-border bg-secondary p-6 text-sm text-foreground/80">{text}</div>
);

export default VipConfirmed;
