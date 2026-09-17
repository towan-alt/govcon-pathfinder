import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { trackCta, trackEvent } from "@/lib/track";
import logo from "@/assets/logo-ti.png";

const PRICE_ID = "launch_kit_pro_onetime";

const INCLUDED = [
  "Fill-in-the-blank capability statement template (the one that wins meetings)",
  "Past-performance and pricing worksheets you can reuse on every bid",
  "Step-by-step registration walkthrough — SAM, NAICS, certifications",
  "Agency targeting worksheet: who actually buys what you sell",
  "Recorded training walking through each template line by line",
  "A 30-day action plan so you know what to do first, second, third",
];

const KitUpgrade = () => {
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    trackEvent("upgrade_view");
  }, []);

  const startCheckout = () => {
    trackCta("kit-upgrade-buy");
    trackEvent("upgrade_checkout_start");
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />

      <div className="container mx-auto px-6 py-14 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-3 mb-12">
          <img src={logo} alt="GoGovCon" className="h-9 w-auto" />
        </Link>

        <p className="eyebrow text-xs">Optional upgrade</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-4 leading-tight">
          You have the booklet. <span className="text-primary">Now get the templates.</span>
        </h1>
        <p className="text-muted-foreground text-lg mt-5 max-w-2xl leading-relaxed">
          The free Launch Kit shows you the path. Launch Kit Pro hands you the documents,
          worksheets and walkthrough so you can finish the work this month instead of next year.
        </p>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 mt-12 items-start">
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">What's inside</h2>
            <ul className="space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                  <Check className="h-5 w-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              GovCon Launch Kit Pro
            </p>
            <p className="font-display text-5xl font-extrabold text-primary mt-3">$97</p>
            <p className="text-xs text-muted-foreground mt-1">One-time payment · instant access</p>

            {!showCheckout ? (
              <>
                <button
                  onClick={startCheckout}
                  className="btn-gold w-full text-sm px-8 py-3.5 rounded-md mt-6"
                >
                  Get Launch Kit Pro
                </button>
                <p className="text-xs text-muted-foreground mt-4">
                  Prefer to talk it through first?{" "}
                  <Link
                    to="/book"
                    onClick={() => trackCta("kit-upgrade-book")}
                    className="text-primary font-semibold underline"
                  >
                    Book a free strategy call
                  </Link>
                  .
                </p>
              </>
            ) : (
              <div className="mt-6">
                <StripeEmbeddedCheckout priceId={PRICE_ID} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitUpgrade;
