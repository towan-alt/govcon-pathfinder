import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, PlayCircle, Radio, CalendarClock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLead, REG_KEY, saveLead, trainingSessionOptions, type TrainingSessionOption } from "@/lib/funnel";
import { getDevice, getSource, trackEvent } from "@/lib/track";

/** Live-updating list of real session times (re-computed every 30 seconds). */
function useSessionOptions() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => trainingSessionOptions(now), [now]);
}

const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-foreground mb-1">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive mt-1" role="alert">{error}</p>}
  </div>
);

const iconFor = (o: TrainingSessionOption) => (o.type === "live" ? Radio : o.type === "instant" ? PlayCircle : CalendarClock);

export default function TrainingRegisterForm({ heading = "Pick your time. Save your free seat." }: { heading?: string }) {
  const navigate = useNavigate();
  const options = useSessionOptions();
  const prior = getLead();
  const [choiceKey, setChoiceKey] = useState<string>("");
  const [firstName, setFirstName] = useState(prior?.firstName ?? "");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState(prior?.email ?? "");
  const [phone, setPhone] = useState(prior?.phone ?? "");
  const [sms, setSms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  // The "next showing" key changes as time passes; keep a valid selection.
  const selected = options.find((o) => o.key === choiceKey) ?? options[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Please enter your first name.";
    if (!lastName.trim()) errs.lastName = "Please enter your last name.";
    if (!businessName.trim()) errs.businessName = "Please enter your business name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email.";
    if (phone.replace(/\D/g, "").length < 10) errs.phone = "Please enter a 10-digit mobile number.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    const sessionStart = selected.type === "instant" ? new Date() : selected.start;
    const base = { firstName: firstName.trim(), email: email.trim(), phone: phone.trim(), device: getDevice(), source: getSource(), origin: window.location.origin };
    const [reg, lead] = await Promise.all([
      supabase.functions.invoke("training", {
        body: { action: "register", ...base, smsConsent: sms, sessionType: selected.type, sessionStart: sessionStart.toISOString() },
      }),
      supabase.functions.invoke("submit-lead", {
        body: {
          ...base,
          lastName: lastName.trim(),
          businessName: businessName.trim(),
          recommendation: `Webinar registration: ${selected.type} ${selected.type === "instant" ? "now" : selected.title}${sms ? " · SMS reminders opted in" : ""}`,
        },
      }),
    ]);
    setSending(false);
    const id = (reg.data as { id?: string } | null)?.id;
    if (reg.error || !id) {
      setErrors({ form: (reg.data as { error?: string } | null)?.error ?? "We couldn't save your seat. Please try again; your details are still here." });
      return;
    }
    void lead;
    saveLead({ firstName: base.firstName, email: base.email, phone: base.phone, session: selected.type === "live" ? "live" : "replay", sessionIso: sessionStart.toISOString() });
    sessionStorage.setItem(REG_KEY, id);
    void trackEvent("training_register", selected.type);
    navigate(selected.type === "instant" ? `/training/watch?r=${id}` : `/training/registered?r=${id}`);
  };

  const inputCls = "w-full rounded-md border bg-background px-4 py-2.5 md:py-3 text-sm text-foreground placeholder:text-muted-foreground";

  return (
    <form id="register" onSubmit={submit} noValidate className="rounded-2xl bg-card text-card-foreground p-5 md:p-7 shadow-2xl space-y-3 md:space-y-4 border-t-4 border-primary scroll-mt-24">
      <p className="font-display text-lg md:text-xl font-bold text-foreground !leading-[1.25]">{heading}</p>
      <div className="grid gap-2 max-h-[22rem] overflow-y-auto pr-1" role="radiogroup" aria-label="Choose your session time">
        {options.map((o) => {
          const Icon = iconFor(o);
          const active = selected.key === o.key;
          return (
            <label key={o.key} className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${active ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
              <input type="radio" name="session" value={o.key} checked={active} onChange={() => setChoiceKey(o.key)} className="sr-only" />
              <Icon className="h-5 w-5 mt-0.5 shrink-0 text-foreground" />
              <span className="flex-1 min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{o.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${o.badge === "Starting soon" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{o.badge}</span>
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">{o.sub}</span>
              </span>
              <span className={`shrink-0 text-[11px] font-bold ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {active ? <span className="inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Reserved</span> : "Reserve My Seat"}
              </span>
            </label>
          );
        })}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field id="t-first" label="First name" error={errors.firstName}>
          <input id="t-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={80} className={`${inputCls} ${errors.firstName ? "border-destructive" : "border-border"}`} />
        </Field>
        <Field id="t-last" label="Last name" error={errors.lastName}>
          <input id="t-last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={80} className={`${inputCls} ${errors.lastName ? "border-destructive" : "border-border"}`} />
        </Field>
      </div>
      <Field id="t-business" label="Business name" error={errors.businessName}>
        <input id="t-business" autoComplete="organization" value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={120} className={`${inputCls} ${errors.businessName ? "border-destructive" : "border-border"}`} />
      </Field>
      <Field id="t-email" label="Email" error={errors.email}>
        <input id="t-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={`${inputCls} ${errors.email ? "border-destructive" : "border-border"}`} />
      </Field>
      <Field id="t-phone" label="Mobile number" error={errors.phone}>
        <input id="t-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} className={`${inputCls} ${errors.phone ? "border-destructive" : "border-border"}`} />
      </Field>
      <label className="flex items-start gap-2.5 text-xs text-foreground/80 leading-relaxed">
        <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} className="mt-0.5 accent-primary" />
        Text me reminders. Msg and data rates may apply. Reply STOP to opt out.
      </label>
      {errors.form && <p className="text-sm text-destructive" role="alert">{errors.form}</p>}
      <button type="submit" disabled={sending} className="btn-gold w-full gap-2 py-4 disabled:opacity-60">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {selected.type === "instant" ? "Watch Now" : "Save My Seat"}
      </button>
      <p className="text-xs text-muted-foreground text-center">We respect your privacy. No spam, unsubscribe anytime.</p>
    </form>
  );
}
