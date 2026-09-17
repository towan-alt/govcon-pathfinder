import { ArrowRight, Instagram, Mail, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { BRAND } from "@/lib/brand";
import { trackCta } from "@/lib/track";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Get in touch with {BRAND.platform}
              </h1>
              <p className="text-base text-foreground/75 leading-relaxed">
                The fastest route to a real answer about your business is a strategy call. For anything
                else — speaking requests, partnerships, press or support — email works well.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-xl border border-primary/25 bg-card p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Talk about your business</h2>
                <p className="text-sm text-foreground/75 leading-relaxed">
                  Start with the free readiness assessment, or book a free strategy session directly.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/assessment"
                    onClick={() => trackCta("contact-assessment")}
                    className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm"
                  >
                    Free Readiness Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/book"
                    onClick={() => trackCta("contact-book")}
                    className="text-sm font-semibold text-foreground hover:text-primary"
                  >
                    Book a strategy call
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-foreground">Email & social</h2>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  {BRAND.email}
                </a>
                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={BRAND.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Towan Isom on Instagram"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground/80 hover:text-primary"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href={BRAND.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Towan Isom on YouTube"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground/80 hover:text-primary"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                  <a
                    href={BRAND.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Towan Isom on TikTok"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-xs font-bold text-foreground/80 hover:text-primary"
                  >
                    TikTok
                  </a>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We reply to email within two business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Contact;
