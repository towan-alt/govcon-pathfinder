import towanHero from "@/assets/towan-hero.jpg";

const AboutTowanSection = () => {
  return (
    <section className="section-navy py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Photo */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={towanHero}
                alt="Towan Isom"
                className="w-full h-full object-cover object-[center_25%]"
              />
            </div>
          </div>

          {/* Right — Bio */}
          <div className="space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
              <span className="text-primary italic">$27 million</span> in federal contracts.{" "}
              Thirty years of doing the work.
            </h2>
            <p className="text-base text-white/60 leading-relaxed">
              Towan Isom is a powerhouse CEO who built a woman-owned federal contracting and 
              marketing firm from the ground up into a multinational company spanning five 
              continents. She's coached over 6,500 small businesses, executed 105+ federal 
              contracts, and generated over $25M in revenue.
            </p>
            <blockquote className="border-l-2 border-primary pl-5 py-2">
              <p className="text-base text-white/80 italic leading-relaxed">
                "What you need isn't more advice from people who haven't been in the trenches — 
                you need someone who's done the work."
              </p>
            </blockquote>
            <div className="pt-2">
              <p className="font-display text-xl font-bold text-white italic">Towan Isom</p>
              <p className="text-sm text-white/40">CEO & Federal Contracting Strategist</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTowanSection;
