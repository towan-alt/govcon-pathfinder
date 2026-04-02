import { Play } from "lucide-react";

const testimonials = [
  {
    name: "Workshop Participant",
    role: "Small Business Owner",
    text: "Towan showed me that marketing isn't about spending more — it's about strategy. She helped me understand that with the right plan and follow-up process, I could do more with less budget.",
  },
  {
    name: "Felicia Annette Embry",
    role: "Business Owner",
    text: "New info after new info. I came in thinking I understood marketing — I didn't. Towan opened my eyes to the research side of business that nobody talks about.",
  },
  {
    name: "Abdul H. Jiwani",
    role: "Business Owner",
    text: "Towan helped me see that winning in business isn't about isolated tactics — it's about the full system. Research, knowing your customer, strategic planning, execution, and feedback.",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="eyebrow-dark text-xs mb-4">Client Results</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
              Results from{" "}
              <em className="text-primary italic">real clients</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="group rounded-xl overflow-hidden bg-foreground shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Video placeholder */}
                <div className="relative aspect-video bg-navy-light flex items-center justify-center cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-white/70 italic leading-relaxed mb-4">"{t.text}"</p>
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
