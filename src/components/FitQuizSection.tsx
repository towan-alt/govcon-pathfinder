import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackCta, trackEvent } from "@/lib/track";

type Result = {
  recommended_id: string;
  headline: string;
  why: string;
  next_steps: string[];
  also_consider: string | null;
  option: { id: string; name: string; price: string; href: string };
};

const GOALS = [
  "Win my very first government contract",
  "Get in front of the right agencies",
  "Bid more often and win more of them",
  "Understand whether this is worth my time",
  "Grow past the contracts I already have",
];

const AREAS = [
  "IT & technology services",
  "Construction & facilities",
  "Professional & management services",
  "Healthcare & medical",
  "Logistics & transportation",
  "Training & education",
  "Marketing & communications",
  "Security services",
  "Environmental services",
  "Staffing & HR",
  "Janitorial & building support",
  "Something else",
];

const STAGES = [
  "I'm just exploring — nothing set up yet",
  "I'm registered but haven't bid",
  "I've bid a few times without winning",
  "I've won at least one contract",
];

const EXPERIENCE = ["None at all", "A little", "Quite a bit"];
const BUDGETS = ["Free only for now", "A small monthly amount", "Ready to invest for speed"];
const TIMELINES = ["This month", "Next 3 months", "Sometime this year"];

const Field = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-white/50 font-display">
      {label}
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              active
                ? "border-primary bg-primary text-black font-semibold"
                : "border-white/15 text-white/75 hover:border-primary/60 hover:text-white"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

const FitQuizSection = () => {
  const [goal, setGoal] = useState("");
  const [naicsArea, setNaicsArea] = useState("");
  const [stage, setStage] = useState("");
  const [experience, setExperience] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const ready = goal && naicsArea && stage;

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    void trackEvent("quiz_submit");

    const { data, error: fnError } = await supabase.functions.invoke("fit-quiz", {
      body: { goal, naicsArea, stage, experience, budget, timeline },
    });

    setLoading(false);

    const payload = data as (Result & { error?: string }) | null;
    if (fnError || !payload || payload.error) {
      setError("We couldn't build your recommendation just now. Please try again in a moment.");
      return;
    }

    setResult(payload);
    sessionStorage.setItem(
      "ggc_recommendation",
      `${payload.option.name} (${payload.option.price}) — ${payload.headline}`,
    );
  };

  return (
    <section id="fit-quiz" className="section-navy py-20 lg:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-display">
              Find Your Starting Point
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
              Not sure where to begin?{" "}
              <em className="block text-primary italic">Answer six quick questions.</em>
            </h2>
            <p className="text-white/70 max-w-2xl">
              Tell us your goal and the kind of work you do, and we'll point you to the right first
              step — plus exactly what to do next.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-7">
            <Field label="What do you most want to happen?" options={GOALS} value={goal} onChange={setGoal} />
            <Field label="What kind of work do you do?" options={AREAS} value={naicsArea} onChange={setNaicsArea} />
            <Field label="Where are you today?" options={STAGES} value={stage} onChange={setStage} />
            <Field label="Experience bidding" options={EXPERIENCE} value={experience} onChange={setExperience} />
            <Field label="Budget comfort" options={BUDGETS} value={budget} onChange={setBudget} />
            <Field label="When do you want results?" options={TIMELINES} value={timeline} onChange={setTimeline} />

            <div className="pt-2">
              <button
                type="button"
                onClick={run}
                disabled={!ready || loading}
                className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-3.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Matching you…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Show my best starting point
                  </>
                )}
              </button>
              {!ready && (
                <p className="mt-3 text-xs text-white/40">
                  Pick a goal, your work area, and where you are today to continue.
                </p>
              )}
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </div>
          </div>

          {result && (
            <div className="mt-8 rounded-xl border border-primary/40 bg-primary/[0.06] p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-display">
                  Recommended for you
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                  {result.option.name}
                  <span className="ml-3 text-base font-normal text-primary">{result.option.price}</span>
                </h3>
                <p className="text-white/85 font-medium">{result.headline}</p>
                <p className="text-white/70 leading-relaxed">{result.why}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50 font-display">
                  Your next steps
                </p>
                <ul className="space-y-2.5">
                  {result.next_steps.map((step) => (
                    <li key={step} className="flex items-start gap-3">
                      <Check className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                      <span className="text-sm leading-relaxed text-white/80">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.also_consider && (
                <p className="text-sm italic text-white/55 border-l-2 border-primary/40 pl-4">
                  {result.also_consider}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                {result.option.href.startsWith("/book") ? (
                  <Link
                    to="/book"
                    onClick={() => trackCta(`quiz-${result.option.id}`)}
                    className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-3.5 rounded-md"
                  >
                    Take this step <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a
                    href={result.option.href.replace("/#", "#")}
                    onClick={() => trackCta(`quiz-${result.option.id}`)}
                    className="btn-gold inline-flex items-center gap-2 text-sm px-8 py-3.5 rounded-md"
                  >
                    See the details <ArrowRight className="h-4 w-4" />
                  </a>
                )}
                <Link
                  to="/book"
                  onClick={() => trackCta("quiz-secondary-book")}
                  className="text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-white"
                >
                  Or book the free 15-minute session
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FitQuizSection;
