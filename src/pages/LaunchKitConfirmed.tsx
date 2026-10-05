import { Link } from "react-router-dom";
import { Check, Download, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import PayhipConfirm from "@/components/PayhipConfirm";
import { trackEvent } from "@/lib/track";
import { KIT_NEXT_OFFER, REVIEW_PRICE, STARTER_KIT_URL } from "@/lib/funnel";

const LaunchKitConfirmed = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-2xl text-center space-y-8">
        <PayhipConfirm
          product="launch_kit"
          storageKey="ggc_kit_purchased"
          onPaid={() => void trackEvent("launch_kit_purchased")}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground !leading-[1.15]">
            Your Launch Kit is ready.
          </h1>
          <p className="text-base text-foreground/70 leading-relaxed">
            Your receipt and download link have been emailed to you. Save the email so you can
            always get back to your kit.
          </p>

          <a
            href={STARTER_KIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-4 rounded-md font-bold"
          >
            <Download className="h-4 w-4" /> Download the Launch Kit
          </a>

          <div className="rounded-md bg-navy p-8 text-left space-y-4 mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Your next step</p>
            <p className="font-display text-xl font-bold text-white !leading-[1.3]">{KIT_NEXT_OFFER}</p>
            <Link
              to="/readiness-review"
              className="btn-gold inline-flex items-center gap-2 text-sm px-6 py-3 rounded-md font-bold"
            >
              Get My Comprehensive Readiness Review · {REVIEW_PRICE}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </PayhipConfirm>
      </div>
    </main>
    <SiteFooter />
  </div>
);

export default LaunchKitConfirmed;
