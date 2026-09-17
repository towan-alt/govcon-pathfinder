import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { trackEvent } from "@/lib/track";

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) trackEvent("upgrade_purchase");
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center">
      <div className="container mx-auto px-6 py-20 max-w-2xl text-center">
        {sessionId ? (
          <>
            <p className="eyebrow text-xs">Payment received</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4">
              You're in — Launch Kit Pro is on its way.
            </h1>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Check your inbox for the receipt and your access details. If anything looks off,
              reply to that email and Towan's team will sort it out.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-foreground">
              We couldn't find that payment
            </h1>
            <p className="text-muted-foreground mt-4">
              Nothing was charged. You can start the upgrade again below.
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link to="/" className="btn-gold text-sm px-8 py-3.5 rounded-md">
            Back to the site
          </Link>
          {!sessionId && (
            <Link to="/kit/upgrade" className="btn-outline-light text-sm px-8 py-3.5 rounded-md">
              Try again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutReturn;
