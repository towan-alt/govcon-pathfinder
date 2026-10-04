import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { getLead, saveLead, PILLAR_LABELS, RESULT_KEY, REVIEW_CREDIT_LINE, REVIEW_INCLUDES, REVIEW_PRICE, type AssessmentResult, type PillarKey } from "@/lib/funnel";
import { getDevice, getSource, trackCta, trackEvent } from "@/lib/track";

type Option = { label: string; points: number };
type Question = { id: string; question: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: "sam",
    question: "Where are you with SAM.gov registration?",
    options: [
      { label: "Haven't started", points: 0 },
      { label: "In progress", points: 1 },
      { label: "Registered", points: 2 },
      { label: "Registered and kept current", points: 3 },
    ],
  },
  {
    id: "naics",
    question: "Do you know the NAICS codes buyers use to find what you sell?",
    options: [
      { label: "No idea yet", points: 0 },
      { label: "I have a rough idea", points: 1 },
      { label: "Yes, a primary code", points: 2 },
      { label: "Yes, primary plus secondary codes", points: 3 },
    ],
  },
  {
    id: "capability",
    question: "Do you have a capability statement?",
    options: [
      { label: "No", points: 0 },
      { label: "A draft", points: 1 },
      { label: "Yes, but it's generic", points: 2 },
      { label: "Yes, tailored per agency", points: 3 },
    ],
  },
  {
    id: "certs",
    question: "Which set-asides or certifications apply to you?",
    options: [
      { label: "None, and I'm not sure what fits", points: 0 },
      { label: "I think I qualify for something", points: 1 },
      { label: "One certification in progress", points: 2 },
      { label: "One or more certifications approved", points: 3 },
    ],
  },
  {
    id: "agencies",
    question: "Do you have a target list of agencies or offices that buy what you sell?",
    options: [
      { label: "No list at all", points: 0 },
      { label: "A few names", points: 1 },
      { label: "A working list", points: 2 },
      { label: "A researched list with buying history", points: 3 },
    ],
  },
  {
    id: "experience",
    question: "What government work have you delivered so far?",
    options: [
      { label: "None yet", points: 0 },
      { label: "State, local or commercial only", points: 1 },
      { label: "Subcontract work", points: 2 },
      { label: "Prime contract work", points: 3 },
    ],
  },
  {
    id: "find",
    question: "How do you find opportunities?",
    options: [
      { label: "I don't know where to look", points: 0 },
      { label: "I search now and then", points: 1 },
      { label: "Saved SAM.gov searches", points: 2 },
      { label: "A weekly routine: alerts, forecasts and eBuy", points: 3 },
    ],
  },
  {
    id: "meet",
    question: "In the last 6 months, have you met agency small business specialists or prime contractors?",
    options: [
      { label: "No", points: 0 },
      { label: "Attended an event, no follow-up", points: 1 },
      { label: "One or two real conversations", points: 2 },
      { label: "Yes, with ongoing follow-up", points: 3 },
    ],
  },
  {
    id: "proposals",
    question: "How many federal bids have you submitted in the last 12 months?",
    options: [
      { label: "None", points: 0 },
      { label: "One or two", points: 1 },
      { label: "Three to five", points: 2 },
      { label: "Six or more", points: 3 },
    ],
  },
  {
    id: "capacity",
    question: "If you won a contract next month, could you staff and deliver it?",
    options: [
      { label: "Not yet", points: 0 },
      { label: "A small one, with strain", points: 1 },
      { label: "Yes, with a partner or subs", points: 2 },
      { label: "Yes, with our current team", points: 3 },
    ],
  },
];

const PILLARS: Record<PillarKey, string[]> = {
  registered: ["sam", "naics"],
  certified: ["certs", "capability"],
  positioned: ["agencies", "experience"],
  pipeline: ["find", "meet"],
  proposal: ["proposals", "capacity"],
};

const MAX_POINTS = QUESTIONS.length * 3;

type Tier = { key: string; name: string; headline: string };

const TIERS: Tier[] = [
  { key: "foundation", name: "Foundation", headline: "Build the foundation before you bid." },
  { key: "positioning", name: "Positioning", headline: "You're registered. Now get found and get competitive." },
  { key: "bidready", name: "Bid Ready", headline: "You're ready to pursue real opportunities with a plan." },
];

const tierFor = (score100: number): Tier => (score100 < 40 ? TIERS[0] : score100 < 70 ? TIERS[1] : TIERS[2]);

const GAP_TEXT: Record<PillarKey, string> = {
  registered: "Your biggest gap is Registered. Until your SAM.gov record and NAICS codes are complete and accurate, buyers searching for what you sell won't find you. Fixing this first makes every other step count.",
  certified: "Your biggest gap is Certified. The set-asides you qualify for and a tailored capability statement are how agencies decide to look closer. Right now you're leaving that advantage on the table.",
  positioned: "Your biggest gap is Positioned. Without a short list of target agencies and a clear story about your past work, you're competing against everyone for everything. Focus is what moves you forward.",
  pipeline: "Your biggest gap is Pipeline. Contracts are shaped long before the RFP posts, and right now you're not in those early conversations. A weekly routine and real relationships change that.",
  proposal: "Your biggest gap is Proposal. Winning means bidding consistently and proving you can deliver. A repeatable bid process and a delivery plan turn opportunities into awards.",
};

const computePillars = (answers: Record<string, number>) => {
  const out = {} as Record<PillarKey, number>;
  (Object.keys(PILLARS) as PillarKey[]).forEach((k) => {
    const pts = PILLARS[k].reduce((sum, id) => sum + (answers[id] ?? 0), 0);
    out[k] = Math.round((pts / (PILLARS[k].length * 3)) * 100);
  });
  return out;
};

const lowestPillar = (p: Record<PillarKey, number>): PillarKey =>
  (Object.keys(p) as PillarKey[]).reduce((a, b) => (p[b] < p[a] ? b : a));

type StoredResult = AssessmentResult;

const Assessment = () => {
  const lead = getLead();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [firstName, setFirstName] = useState(lead?.firstName ?? "");
  const [lastName, setLastName] = useState(lead?.lastName ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    void trackEvent("assessment_start");
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredResult;
        if (parsed.pillars) setResult(parsed);
        else sessionStorage.removeItem(RESULT_KEY);
      } catch {
        sessionStorage.removeItem(RESULT_KEY);
      }
    }
  }, []);

  const rawScore = useMemo(() => QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0), [answers]);
  const score = Math.round((rawScore / MAX_POINTS) * 100);

  const answeredAll = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const onCapture = step >= QUESTIONS.length;
  const progress = Math.round((Math.min(step, QUESTIONS.length) / (QUESTIONS.length + 1)) * 100);

  const choose = (qid: string, points: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: points }));
    setStep((s) => s + 1);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter your first name, last name and a valid email address.");
      return;
    }
    const tier = tierFor(score);
    const pillars = computePillars(answers);
    const gap = lowestPillar(pillars);
    const pillarText = (Object.keys(pillars) as PillarKey[]).map((k) => `${PILLAR_LABELS[k]} ${pillars[k]}`).join(", ");
    setSending(true);
    const { error: fnError } = await supabase.functions.invoke("submit-lead", {
      body: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        journeyStage: tier.name,
        samStatus: QUESTIONS[0].options[answers.sam ?? 0].label,
        recommendation: `Readiness assessment: ${tier.name} (${score}/100). Pillars: ${pillarText}. Biggest gap: ${PILLAR_LABELS[gap]}. Next: Readiness Review`,
        biggestChallenge: QUESTIONS.map((q) => `${q.question} : ${q.options[answers[q.id] ?? 0].label}`).join("\n"),
        device: getDevice(),
        source: getSource(),
        origin: window.location.origin,
      },
    });
    setSending(false);
    if (fnError) {
      setError("Something went wrong saving your result. Please try again.");
      return;
    }
    saveLead({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() });
    const stored: StoredResult = { score, tierKey: tier.key, firstName: firstName.trim(), pillars, gap };
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(stored));
    setResult(stored);
    void trackEvent("assessment_complete", tier.key);
    void supabase.functions.invoke("training", { body: { action: "assessment", email: email.trim(), score, tier: tier.name, gap: PILLAR_LABELS[gap] } }).catch(() => null);
    window.scrollTo({ top: 0 });
  };

  const restart = () => {
    sessionStorage.removeItem(RESULT_KEY);
    setResult(null);
    setAnswers({});
    setStep(0);
  };

  const shownTier = result ? TIERS.find((t) => t.key === result.tierKey) ?? tierFor(result.score) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {result && shownTier && result.pillars && result.gap ? (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <p className="eyebrow-dark text-xs">Your GovCon Readiness Score</p>
                  <ScoreRing score={result.score} />
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground !leading-[1.15]">{shownTier.name}</h1>
                  <p className="text-lg text-foreground/80">{shownTier.headline}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
                  <h2 className="font-display text-xl font-bold text-foreground">Your five pillars</h2>
                  {(Object.keys(result.pillars) as PillarKey[]).map((k) => {
                    const isGap = k === result.gap;
                    return (
                      <div key={k} className={`rounded-lg p-3 ${isGap ? "ring-2 ring-primary" : ""}`}>
                        <div className="flex justify-between text-sm font-semibold text-foreground mb-1.5">
                          <span>{PILLAR_LABELS[k]}{isGap && <span className="ml-2 rounded bg-primary px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary-foreground">Biggest gap</span>}</span>
                          <span>{result.pillars![k]}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, result.pillars![k])}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-base text-foreground/85 leading-relaxed pt-2">
                    {result.firstName ? `${result.firstName}, ` : ""}{GAP_TEXT[result.gap]}
                  </p>
                </div>

                <div className="rounded-2xl section-navy p-6 md:p-8 space-y-5">
                  <h2 className="font-display text-2xl font-bold text-white !leading-[1.2]">Turn your score into a 90-Day Federal Action Plan</h2>
                  <ul className="space-y-2.5">
                    {REVIEW_INCLUDES.map((i) => (
                      <li key={i.title} className="flex gap-3 text-sm text-white/85"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" />{i.title}</li>
                    ))}
                  </ul>
                  <p className="font-display text-4xl font-bold text-primary">{REVIEW_PRICE}</p>
                  <p className="text-sm text-white/75">{REVIEW_CREDIT_LINE}</p>
                  <Link to="/readiness-review" onClick={() => trackCta(`assessment-result-${shownTier.key}`)} className="btn-gold gap-2 w-full sm:w-auto">
                    See the Readiness Review <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Your result is saved. Check your inbox and click the confirmation link so we can email your next steps.
                </p>
                <div className="text-center">
                  <button onClick={restart} className="text-sm font-semibold text-muted-foreground hover:text-foreground">Retake the assessment</button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Free · 10 Questions · About 3 Minutes
                  </p>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                    The GovCon Readiness Assessment
                  </h1>
                  <p className="text-base text-foreground/75 leading-relaxed">
                    Ten questions across the five pillars of the {BRAND.method}. One clear next step.
                  </p>
                </div>

                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {onCapture
                      ? "Last step — where should we send your result?"
                      : `Question ${step + 1} of ${QUESTIONS.length}`}
                  </p>
                </div>

                {!onCapture ? (
                  <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
                    <h2 className="font-display text-xl font-bold text-foreground leading-snug">
                      {QUESTIONS[step].question}
                    </h2>
                    <div className="space-y-3">
                      {QUESTIONS[step].options.map((o) => {
                        const selected = answers[QUESTIONS[step].id] === o.points;
                        return (
                          <button
                            key={o.label}
                            onClick={() => choose(QUESTIONS[step].id, o.points)}
                            className={`w-full text-left rounded-lg border px-5 py-4 text-sm font-medium transition-colors min-h-11 ${
                              selected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border bg-background text-foreground/80 hover:border-primary/50 hover:text-foreground"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                    {step > 0 && (
                      <button
                        onClick={() => setStep((s) => s - 1)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={submit}
                    className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5"
                  >
                    <h2 className="font-display text-xl font-bold text-foreground">
                      See your readiness result
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="a-first" className="text-sm font-medium text-foreground">
                          First name *
                        </label>
                        <input
                          id="a-first"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="a-last" className="text-sm font-medium text-foreground">
                          Last name *
                        </label>
                        <input
                          id="a-last"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="a-email" className="text-sm font-medium text-foreground">
                        Email *
                      </label>
                      <input
                        id="a-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="a-phone" className="text-sm font-medium text-foreground">
                        Mobile (optional)
                      </label>
                      <input
                        id="a-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                        placeholder="(555) 555-5555"
                      />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <button
                      type="submit"
                      disabled={sending || !answeredAll}
                      className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-md text-sm disabled:opacity-60"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scoring…
                        </>
                      ) : (
                        <>
                          Show My Result
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="block text-sm font-semibold text-muted-foreground hover:text-primary"
                    >
                      Back
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Assessment;

const ScoreRing = ({ score }: { score: number }) => {
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10" className="stroke-muted" />
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-primary" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
};
