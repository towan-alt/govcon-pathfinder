import { Check } from "lucide-react";

const included = [
  "90-minute 1:1 strategy session with Towan Isom",
  "Pre-session intake audit of your business positioning, NAICS codes, and SAM.gov profile",
  "Customized Agency Target List — the specific agencies most likely to buy what you sell",
  "Capability Statement review and rewrite recommendations",
  "Bid/No-Bid decision framework tailored to your business",
  "Post-session written summary and 30-day action plan",
  "2-week follow-up check-in (email or voice note)",
];

const OfferVIP = () => {
  return (
    <section id="vip" className="section-navy py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <p className="eyebrow">One-on-One Intensive · Limited Availability</p>
            <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl" style={{ color: 'hsl(40, 20%, 99%)' }}>
              Your Personal GovCon Roadmap — Built in a Single Session
            </h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto" style={{ color: 'hsl(40, 30%, 85%)' }}>
              This isn't a consultation. It's a closed-door strategy session with someone who has sat on both sides 
              of the table. In 90 minutes, you leave with a clear, customized action plan.
            </p>
          </div>
          
          <div className="rounded-xl border bg-card/5 backdrop-blur-sm p-8 md:p-12" style={{
            borderColor: 'hsl(42, 80%, 55%, 0.2)',
          }}>
            <h3 className="font-display text-xl font-semibold text-gold mb-6">What's Included:</h3>
            <ul className="space-y-4 mb-10">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-gold" />
                  <span className="text-sm leading-relaxed" style={{ color: 'hsl(40, 30%, 85%)' }}>{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="border-t pt-8 space-y-2" style={{ borderColor: 'hsl(42, 80%, 55%, 0.15)' }}>
              <p className="text-sm opacity-60" style={{ color: 'hsl(40, 30%, 85%)' }}>
                <strong>Who it's for:</strong> Small business owners registered (or ready to register) in SAM.gov, 
                with a viable service or product. Also ideal for businesses who have bid before but aren't winning.
              </p>
            </div>
            
            <div className="mt-10 text-center space-y-4">
              <p className="font-display text-4xl font-bold text-gold">$997</p>
              <p className="text-sm opacity-60" style={{ color: 'hsl(40, 30%, 85%)' }}>
                Limited spots released on the 1st of each month
              </p>
              <a href="#" className="btn-gold">
                Reserve My VIP Strategy Session →
              </a>
              <p className="text-xs opacity-50" style={{ color: 'hsl(40, 30%, 85%)' }}>
                You'll receive a confirmation email with your intake form within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferVIP;
