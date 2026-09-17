import { useState, useEffect } from "react";
import logoTi from "@/assets/logo-ti.png";
import { trackCta } from "@/lib/track";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "NAICS Finder", href: "/naics" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <a
          href="#"
          onClick={(e) => handleClick(e, "#")}
          className="flex items-center gap-3"
        >
          <img src={logoTi} alt="GoGovCon logo" className="h-9 w-9 rounded-md" />
          <span className={`font-display text-base font-bold tracking-tight transition-colors ${
            scrolled ? "text-foreground" : "text-white"
          }`}>
            GoGovCon
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <a
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
                  scrolled ? "text-foreground/60" : "text-white/60"
                }`}
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
                  scrolled ? "text-foreground/60" : "text-white/60"
                }`}
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="/book"
            onClick={() => trackCta("nav-book")}
            className="btn-gold text-xs px-6 py-2.5 rounded-md"
          >
            Book a Strategy Call
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 ${scrolled ? "text-foreground" : "text-white"}`}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-b border-border px-6 pb-6 pt-2 space-y-4">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-primary"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className="block text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-primary"
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="/book"
            onClick={() => trackCta("nav-mobile-book")}
            className="btn-gold text-sm px-6 py-3 rounded-md inline-block"
          >
            Book a Strategy Call
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
