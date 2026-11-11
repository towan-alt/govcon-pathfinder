import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export const SubscriberShell = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <PaymentTestModeBanner />
    <Navbar />
    <main className="flex-1 pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-3xl">
        <p className="eyebrow text-xs mb-3">{eyebrow}</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold !leading-[1.15] mb-6">{title}</h1>
        {children}
      </div>
    </main>
    <SiteFooter />
  </div>
);
