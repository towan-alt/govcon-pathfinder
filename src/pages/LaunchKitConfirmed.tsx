import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, Download, Loader2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/track";
import { KIT_NEXT_OFFER, REVIEW_PRICE, STARTER_KIT_URL } from "@/lib/funnel";

type State = "verifying" | "paid" | "pending";

const LaunchKitConfirmed = () => {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") ?? params.get("transactionId") ?? "";
  const [state, setState] = useState<State>(orderId ? "verifying" : "pending");

  useEffect(() => {
    if (!orderId) return;
    supabase.functions
      .invoke("square-verify", { body: { orderId, product: "launch_kit" } })
      .then(({ data, error }) => {
        if (!error && data?.paid) {
          setState("paid");
          trackEvent("launch_kit_purchased");
        } else {
          setState("pending");
        }
      })
      .catch(() => setState("pending"));
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-2xl text-center space-y-8">
          {state === "verifying" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.15]">
                Confirming your payment…
              </h1>
            </>
          )}

          {state === "pending" && (
            <>
              <Loader2 className="h-10 w-10 text-primary mx-auto" />
              <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.15]">
                We are confirming your payment.
              </h1>
              <p className="text-base text-foreground/70 leading-relaxed">
                This can take a moment. Your receipt and download link are also on their way to your
                inbox. If nothing arrives within a few minutes, check spam or contact us.
              </p>
            </>
          )}

          {state === "paid" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground !leading-[1.15]">
                Your Launch Kit is ready.
              </h1>
              <p className="text-base text-foreground/70 leading-relaxed">
                Your receipt and download link have been emailed to you. Save the email so you can
                always get back to your kit.
              </p>

              {STARTER_KIT_URL ? (
                <a
                  href={STARTER_KIT_URL}
                  className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-4 rounded-md font-bold"
                >
                  <Download className="h-4 w-4" /> Download the Launch Kit
                </a>
              ) : (
                <p className="rounded-md border border-border bg-card px-6 py-4 text-sm text-foreground/70">
                  Your download link is in the receipt email we just sent you.
                </p>
              )}

              <div className="rounded-md bg-navy p-8 text-left space-y-4 mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Your next step</p>
                <p className="font-display text-xl font-bold text-white !leading-[1.3]">{KIT_NEXT_OFFER}</p>
                <Link
                  to="/readiness-review"
                  className="btn-gold inline-flex items-center gap-2 text-sm px-6 py-3 rounded-md font-bold"
                >
                  Get My Comprehensive Readiness Review · {REVIEW_PRICE}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LaunchKitConfirmed;
