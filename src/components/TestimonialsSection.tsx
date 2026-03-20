const testimonials = [
  {
    text: "Towan showed me that marketing isn't about spending more — it's about strategy. She helped me understand that with the right plan and follow-up process, I could do more with less budget. That mindset shift alone was worth it.",
    name: "Workshop Participant",
    role: "Small Business Owner",
  },
  {
    text: "New info after new info. I came in thinking I understood marketing — I didn't. Towan opened my eyes to the research side of business that nobody talks about. It's so much more than just showcasing what you have to sell.",
    name: "Felicia Annette Embry",
    role: "Business Owner",
  },
  {
    text: "Towan helped me see that winning in business isn't about isolated tactics — it's about the full system. Research, knowing your customer, strategic planning, execution, and feedback. She connects all the dots in a way no one else does.",
    name: "Abdul H. Jiwani",
    role: "Business Owner",
  },
  {
    text: "I learned how to use industry research to build a real market plan, the importance of branding, and how to analyze my current and past customers to find more of the right ones.",
    name: "Malcolm Walters",
    role: "Business Owner",
  },
  {
    text: "It's empowering to finally understand how to build a real marketing structure — physical and digital. I especially loved learning how to survey existing customers to identify my true target market. Practical and eye-opening.",
    name: "Shapree Marshall",
    role: "Business Owner",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-28" style={{ background: 'hsl(40, 10%, 97%)' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-14">
            <div className="divider mx-auto" />
            <h2 className="font-display text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl">
              What Business Owners Are Saying
            </h2>
            <p className="text-base text-muted-foreground">
              From workshops, coaching, and strategy sessions with Towan Isom
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl bg-card p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <span
                  className="absolute top-4 left-6 text-6xl leading-none font-serif text-primary/30 select-none"
                  aria-hidden
                >
                  "
                </span>
                <p className="text-sm leading-relaxed text-foreground/80 italic pt-8 mb-6">
                  {t.text}
                </p>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Supporting quotes — smaller, 2-column */}
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            {testimonials.slice(3).map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl bg-card p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <span
                  className="absolute top-3 left-5 text-5xl leading-none font-serif text-primary/25 select-none"
                  aria-hidden
                >
                  "
                </span>
                <p className="text-sm leading-relaxed text-foreground/80 italic pt-6 mb-4">
                  {t.text}
                </p>
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
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