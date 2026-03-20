import { useState, useEffect } from "react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "VIP Session", href: "#vip" },
  { label: "Masterclass", href: "#masterclass" },
  { label: "Substack", href: "#substack" },
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
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`font-display text-lg font-extrabold tracking-tight transition-colors ${
            scrolled ? "text-foreground" : "text-white"
          }`}
        >
          GOVCON STRATEGY HUB
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
                scrolled ? "text-foreground/70" : "text-white/70"
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#vip"
            onClick={(e) => handleClick(e, "#vip")}
            className="btn-gold text-sm px-6 py-3 rounded-lg"
          >
            Book Free Session
          </a>
        </div>

        {/* Mobile toggle */}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-6 pb-6 pt-2 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="block text-sm font-semibold uppercase tracking-wider text-foreground/70 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#vip"
            onClick={(e) => handleClick(e, "#vip")}
            className="btn-gold text-sm px-6 py-3 rounded-lg inline-block"
          >
            Book Free Session
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
