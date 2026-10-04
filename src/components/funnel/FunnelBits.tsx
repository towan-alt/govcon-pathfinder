import { useEffect, useState, type ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { STATS } from "@/lib/brand";

/** Sticky bottom CTA on mobile, shown once the element with `watchId` scrolls out of view. */
export const StickyMobileCta = ({ watchId, children }: { watchId: string; children: ReactNode }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById(watchId);
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [watchId]);
  if (!show) return null;
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-primary/30 bg-navy/95 backdrop-blur px-4 py-3">
      {children}
    </div>
  );
};

export const StatsStrip = ({ dark = true }: { dark?: boolean }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {STATS.map((s) => (
      <div key={s.label} className="text-center">
        <p className={`font-display text-3xl md:text-4xl font-bold ${dark ? "text-primary" : "text-foreground"}`}>{s.value}</p>
        <p className={`mt-2 text-xs font-semibold uppercase tracking-widest ${dark ? "text-white/70" : "text-muted-foreground"}`}>{s.label}</p>
      </div>
    ))}
  </div>
);

export const FunnelFaq = ({ items, id }: { items: { q: string; a: string }[]; id: string }) => (
  <section id={id} className="bg-ti-pattern py-16 lg:py-20">
    <div className="container mx-auto px-6 max-w-3xl">
      <p className="eyebrow-dark text-xs">Questions</p>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-8 !leading-[1.15]">
        Frequently asked
      </h2>
      <Accordion type="single" collapsible className="rounded-xl border border-border bg-card px-6">
        {items.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left font-semibold text-foreground">{f.q}</AccordionTrigger>
            <AccordionContent className="text-foreground/80 leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
