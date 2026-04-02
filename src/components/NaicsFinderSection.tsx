import { useState } from "react";
import { Search } from "lucide-react";

const naicsDatabase = [
  { code: "541512", title: "Computer Systems Design Services", description: "Includes IT consulting, custom software development, and systems integration. Highly used for federal IT contracts.", keywords: ["it", "software", "computer", "systems", "technology", "development", "programming", "web", "app", "digital", "cybersecurity", "cyber", "integration"] },
  { code: "541519", title: "Other Computer Related Services", description: "Covers cybersecurity consulting, IT security assessments, and vulnerability testing services.", keywords: ["cybersecurity", "security", "it", "vulnerability", "testing", "computer", "data", "network", "cyber"] },
  { code: "541611", title: "Management Consulting Services", description: "Applies when IT services are framed as strategic/management consulting rather than technical execution.", keywords: ["consulting", "management", "strategy", "advisory", "business", "organizational", "strategic"] },
  { code: "541612", title: "Human Resources Consulting Services", description: "HR consulting, workforce planning, compensation analysis, and organizational development.", keywords: ["hr", "human resources", "staffing", "workforce", "personnel", "recruiting", "talent"] },
  { code: "541613", title: "Marketing Consulting Services", description: "Marketing strategy, brand development, market research, and communications consulting.", keywords: ["marketing", "branding", "advertising", "communications", "market research", "digital marketing"] },
  { code: "541618", title: "Other Management Consulting Services", description: "Specialized consulting not elsewhere classified, including environmental and security consulting.", keywords: ["consulting", "environmental", "security", "specialized", "advisory"] },
  { code: "541620", title: "Environmental Consulting Services", description: "Environmental impact assessments, remediation consulting, and compliance advisory.", keywords: ["environmental", "remediation", "compliance", "sustainability", "green", "epa"] },
  { code: "541690", title: "Other Scientific and Technical Consulting", description: "Scientific consulting, technical advisory, and specialized analytical services.", keywords: ["scientific", "technical", "research", "analysis", "engineering", "advisory"] },
  { code: "541330", title: "Engineering Services", description: "Civil, mechanical, electrical, and environmental engineering design and consulting.", keywords: ["engineering", "civil", "mechanical", "electrical", "structural", "design", "infrastructure"] },
  { code: "541511", title: "Custom Computer Programming Services", description: "Writing, modifying, testing, and supporting software to meet client needs.", keywords: ["programming", "software", "coding", "developer", "application", "custom"] },
  { code: "561210", title: "Facilities Support Services", description: "Base operations support, facility management, and building maintenance services.", keywords: ["facilities", "maintenance", "building", "operations", "janitorial", "custodial", "cleaning"] },
  { code: "561720", title: "Janitorial Services", description: "Cleaning and janitorial services for commercial and government buildings.", keywords: ["janitorial", "cleaning", "custodial", "sanitation", "housekeeping"] },
  { code: "561320", title: "Temporary Staffing Services", description: "Providing temporary workers to clients for specific assignments or projects.", keywords: ["staffing", "temporary", "temp", "workforce", "personnel", "placement"] },
  { code: "236220", title: "Commercial and Institutional Building Construction", description: "General construction of commercial, government, and institutional buildings.", keywords: ["construction", "building", "general contractor", "commercial", "renovation"] },
  { code: "488510", title: "Freight Transportation Arrangement", description: "Freight forwarding, logistics management, and transportation coordination.", keywords: ["logistics", "freight", "transportation", "shipping", "supply chain", "distribution"] },
  { code: "541990", title: "All Other Professional Services", description: "Professional services not elsewhere classified.", keywords: ["professional", "consulting", "advisory", "services"] },
  { code: "611430", title: "Professional and Management Development Training", description: "Training programs for professional development, leadership, and management skills.", keywords: ["training", "education", "professional development", "leadership", "learning", "workshops", "coaching"] },
  { code: "541614", title: "Process, Physical Distribution, and Logistics Consulting", description: "Supply chain management, logistics optimization, and distribution consulting.", keywords: ["logistics", "supply chain", "distribution", "process", "optimization", "warehouse"] },
  { code: "561110", title: "Office Administrative Services", description: "Administrative management and general management consulting for office operations.", keywords: ["administrative", "office", "management", "operations", "admin", "support"] },
  { code: "541715", title: "Research and Development in Physical Sciences", description: "R&D in physical, engineering, and life sciences for government applications.", keywords: ["research", "development", "r&d", "science", "laboratory", "innovation"] },
  { code: "518210", title: "Data Processing and Hosting Services", description: "Data hosting, cloud computing, streaming services, and data processing.", keywords: ["cloud", "hosting", "data", "saas", "server", "storage", "aws", "azure"] },
  { code: "561612", title: "Security Guards and Patrol Services", description: "Guard services, patrol, and physical security for government facilities.", keywords: ["security", "guard", "patrol", "protection", "physical security"] },
  { code: "238210", title: "Electrical Contractors", description: "Electrical installation, wiring, and related construction work.", keywords: ["electrical", "wiring", "contractor", "installation", "electrician"] },
  { code: "237310", title: "Highway, Street, and Bridge Construction", description: "Construction of highways, roads, bridges, and related infrastructure.", keywords: ["highway", "road", "bridge", "paving", "infrastructure", "transportation"] },
  { code: "562111", title: "Solid Waste Collection", description: "Waste collection, disposal, and environmental remediation services.", keywords: ["waste", "disposal", "trash", "collection", "environmental", "recycling"] },
];

const popularSearches = ["Janitorial", "IT Support", "Construction", "Staffing", "Consulting", "Logistics", "Training"];

const matchStrength = (query: string, keywords: string[]): "best" | "strong" | "possible" => {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/);
  const directHits = terms.filter(t => keywords.some(k => k.includes(t) || t.includes(k))).length;
  const ratio = directHits / terms.length;
  if (ratio >= 0.7) return "best";
  if (ratio >= 0.4) return "strong";
  return "possible";
};

const NaicsFinderSection = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof naicsDatabase>([]);
  const [strengths, setStrengths] = useState<("best" | "strong" | "possible")[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery ?? query).toLowerCase().trim();
    if (!q) return;
    setSearched(true);

    const scored = naicsDatabase
      .map(item => {
        const kwScore = item.keywords.reduce((s, kw) => {
          if (q.includes(kw) || kw.includes(q)) return s + 3;
          const terms = q.split(/\s+/);
          const hits = terms.filter(t => kw.includes(t) || t.includes(kw)).length;
          return s + hits;
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
  };

  const handlePopular = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const matchLabel = (s: "best" | "strong" | "possible") =>
    s === "best" ? "Best match" : s === "strong" ? "Strong match" : "Possible match";

  const matchColor = (s: "best" | "strong" | "possible") =>
    s === "best"
      ? "bg-primary/20 text-primary border-primary/30"
      : s === "strong"
      ? "bg-primary/10 text-primary/80 border-primary/20"
      : "bg-muted text-muted-foreground border-border";

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            NAICS Code Finder
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find your NAICS code.<br />
            <span className="text-primary">Get it right the first time.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Type what your business does and we'll match you to the exact NAICS codes used by federal agencies to find and award contracts.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Describe your business or service"
              className="w-full h-14 pl-5 pr-36 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
              maxLength={200}
            />
            <button
              onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find My Code
            </button>
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground font-medium">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handlePopular(term)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-foreground/70 hover:border-primary hover:text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="max-w-2xl mx-auto">
            {results.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-semibold text-foreground">{results.length} matches</span> found for "{query}"
                </p>
                <div className="space-y-4">
                  {results.map((item, i) => (
                    <div
                      key={item.code}
                      className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <span className="text-2xl font-display font-bold text-primary">{item.code}</span>
                          <h3 className="text-base font-semibold text-foreground mt-1">{item.title}</h3>
                        </div>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${matchColor(strengths[i])}`}>
                          {matchLabel(strengths[i])}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No matches found. Try different keywords describing your services.
              </p>
            )}

            {/* CTA */}
            <div className="mt-10 p-6 rounded-xl border border-primary/20 bg-primary/5 text-center">
              <p className="text-foreground font-medium mb-2">Not sure which code is right for your business?</p>
              <p className="text-sm text-muted-foreground mb-5">
                Book a free clarity call — Towan will walk you through the right choice and why it matters.
              </p>
              <a href="/book" className="btn-gold text-sm px-8 py-3 rounded-lg inline-block">
                Book a Clarity Call
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NaicsFinderSection;
