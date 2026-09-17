import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { BRAND, SEAL_DISCLAIMER } from "@/lib/brand";

type Block = { heading: string; body: string[] };
export type LegalKey = "privacy" | "terms" | "accessibility" | "disclaimer";

const CONTENT: Record<LegalKey, { title: string; intro: string; blocks: Block[] }> = {
  privacy: {
    title: "Privacy Policy",
    intro: `How ${BRAND.platform} collects, uses and protects information you share on this site.`,
    blocks: [
      {
        heading: "What we collect",
        body: [
          "When you complete a form on this site — the readiness assessment, a strategy call request, the NAICS Finder sign-up or the free Launch Kit — we collect the name, email address, phone number (when you provide one) and the answers you give us about your business.",
          "We also record basic usage information: which pages you visit, which buttons you click, your device type and where you arrived from. This tells us which parts of the site are useful.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "To deliver what you asked for, to send the confirmation and follow-up emails tied to that request, and to improve the site and our programs.",
          "We do not sell your information. We do not share it with advertisers.",
        ],
      },
      {
        heading: "Email",
        body: [
          `Sign-up forms send a confirmation email. You can unsubscribe from ongoing emails at any time using the link in any message, or by writing to ${BRAND.email}.`,
        ],
      },
      {
        heading: "Service providers",
        body: [
          "We use third-party providers to host this site, store form submissions, send email and process payments. They only receive what they need to perform those functions.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          `You can ask us what information we hold about you, ask for corrections, or ask us to delete it. Write to ${BRAND.email} and we will respond.`,
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    intro: `The terms that apply when you use ${BRAND.platform} and purchase its programs.`,
    blocks: [
      {
        heading: "Use of this site",
        body: [
          "This site and its content are provided for your personal and business education. You may not resell, republish or redistribute the materials, templates or recordings we provide without written permission.",
        ],
      },
      {
        heading: "Programs and payments",
        body: [
          "The Monthly Masterclass is billed monthly and you may cancel at any time; cancellation stops future billing and does not refund a completed month. One-time engagements are billed once at purchase and scheduled with you directly.",
          "Prices shown on this site are in U.S. dollars and may change. The price shown at checkout is the price that applies to your purchase.",
        ],
      },
      {
        heading: "No guarantee of results",
        body: [
          "Our programs teach strategy, positioning and decision-making for federal contracting. Nothing here is a guarantee that you will win a contract, earn revenue or achieve any specific business result.",
        ],
      },
      {
        heading: "Not professional advice",
        body: [
          `${BRAND.platform} is not a law firm, accounting firm or registered investment adviser, and nothing on this site is legal, tax or accounting advice. Consult a qualified professional for your specific situation.`,
        ],
      },
      {
        heading: "Changes",
        body: [
          "We may update these terms. Continuing to use the site after an update means you accept the current version.",
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility Statement",
    intro: `${BRAND.platform} is committed to making this site usable by everyone, including people using assistive technology.`,
    blocks: [
      {
        heading: "Our approach",
        body: [
          "We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. That includes readable text contrast, labelled form fields and buttons, keyboard navigation through every interactive element, and text alternatives for images.",
        ],
      },
      {
        heading: "Video",
        body: [
          "We provide captions for videos published on this site, and a text transcript alongside each video so the content is available without audio.",
        ],
      },
      {
        heading: "Known limitations",
        body: [
          "Some third-party content, such as embedded chat or payment windows, is controlled by outside providers and may not fully meet our standard. We choose providers with accessibility support wherever we can.",
        ],
      },
      {
        heading: "Tell us about a problem",
        body: [
          `If any part of this site is difficult to use, email ${BRAND.email} with the page and what happened. We will work with you to provide the information another way and to fix the underlying issue.`,
        ],
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    intro: "Please read this before relying on anything published on this site.",
    blocks: [
      {
        heading: "Educational purpose",
        body: [
          "All content, training, templates and coaching offered here is educational and advisory. It does not create a business partnership, a teaming agreement or any obligation to bid on your behalf.",
        ],
      },
      {
        heading: "No guaranteed outcomes",
        body: [
          "Federal awards are decided by government evaluators using their own criteria. No program can guarantee an award, a revenue figure or a timeline. Any results, figures or case studies described on this site reflect past work and do not predict your results.",
        ],
      },
      {
        heading: "Opportunity values",
        body: [
          "Where we describe the size of contracts clients pursue, those figures describe the value of the opportunities pursued — not revenue earned by any client.",
        ],
      },
      {
        heading: "Government seals and references",
        body: [
          SEAL_DISCLAIMER,
          "References to agencies and programs describe past performance and participation. They do not indicate sponsorship, affiliation or endorsement by the United States government or any of its agencies.",
        ],
      },
    ],
  },
};

const LegalPage = ({ pageKey }: { pageKey: LegalKey }) => {
  const content = CONTENT[pageKey];

  useEffect(() => {
    document.title = `${content.title} | ${BRAND.platform}`;
  }, [content.title]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {content.title}
              </h1>
              <p className="text-base text-foreground/75 leading-relaxed">{content.intro}</p>
              <p className="text-xs text-muted-foreground">
                Last updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>

            {content.blocks.map((b) => (
              <section key={b.heading} className="space-y-3">
                <h2 className="font-display text-xl font-bold text-foreground">{b.heading}</h2>
                {b.body.map((p) => (
                  <p key={p} className="text-base text-foreground/80 leading-relaxed">
                    {p}
                  </p>
                ))}
              </section>
            ))}

            <p className="text-sm text-foreground/75">
              Questions? Email{" "}
              <a href={`mailto:${BRAND.email}`} className="font-semibold text-primary hover:underline">
                {BRAND.email}
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LegalPage;
