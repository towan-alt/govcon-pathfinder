import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORT_EMAIL } from "@/lib/funnel";
import { trackEvent } from "@/lib/track";

const DONE_KEY = "ggc_kit_pro_purchased";

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") ?? searchParams.get("order_id");
  const [state, setState] = useState<"checking" | "paid" | "pending" | "none">(orderId ? "checking" : "none");

  useEffect(() => {
    if (!orderId) return;
    supabase.functions
      .invoke("square-verify", { body: { orderId, product: "launch_kit_pro" } })
      .then(({ data, error }) => {
        if (error || !data?.paid) return setState("pending");
        if (localStorage.getItem(DONE_KEY) !== orderId) void trackEvent("upgrade_purchase");
        localStorage.setItem(DONE_KEY, orderId);
        setState("paid");
      });
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center">
      <div className="container mx-auto px-6 py-20 max-w-2xl text-center">
        {state === "checking" && <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto" />}
        {state === "paid" && (
          <>
            <p className="eyebrow-dark text-xs">Payment received</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 !leading-[1.2]">
              You're in. Launch Kit Pro is on its way.
            </h1>
            <p className="text-foreground/80 mt-4 leading-relaxed">
              Check your inbox for the receipt and your access details. If anything looks off,
              reply to that email and Towan's team will sort it out.
            </p>
          </>
        )}
        {state === "pending" && (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.2]">We're confirming your payment</h1>
            <p className="text-foreground/80 mt-4">
              Refresh in a moment. Still stuck? Email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">{SUPPORT_EMAIL}</a>.
            </p>
          </>
        )}
        {state === "none" && (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.2]">We couldn't find that payment</h1>
            <p className="text-foreground/80 mt-4">Nothing was charged. You can start the upgrade again below.</p>
          </>
        )}
        {state !== "checking" && (
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link to="/" className="btn-gold text-sm px-8 py-3.5 rounded-md">Back to the site</Link>
            {state === "none" && <Link to="/kit/upgrade" className="btn-outline-light text-sm px-8 py-3.5 rounded-md">Try again</Link>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutReturn;
