import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND, FIGURES } from "@/lib/brand";

const faqs = [
  {
    q: "How is GoGovCon different from other GovCon courses?",
    a: `GoGovCon is the platform; ${BRAND.method} is the method taught inside it; ${BRAND.founder} is the practitioner behind both. She is an active federal contractor with ${FIGURES.contracts} contracts and task orders managed, not a trainer teaching from someone else's playbook.`,
  },
  {
    q: "Do I need to be registered in SAM.gov first?",
    a: "No. The free readiness assessment works whether you are already registered, halfway through registration, or still deciding whether federal work fits your business. Registration is one of the steps it checks.",
  },
  {
    q: "What happens after I take the assessment?",
    a: "You see your readiness result immediately, along with the one next step that fits your stage: a free strategy session, the monthly masterclass, or a VIP engagement. You are never pushed into all three at once.",
  },
  {
    q: "Is a contract win guaranteed?",
    a: "No. No one can guarantee a federal award. What this work builds is the strategy, positioning and decision framework you need to pursue the right opportunities with greater confidence.",
  },
  {
    q: "Do the agency seals mean those agencies endorse GoGovCon?",
    a: "No. Agency seals appear as past-performance references for contracts Towan's firm has executed. They do not imply endorsement by any federal agency.",
  },
  {
    q: "Can I cancel the monthly masterclass?",
    a: "Yes. The masterclass is month to month and you can cancel anytime. Recordings of sessions you attended stay available while your membership is active.",
  },
];

const FaqSection = () => {
  return (
    <section id="faq" className="bg-background py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="eyebrow-dark text-xs">Questions</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-[1.15]">
              Frequently asked
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/75 leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
