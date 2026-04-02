import { Check } from "lucide-react";

const highlights = [
  "Built a federal contracting firm from scratch — now spanning five continents",
  "Executed contracts with U.S. Marine Corps, Army, VA, Commerce, and more",
  "Top 3% of women-owned businesses to cross $25M in revenue",
  "Coached 6,500+ small businesses through SBA and national programs",
  "Commercial clients include Nike, Comcast Xfinity, MedStar, GlaxoSmithKline",
];

const AboutSection = () => {
  return (
    <section id="about" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <p className="eyebrow-dark text-xs mb-4">About Towan Isom</p>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="space-y-6">
              <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15]">
                Decades of experience.{" "}
                <span className="block text-primary italic">Millions in results.</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Towan Isom isn't teaching theory. She's a powerhouse CEO who built a woman-owned 
                federal contracting and marketing firm from the ground up into a multinational 
                company spanning five continents.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                She's not handing you inspiration. She's handing you the{" "}
                <strong className="text-foreground">actual documents, proposals, and strategies that won.</strong>
              </p>
            </div>

            <div className="space-y-6">
              <ul className="space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="h-4 w-4 flex-shrink-0 mt-1 text-primary" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
