import { useEffect, useState } from "react";
import { Instagram, Search, X, Youtube } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { getDevice, getSource, trackCta, trackEvent } from "@/lib/track";

const naicsDatabase = [
  { code: "541512", title: "Computer Systems Design Services", description: "IT consulting, systems integration, computer hardware consulting, and technology strategy services. This is one of the highest-volume NAICS codes in federal IT contracting — used across DoD, DHS, and most civilian agencies.", keywords: ["it", "software", "computer", "systems", "technology", "development", "programming", "web", "app", "digital", "cybersecurity", "cyber", "integration"], tags: ["Information Technology", "Services"] },
  { code: "541519", title: "Other Computer Related Services", description: "Covers cybersecurity consulting, IT security assessments, vulnerability testing, and penetration testing services. Pair this as a secondary code alongside 541512 to maximize your agency visibility.", keywords: ["cybersecurity", "security", "it", "vulnerability", "testing", "computer", "data", "network", "cyber", "penetration"], tags: ["Information Technology", "Services"] },
  { code: "541611", title: "Administrative Management Consulting Services", description: "Applies when IT services are framed as strategic or management consulting rather than technical execution. Consider this if your engagements include CIO advisory, digital transformation strategy, or IT governance.", keywords: ["consulting", "management", "strategy", "advisory", "business", "organizational", "strategic", "administrative"], tags: ["Professional Services", "Consulting"] },
  { code: "541612", title: "Human Resources Consulting Services", description: "HR consulting, workforce planning, compensation analysis, and organizational development for federal agencies.", keywords: ["hr", "human resources", "staffing", "workforce", "personnel", "recruiting", "talent"], tags: ["Professional Services", "Consulting"] },
  { code: "541613", title: "Marketing Consulting Services", description: "Marketing strategy, brand development, market research, and communications consulting for government organizations.", keywords: ["marketing", "branding", "advertising", "communications", "market research", "digital marketing"], tags: ["Professional Services", "Marketing"] },
  { code: "541618", title: "Other Management Consulting Services", description: "Specialized consulting not elsewhere classified, including environmental and security consulting for federal clients.", keywords: ["consulting", "environmental", "security", "specialized", "advisory"], tags: ["Professional Services", "Consulting"] },
  { code: "541620", title: "Environmental Consulting Services", description: "Environmental impact assessments, remediation consulting, and compliance advisory for federal environmental programs.", keywords: ["environmental", "remediation", "compliance", "sustainability", "green", "epa"], tags: ["Environmental", "Consulting"] },
  { code: "541690", title: "Other Scientific and Technical Consulting", description: "Scientific consulting, technical advisory, and specialized analytical services for government R&D programs.", keywords: ["scientific", "technical", "research", "analysis", "engineering", "advisory"], tags: ["Scientific", "Technical"] },
  { code: "541330", title: "Engineering Services", description: "Civil, mechanical, electrical, and environmental engineering design and consulting for federal infrastructure projects.", keywords: ["engineering", "civil", "mechanical", "electrical", "structural", "design", "infrastructure"], tags: ["Engineering", "Services"] },
  { code: "541511", title: "Custom Computer Programming Services", description: "Writing, modifying, testing, and supporting software to meet specific federal agency requirements.", keywords: ["programming", "software", "coding", "developer", "application", "custom"], tags: ["Information Technology", "Development"] },
  { code: "561210", title: "Facilities Support Services", description: "Base operations support, facility management, and building maintenance services for federal properties.", keywords: ["facilities", "maintenance", "building", "operations", "janitorial", "custodial", "cleaning"], tags: ["Facilities", "Services"] },
  { code: "561720", title: "Janitorial Services", description: "Cleaning and janitorial services for commercial and government buildings. One of the most common entry points for small businesses.", keywords: ["janitorial", "cleaning", "custodial", "sanitation", "housekeeping"], tags: ["Facilities", "Services"] },
  { code: "561320", title: "Temporary Staffing Services", description: "Providing temporary workers to federal agencies for specific assignments or projects.", keywords: ["staffing", "temporary", "temp", "workforce", "personnel", "placement"], tags: ["Staffing", "Services"] },
  { code: "236220", title: "Commercial Building Construction", description: "General construction of commercial, government, and institutional buildings including renovations.", keywords: ["construction", "building", "general contractor", "commercial", "renovation"], tags: ["Construction", "Services"] },
  { code: "488510", title: "Freight Transportation Arrangement", description: "Freight forwarding, logistics management, and transportation coordination for government supply chains.", keywords: ["logistics", "freight", "transportation", "shipping", "supply chain", "distribution"], tags: ["Logistics", "Transportation"] },
  { code: "611430", title: "Professional Development Training", description: "Training programs for professional development, leadership, and management skills for federal employees.", keywords: ["training", "education", "professional development", "leadership", "learning", "workshops", "coaching"], tags: ["Training", "Education"] },
  { code: "541614", title: "Process and Logistics Consulting", description: "Supply chain management, logistics optimization, and distribution consulting for federal operations.", keywords: ["logistics", "supply chain", "distribution", "process", "optimization", "warehouse"], tags: ["Logistics", "Consulting"] },
  { code: "561110", title: "Office Administrative Services", description: "Administrative management and general management consulting for federal office operations.", keywords: ["administrative", "office", "management", "operations", "admin", "support"], tags: ["Administrative", "Services"] },
  { code: "518210", title: "Data Processing and Hosting Services", description: "Data hosting, cloud computing, streaming services, and data processing for government agencies.", keywords: ["cloud", "hosting", "data", "saas", "server", "storage", "aws", "azure"], tags: ["Information Technology", "Cloud"] },
  { code: "561612", title: "Security Guards and Patrol Services", description: "Guard services, patrol, and physical security for government facilities and installations.", keywords: ["security", "guard", "patrol", "protection", "physical security"], tags: ["Security", "Services"] },
  { code: "484110", title: "General Freight Trucking, Local", description: "Local freight trucking and delivery services for government contracts within metropolitan areas.", keywords: ["trucking", "freight", "delivery", "local", "transportation", "hauling"], tags: ["Transportation", "Logistics"] },
];

const popularSearches = ["IT consulting", "Janitorial", "Construction", "Staffing", "Cybersecurity", "Training", "Logistics", "Consulting"];

const mostSearched = [
  { code: "541512", title: "Computer Systems Design Services" },
  { code: "541611", title: "Management Consulting Services" },
  { code: "561720", title: "Janitorial Services" },
  { code: "541519", title: "Other Computer Related Services" },
  { code: "561320", title: "Temporary Staffing Services" },
  { code: "236220", title: "Commercial Building Construction" },
  { code: "611430", title: "Professional Development Training" },
  { code: "484110", title: "General Freight Trucking, Local" },
  { code: "541511", title: "Custom Computer Programming" },
];

const matchStrength = (query: string, keywords: string[]): "best" | "strong" | "also" => {
  const terms = query.toLowerCase().split(/\s+/);
  const directHits = terms.filter(t => keywords.some(k => k.includes(t) || t.includes(k))).length;
  const ratio = directHits / terms.length;
  if (ratio >= 0.7) return "best";
  if (ratio >= 0.4) return "strong";
  return "also";
};

const NaicsPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof naicsDatabase>([]);
  const [strengths, setStrengths] = useState<("best" | "strong" | "also")[]>([]);
  const [searched, setSearched] = useState(false);

  const [hasSubscription] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem("naicsSubscribedInfo"));
    } catch {
      return false;
    }
  });
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subFirst, setSubFirst] = useState("");
  const [subLast, setSubLast] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subNaics, setSubNaics] = useState("");
  const [subMobile, setSubMobile] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "sending" | "sent">(hasSubscription ? "sent" : "idle");
  const [subError, setSubError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("naicsSubscribedInfo");
      if (!raw) return;
      const info = JSON.parse(raw);
      setSubFirst(info.first ?? "");
      setSubLast(info.last ?? "");
      setSubEmail(info.email ?? "");
      setSubNaics(info.naics ?? "");
    } catch {
      // ignore malformed storage
    }
  }, []);


  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery ?? query).toLowerCase().trim();
    if (!q) return;
    setSearched(true);

    const scored = naicsDatabase
      .map(item => {
        const kwScore = item.keywords.reduce((s, kw) => {
          if (q.includes(kw) || kw.includes(q)) return s + 3;
          const terms = q.split(/\s+/);
          return s + terms.filter(t => kw.includes(t) || t.includes(kw)).length;
        }, 0);
        const titleScore = item.title.toLowerCase().includes(q) ? 5 : 0;
        const descScore = item.description.toLowerCase().includes(q) ? 2 : 0;
        return { ...item, score: kwScore + titleScore + descScore };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setResults(scored);
    setStrengths(scored.map(item => matchStrength(q, item.keywords)));

    if (scored.length > 0) {
      setSubNaics(scored[0].code);
      if (!hasSubscription) {
        setSubStatus("idle");
        setSubError(null);
      }
      setTimeout(() => {
        document.getElementById("naics-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError(null);
    const missing: string[] = [];
    if (!subFirst.trim()) missing.push("first name");
    if (!subLast.trim()) missing.push("last name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subEmail.trim())) missing.push("a valid email address");
    if (!subNaics.trim()) missing.push("your NAICS code");
    if (!/^[\d\s()+.-]{7,20}$/.test(subMobile.trim())) missing.push("a valid mobile number");
    if (missing.length > 0) {
      setSubError(`Please enter ${missing.join(", ")}.`);
      return;
    }
    setSubStatus("sending");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("submit-lead", {
        body: {
          firstName: subFirst.trim(),
          lastName: subLast.trim(),
          email: subEmail.trim(),
          phone: subMobile.trim(),
          naicsCode: subNaics.trim(),
          referralSource: "NAICS Finder notifications",
          device: getDevice(),
          source: getSource(),
          origin: window.location.origin,
        },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      sessionStorage.setItem("naicsSubscribed", "1");
      sessionStorage.setItem(
        "naicsSubscribedInfo",
        JSON.stringify({
          first: subFirst.trim(),
          last: subLast.trim(),
          email: subEmail.trim(),
          naics: subNaics.trim(),
        })
      );
      setSubStatus("sent");
      void trackEvent("naics_subscribe");

    } catch (err) {
      setSubStatus("idle");
      setSubError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handlePopular = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const matchLabel = (s: "best" | "strong" | "also") =>
    s === "best" ? "BEST MATCH" : s === "strong" ? "STRONG MATCH" : "ALSO CONSIDER";

  const matchBadgeClass = (s: "best" | "strong" | "also") =>
    s === "best"
      ? "bg-primary/20 text-primary border-primary/40"
      : s === "strong"
      ? "bg-primary/10 text-primary/80 border-primary/30"
      : "bg-muted text-muted-foreground border-border";

  const resultBorderClass = (s: "best" | "strong" | "also") =>
    s === "best" ? "border-primary/50" : "border-border";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-[hsl(var(--navy))] pt-28 pb-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Free Tool · The GovCon Expert
            </span>
            <span className="w-8 h-px bg-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
            Find your NAICS code.
          </h1>
          <p className="font-display text-3xl md:text-4xl italic text-primary mb-6">
            Get it right the first time.
          </p>
          <p className="text-white/60 max-w-xl mx-auto text-base mb-10">
            Type what your business does and get matched to the exact NAICS codes federal agencies use to find and award contracts to small businesses like yours.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Describe your business or service"
                className="w-full h-14 pl-5 pr-5 rounded-lg border-0 bg-white text-[hsl(var(--navy))] placeholder:text-[hsl(var(--navy))]/40 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                maxLength={200}
              />
              <button
                onClick={() => handleSearch()}
                className="btn-gold text-sm px-6 h-14 rounded-lg flex items-center justify-center gap-2 font-bold shrink-0 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                FIND MY CODE
              </button>
            </div>
          </div>

          {/* Popular */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/60">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handlePopular(term)}
                className="px-3 py-1 rounded-full text-xs font-medium border border-white/20 text-white/60 hover:border-primary hover:text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[hsl(var(--navy-light))] border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-white/10">
            {[
              { value: "1,000+", label: "NAICS codes in the database" },
              { value: "$27M", label: "In federal contracts secured by Towan for her clients" },
              { value: "Free", label: "No signup required — search instantly" },
            ].map((stat) => (
              <div key={stat.value} className="py-8 text-center">
                <p className="font-display text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section id="naics-results" className="py-14 bg-background scroll-mt-20">
          <div className="container mx-auto px-6 max-w-3xl">
            {results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                    {results.length} Matches Found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Results for "{query}"
                  </p>
                </div>
                <div className="space-y-4">
                  {results.map((item, i) => (
                    <div
                      key={item.code}
                      className={`p-6 rounded-lg border-2 bg-card transition-colors ${resultBorderClass(strengths[i])}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                        <div className="flex items-center justify-between sm:block">
                          <span className="font-display text-3xl font-bold text-foreground shrink-0 sm:w-24">{item.code}</span>
                          <span className={`sm:hidden shrink-0 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${matchBadgeClass(strengths[i])}`}>
                            {matchLabel(strengths[i])}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                            <span className={`hidden sm:inline-block shrink-0 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${matchBadgeClass(strengths[i])}`}>
                              {matchLabel(strengths[i])}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                          <div className="flex gap-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="px-2.5 py-0.5 rounded text-[10px] font-semibold border border-primary/30 text-primary bg-primary/5">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-lg border border-primary/30 bg-primary/5">
                  <p className="text-sm text-foreground text-center sm:text-left">
                    Want alerts for opportunities under NAICS{" "}
                    <span className="font-bold text-primary">{results[0]?.code}</span>?
                  </p>
                  <button
                    onClick={() => {
                      setSubNaics(results[0]?.code ?? "");
                      setShowSubscribe(true);
                      trackCta("naics-open-subscribe");
                    }}
                    className="btn-gold text-xs px-6 py-3 rounded-md font-bold uppercase tracking-wider shrink-0"
                  >
                    Get notified
                  </button>
                </div>
              </>

            ) : (
              <p className="text-center text-muted-foreground py-8">
                No matches found. Try different keywords describing your services.
              </p>
            )}

            {/* CTA Banner */}
            <div className="mt-10 p-8 rounded-lg bg-[hsl(var(--navy))] flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Not sure which code is the right fit for your business?</h3>
                <p className="text-sm text-white/60">
                  Choosing the wrong NAICS code is one of the most common — and costly — mistakes new federal contractors make. Book a free clarity call and Towan will review your business and confirm the right code personally.
                </p>
              </div>
              <a href="/book" className="btn-gold text-xs px-8 py-3 rounded-md font-bold uppercase tracking-wider shrink-0">
                Book a Free Clarity Call
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Most Searched */}
      <section className="py-14 bg-background border-t border-border">
        <div className="container mx-auto px-6 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-6">
            Most Searched NAICS Codes for Federal Contractors
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {mostSearched.map(item => (
              <button
                key={item.code}
                onClick={() => { setQuery(item.title); handleSearch(item.title); }}
                className="text-left p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <p className="font-display text-base font-bold text-foreground">{item.code}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.title}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Content */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            What is a NAICS code and why does it matter for federal contracting?
          </h2>
          <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
            <p>
              A NAICS (North American Industry Classification System) code is a 6-digit number that classifies your business by industry. In federal contracting, your NAICS code determines which solicitations you're eligible to bid on, which agencies can find your business in SAM.gov, and whether you qualify for small business set-aside contracts.
            </p>
            <p>
              Choosing the right NAICS code — or codes — is one of the most important first steps in your GovCon journey. Get it wrong and you'll be invisible to the contracting officers and agencies that need exactly what your business offers. Most small businesses qualify for multiple NAICS codes. Your primary code should reflect your highest-revenue service; secondary codes broaden your visibility across additional contract vehicles and agency procurement systems.
            </p>
          </div>
        </div>
      </section>

      {/* Subscribe popup */}
      {showSubscribe && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "hsl(0 0% 0% / 0.7)" }}
          onClick={() => setShowSubscribe(false)}
        >
          <div
            className="relative w-full max-w-md rounded-xl border p-8 shadow-2xl"
            style={{ borderColor: "hsl(45 55% 55% / 0.3)", background: "hsl(0 0% 7%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSubscribe(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {subStatus === "sent" ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-primary/15 border border-primary/40">
                  <span className="text-primary text-2xl">✓</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Almost done — confirm your email
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  We just emailed you a confirmation link for NAICS{" "}
                  <span className="text-primary font-semibold">{subNaics}</span>. Click it and
                  we'll send your starting-point questions right away.
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Follow Towan Isom, CEO for more
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href="https://www.instagram.com/towanisomceo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCta("naics-sub-success-instagram")}
                    className="flex items-center gap-2 rounded-md border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                  <a
                    href="https://www.youtube.com/@towanisom5164"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCta("naics-sub-success-youtube")}
                    className="flex items-center gap-2 rounded-md border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Youtube className="w-4 h-4" />
                    YouTube
                  </a>
                  <a
                    href="https://www.tiktok.com/@towanisomceo"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCta("naics-sub-success-tiktok")}
                    className="flex items-center gap-2 rounded-md border border-primary/40 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                    TikTok
                  </a>
                </div>
                <button
                  onClick={() => setShowSubscribe(false)}
                  className="btn-gold text-sm px-8 py-3 rounded-md"
                >
                  Back to my results
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Get notified
                  </p>
                  <h3 className="font-display text-2xl font-bold text-white leading-snug">
                    Get alerts for NAICS{" "}
                    <span className="text-primary">{subNaics || "opportunities"}</span>
                  </h3>
                  <p className="text-sm text-white/55 leading-relaxed">
                    Subscribe and we'll notify you about contracting opportunities and updates that
                    match your code. All fields are required.
                  </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="sub-first" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                        First name *
                      </label>
                      <input
                        id="sub-first"
                        value={subFirst}
                        onChange={(e) => setSubFirst(e.target.value)}
                        className="w-full rounded-md border px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                      />
                    </div>
                    <div>
                      <label htmlFor="sub-last" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                        Last name *
                      </label>
                      <input
                        id="sub-last"
                        value={subLast}
                        onChange={(e) => setSubLast(e.target.value)}
                        className="w-full rounded-md border px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="sub-email" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                      Email address *
                    </label>
                    <input
                      id="sub-email"
                      type="email"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-md border px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                      style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="sub-naics" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                        NAICS code *
                      </label>
                      <input
                        id="sub-naics"
                        value={subNaics}
                        onChange={(e) => setSubNaics(e.target.value)}
                        className="w-full rounded-md border px-3 py-2.5 text-sm text-primary font-semibold focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(45 55% 55% / 0.35)", background: "hsl(0 0% 10%)" }}
                      />
                    </div>
                    <div>
                      <label htmlFor="sub-mobile" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">
                        Mobile *
                      </label>
                      <input
                        id="sub-mobile"
                        type="tel"
                        value={subMobile}
                        onChange={(e) => setSubMobile(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full rounded-md border px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                      />
                    </div>
                  </div>

                  {subError && <p className="text-sm text-red-400">{subError}</p>}

                  <button
                    type="submit"
                    disabled={subStatus === "sending"}
                    onClick={() => trackCta("naics-subscribe")}
                    className="btn-gold w-full text-sm px-8 py-3.5 rounded-md disabled:opacity-60"
                  >
                    {subStatus === "sending" ? "Subscribing…" : "Notify me of opportunities"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NaicsPage;
