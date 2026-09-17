import { Instagram, Youtube, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logoTi from "@/assets/logo-ti.png";
import { BRAND, SEAL_DISCLAIMER } from "@/lib/brand";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "About Towan", to: "/about" },
      { label: "Services", to: "/#services" },
      { label: "Results", to: "/#results" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Readiness Assessment", to: "/assessment" },
      { label: "Book a Strategy Call", to: "/book" },
      { label: "Free Launch Kit", to: "/kit" },
      { label: "NAICS Finder", to: "/naics" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Use", to: "/terms" },
      { label: "Accessibility", to: "/accessibility" },
      { label: "Disclaimer", to: "/disclaimer" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const SiteFooter = () => {
  return (
    <footer className="border-t pt-14 pb-10" style={{ background: "hsl(0 0% 2%)", borderColor: "hsl(0 0% 100% / 0.08)" }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logoTi} alt={`${BRAND.platform} logo`} className="h-11 w-11 rounded-md" />
              <span className="font-display text-lg font-bold text-white tracking-tight">
                {BRAND.platform}
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              {BRAND.tagline} Federal contracting strategy for small businesses that intend to
              compete and deliver.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={BRAND.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Towan Isom on Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/80 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={BRAND.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Towan Isom on YouTube"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/80 hover:text-primary hover:border-primary/40 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href={BRAND.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Towan Isom on TikTok"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/80 hover:text-primary hover:border-primary/40 transition-colors text-xs font-bold"
              >
                TikTok
              </a>
            </div>
            <a
              href={`mailto:${BRAND.email}`}
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              {BRAND.email}
            </a>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-white/70 hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-12 border-t pt-6 space-y-3" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
          <p className="text-xs text-white/55 leading-relaxed">{SEAL_DISCLAIMER}</p>
          <p className="text-xs text-white/55 leading-relaxed">
            Educational and advisory services only. Nothing on this site is a guarantee of a contract
            award, revenue or business result. {BRAND.platform} is not a law firm and does not provide
            legal, accounting or tax advice.
          </p>
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} {BRAND.platform}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
