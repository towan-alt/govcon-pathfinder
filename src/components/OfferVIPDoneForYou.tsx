import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { VIP_INCLUDES, VIP_PRICE, VIP_SESSION_LINE } from "@/lib/funnel";
import { trackCta } from "@/lib/track";

const OfferVIPDoneForYou = () => {
  return (
    <section id="vip-dfy" className="bg-background py-16 lg:py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground font-display">
              One-on-One Virtual Intensive · Limited Availability
            </p>
            <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl !leading-[1.15]">
              The VIP Engagement
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {VIP_SESSION_LINE} Deeper pre-session research, a written action plan, teaming assistance,
              and ongoing access while you execute.
            </p>
          </div>

          <div className="rounded-xl bg-card p-8 md:p-12 border border-border shadow-lg">
            <h3 className="font-display text-xl font-bold text-foreground mb-6 uppercase tracking-wide">What's Included:</h3>
            <ul className="space-y-4 mb-10">
              {VIP_INCLUDES.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground/80">
                    <strong className="text-foreground">{item.title}:</strong> {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Who it's for:</strong> Small business owners ready to move
                fast on federal work, who want direct access to Towan, teaming support and a community while they execute.
              </p>
            </div>

            <div className="mt-10 text-center space-y-5">
              <p className="text-sm text-muted-foreground">Your investment today:</p>
              <p className="font-display text-5xl font-extrabold text-foreground">{VIP_PRICE}</p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                One-time payment. Build the strategy, positioning and relationships needed to pursue the right
                opportunities with greater confidence. No program can guarantee an award.
              </p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Limited spots released on the 1st of each month
              </p>

              <Link
                to="/vip-engagement"
                onClick={() => trackCta("vip-dfy-reserve")}
                className="btn-dark text-lg px-14 py-6 rounded-xl inline-block"
              >
                Reserve My VIP Session →
              </Link>
              <p className="text-xs text-muted-foreground">
                You'll pick your session time right after checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferVIPDoneForYou;
