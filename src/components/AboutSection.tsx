import { Award, Globe, Building2, Users } from "lucide-react";

const highlights = [
  { icon: Building2, text: "Built a federal contracting firm from scratch — now spanning five continents" },
  { icon: Globe, text: "U.S. Marine Corps, Army, Dept. of Commerce, VA, and more" },
  { icon: Award, text: "Top 3% of women-owned businesses to cross $25M in revenue" },
  { icon: Users, text: "Commercial clients: Nike, Comcast Xfinity, MedStar, GlaxoSmithKline" },
];

const AboutSection = () => {
  return (
    <section id="about" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="divider" />
            <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl">
              Real Receipts. Real Results. Real Strategy.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Towan Isom isn't teaching theory. She's a Washington D.C.-based powerhouse CEO, founder of{" "}
              <strong className="text-foreground">Isom Global Strategies (IGS)</strong> — a woman-owned, SBA-certified 
              federal contracting and marketing firm that she built alone in her basement in 1998 into a multinational 
              company spanning five continents.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl">
              She's not handing you inspiration. She's handing you the{" "}
              <strong className="text-foreground">actual documents, proposals, and strategies that won.</strong>
            </p>
          </div>
          
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-4 rounded-lg bg-card p-6 border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 rounded-lg bg-primary p-3">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="text-sm leading-relaxed text-foreground font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
