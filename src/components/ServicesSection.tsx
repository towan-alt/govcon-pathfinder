import { ArrowRight } from "lucide-react";
import towanWorkshops from "@/assets/towan-workshops.jpg";

const tiers = [
  {
    number: "01",
    title: "Free Strategy Session",
    price: "Free",
    desc: "15-minute diagnostic to assess your readiness for government contracting.",
    cta: "Book Now",
    href: "/book",
    featured: false,
  },
  {
    number: "02",
    title: "VIP Done-For-You Engagement",
    price: "$997",
    desc: "Full-service strategy engagement: 60-min intro, 8 hours of deliverable work, 30-min final session.",
    cta: "Reserve My Spot",
    href: "#vip-dfy",
    featured: true,
  },
  {
    number: "03",
    title: "Monthly Masterclass",
    price: "$197/mo",
    desc: "2-hour live virtual masterclass with Towan each month on one high-impact GovCon topic.",
    cta: "Join Now",
    href: "#masterclass",
    featured: false,
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="bg-cream-dark py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="eyebrow-dark text-xs mb-4">Our Services</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
              Coaching & consulting{" "}
              <em className="block text-primary italic">built for results</em>
            </h2>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 items-start">
            {tiers.map((tier) => (
              <div
                key={tier.number}
                className={`rounded-xl p-6 space-y-4 ${
                  tier.featured
                    ? "bg-foreground text-white shadow-xl"
                    : "bg-card border border-border shadow-sm"
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-widest ${
                  tier.featured ? "text-primary" : "text-muted-foreground"
                }`}>
                  {tier.number}
                </p>
                <h3 className={`font-display text-lg font-bold leading-tight ${
                  tier.featured ? "text-white" : "text-foreground"
                }`}>
                  {tier.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  tier.featured ? "text-white/60" : "text-muted-foreground"
                }`}>
                  {tier.desc}
                </p>
                <p className={`font-display text-2xl font-bold ${
                  tier.featured ? "text-primary" : "text-foreground"
                }`}>
                  {tier.price}
                </p>
                <a
                  href={tier.href}
                  className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
                    tier.featured
                      ? "text-primary hover:text-gold-light"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}

            {/* Image card */}
            <div className="rounded-xl overflow-hidden shadow-lg hidden lg:block">
              <img
                src={towanWorkshops}
                alt="Towan Isom consulting session"
                className="w-full h-full object-cover min-h-[320px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
