import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
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
      { label: "Yes — primary plus secondary codes", points: 3 },
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

const MAX_POINTS = QUESTIONS.length * 3;

type Tier = {
  key: string;
  name: string;
  headline: string;
  summary: string;
  step: string;
  cta: { label: string; to: string };
  secondary: { label: string; to: string };
};

const TIERS: Tier[] = [
  {
    key: "foundation",
    name: "Foundation Stage",
    headline: "Build the foundation before you bid.",
    summary:
      "Your registration, codes and positioning aren't fully in place yet. Bidding now would burn time on opportunities you can't win. First, get the basics right in the correct order.",
    step: "Start with a free strategy session so Towan can map your setup sequence.",
    cta: { label: "Book a Free Strategy Session", to: "/book" },
    secondary: { label: "Get the free Launch Kit", to: "/kit" },
  },
  {
    key: "positioning",
    name: "Positioning Stage",
    headline: "You're registered. Now get found and get competitive.",
    summary:
      "The fundamentals exist, but your positioning, targeting and capture habits aren't producing consistent opportunities yet. What you need is regular training and a rhythm you can keep.",
    step: "The Monthly Masterclass gives you a new high-impact topic, templates and live Q&A each month.",
    cta: { label: "See the Monthly Masterclass", to: "/#masterclass" },
    secondary: { label: "Or book a free strategy session", to: "/book" },
  },
  {
    key: "pursuit",
    name: "Pursuit Stage",
    headline: "You're ready to pursue real opportunities with a plan.",
    summary:
      "You have registration, positioning and delivery capacity. The gap now is a focused targeting and capture plan built specifically for your business rather than general training.",
    step: "The VIP Engagement produces your agency target list, positioning and written action plan.",
    cta: { label: "See the VIP Engagement", to: "/#vip-dfy" },
    secondary: { label: "Or book a free strategy session", to: "/book" },
  },
];

const tierFor = (score: number): Tier => {
  const pct = score / MAX_POINTS;
  if (pct < 0.4) return TIERS[0];
  if (pct < 0.7) return TIERS[1];
  return TIERS[2];
};

const RESULT_KEY = "ggc_assessment_result";

type StoredResult = { score: number; tierKey: string; firstName: string };

const Assessment = () => {
  const [step, setStep] = useState(0); // 0..QUESTIONS.length-1, then capture form
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StoredResult | null>(null);

  useEffect(() => {
    void trackEvent("assessment_start");
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (raw) {
      try {
        setResult(JSON.parse(raw) as StoredResult);
      } catch {
        sessionStorage.removeItem(RESULT_KEY);
      }
    }
  }, []);

  const score = useMemo(
    () => QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0),
    [answers],
  );

  const answeredAll = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const onCapture = step >= QUESTIONS.length;
  const progress = Math.round(
    (Math.min(step, QUESTIONS.length) / (QUESTIONS.length + 1)) * 100,
  );

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
    setSending(true);

    const { error: fnError } = await supabase.functions.invoke("submit-lead", {
      body: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        journeyStage: tier.name,
        samStatus: QUESTIONS[0].options[answers.sam ?? 0].label,
        recommendation: `Readiness assessment: ${tier.name} (${score}/${MAX_POINTS}) — ${tier.cta.label}`,
        biggestChallenge: QUESTIONS.map(
          (q) => `${q.question} → ${q.options[answers[q.id] ?? 0].label}`,
        ).join("\n"),
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

    const stored: StoredResult = { score, tierKey: tier.key, firstName: firstName.trim() };
    sessionStorage.setItem(RESULT_KEY, JSON.stringify(stored));
    setResult(stored);
    void trackEvent("assessment_complete", tier.key);
  };

  const restart = () => {
    sessionStorage.removeItem(RESULT_KEY);
    setResult(null);
    setAnswers({});
    setStep(0);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
  };

  const shownTier = result
    ? TIERS.find((t) => t.key === result.tierKey) ?? TIERS[0]
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {result && shownTier ? (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Your Result
                  </p>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                    {shownTier.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Readiness score: {result.score} of {MAX_POINTS}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/25 bg-card p-8 space-y-5">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {shownTier.headline}
                  </h2>
                  <p className="text-base text-foreground/80 leading-relaxed">{shownTier.summary}</p>
                  <p className="text-base text-foreground font-medium leading-relaxed">
                    {shownTier.step}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      to={shownTier.cta.to}
                      onClick={() => trackCta(`assessment-result-${shownTier.key}`)}
                      className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-md text-sm"
                    >
                      {shownTier.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to={shownTier.secondary.to}
                      onClick={() => trackCta(`assessment-result-alt-${shownTier.key}`)}
                      className="text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {shownTier.secondary.label}
                    </Link>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Thanks{result.firstName ? `, ${result.firstName}` : ""} — your result is saved.
                    Check your inbox and click the confirmation link so we can email your next steps.
                  </p>
                </div>

                <div className="text-center">
                  <button
                    onClick={restart}
                    className="text-sm font-semibold text-muted-foreground hover:text-primary"
                  >
                    Retake the assessment
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Free · About Two Minutes
                  </p>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
                    The GovCon Readiness Assessment
                  </h1>
                  <p className="text-base text-foreground/75 leading-relaxed">
                    Eight questions. One clear next step, chosen by {BRAND.method}.
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
