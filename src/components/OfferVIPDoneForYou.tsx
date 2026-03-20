import { Check } from "lucide-react";

const included = [
  "60-minute intro session — deep dive into your business, goals, and GovCon positioning",
  "8 hours of hands-on work on your deliverables (capability statement, target list, proposals, etc.)",
  "30-minute final discussion to walk through your customized plan and next steps",
  "Pre-session intake audit of your business positioning, NAICS codes, and SAM.gov profile",
  "Customized Agency Target List — the specific agencies most likely to buy what you sell",
  "Capability Statement review and rewrite recommendations",
  "Bid/No-Bid decision framework tailored to your business",
  "Post-session written summary and action plan",
  "2-week follow-up check-in (email or voice note)",
];

const OfferVIPDoneForYou = () => {
  return (
    <section id="vip-dfy" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground font-display">
              One-on-One Intensive · Done For You · Limited Availability
            </p>
            <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl">
              The VIP Done-For-You Strategy Engagement
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This isn't a consultation. It's a full-service strategy engagement — a 60-minute intro, 
              8 hours of hands-on deliverable work, and a 30-minute final session to hand you your plan.
            </p>
          </div>
          
          <div className="rounded-xl bg-card p-8 md:p-12 border border-border shadow-lg">
            <h3 className="font-display text-xl font-bold text-foreground mb-6 uppercase tracking-wide">What's Included:</h3>
            <ul className="space-y-4 mb-10">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-border pt-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Who it's for:</strong> Small business owners registered (or ready to register) in SAM.gov, 
                with a viable service or product. Also ideal for businesses who have bid before but aren't winning.
              </p>
            </div>
            
            <div className="mt-10 text-center space-y-5">
              <p className="text-sm text-muted-foreground">
                The average federal contract Towan's clients pursue in year one: $250K–$500K+. Your investment today:
              </p>
              <p className="font-display text-5xl font-extrabold text-foreground">$997</p>
              <p className="text-sm italic text-muted-foreground">
                One contract win covers your investment — many times over.
              </p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Limited spots released on the 1st of each month
              </p>
              <a href="#" className="btn-dark text-lg px-14 py-6 rounded-xl">
                Reserve My VIP Session →
              </a>
              <p className="text-xs text-muted-foreground">
                You'll receive a confirmation email with your intake form within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferVIPDoneForYou;