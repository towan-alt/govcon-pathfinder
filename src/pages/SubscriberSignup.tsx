import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { SubscriberShell } from "@/components/subscriber/SubscriberShell";
import { PrefsPicker } from "@/components/subscriber/PrefsPicker";
import { useSubscriberAccount } from "@/hooks/useSubscriberAccount";
import { type Prefs, SUB_PRICE_ID, billingActive, sanitizePrefs, subCall } from "@/lib/subscriber";

const Steps = ({ step }: { step: number }) => (
  <ol className="flex gap-2 text-xs mb-8">
    {["Account", "Payment", "Preferences"].map((s, i) => (
      <li key={s} className={`flex-1 border-t-2 pt-2 ${i + 1 <= step ? "border-primary font-semibold" : "border-border text-muted-foreground"}`}>{i + 1}. {s}</li>
    ))}
  </ol>
);

const SubscriberSignup = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { session, authReady, billing, billingReady, loadBilling, options } = useSubscriberAccount();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState<Prefs>({ frequency: "weekly", naics_codes: [], keywords: [], min_ai_score: null });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const paid = billingActive(billing);

  // Already set up? Go to dashboard.
  useEffect(() => {
    if (!session || !paid) return;
    subCall({ action: "manage" }).then((r) => { if (r.subscription) nav("/subscriber/dashboard", { replace: true }); }).catch(() => {});
    if (!email && session.user.email) setEmail(session.user.email);
  }, [session, paid, nav, email]);

  useEffect(() => {
    if (params.get("checkout") !== "success" || !session) return;
    setMessage("Payment received. Activating your plan...");
    let tries = 0;
    const t = setInterval(async () => {
      tries++;
      const b = await loadBilling();
      if (billingActive(b) || tries > 15) { clearInterval(t); setMessage(billingActive(b) ? "Your plan is active. Choose your report preferences." : "Activation is taking longer than usual; refresh in a minute."); }
    }, 2000);
    return () => clearInterval(t);
  }, [params, session, loadBilling]);

  const auth = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null); setMessage(null);
    const r = mode === "signup"
      ? await supabase.auth.signUp({ email: authEmail, password, options: { emailRedirectTo: `${window.location.origin}/subscribe` } })
      : await supabase.auth.signInWithPassword({ email: authEmail, password });
    setPassword(""); setBusy(false);
    if (r.error) setError(r.error.message);
    else if (mode === "signup" && !r.data.session) setMessage("Check your inbox to confirm your email, then sign in to continue.");
  };

  const finish = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    try { await subCall({ action: "subscribe", email, ...sanitizePrefs(prefs, options), environment: getStripeEnvironment() }); nav("/subscriber/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save."); }
    finally { setBusy(false); }
  };

  const step = !session ? 1 : !paid ? 2 : 3;

  return (
    <SubscriberShell eyebrow="Opportunity Reports · $10/month" title="Create your subscriber account">
      <Steps step={step} />
      {message && <p role="status" className="flex items-start gap-2 border border-primary/40 bg-primary/10 p-4 text-sm mb-6"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />{message}</p>}
      {error && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive mb-6">{error}</p>}
      {!authReady ? null : step === 1 ? (
        <form onSubmit={auth} className="space-y-4 max-w-md">
          <p className="text-muted-foreground">SAM.gov opportunities matched to your NAICS codes and keywords, delivered daily or weekly.</p>
          <div><Label htmlFor="su-email">Email</Label><Input id="su-email" type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} /></div>
          <div><Label htmlFor="su-pass">Password</Label><Input id="su-pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="btn-gold px-8" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "signup" ? "Create account" : "Sign in"}</Button>
          <p className="text-sm text-muted-foreground">{mode === "signup" ? "Already a subscriber?" : "New here?"} <button type="button" className="underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>{mode === "signup" ? "Sign in" : "Create an account"}</button></p>
        </form>
      ) : !billingReady ? null : step === 2 ? (
        <div>
          <p className="text-muted-foreground mb-4">Signed in as {session!.user.email}. Start your $10/month plan. Cancel anytime.</p>
          {checkoutOpen
            ? <StripeEmbeddedCheckout priceId={SUB_PRICE_ID} returnUrl={`${window.location.origin}/subscribe?checkout=success&session_id={CHECKOUT_SESSION_ID}`} />
            : <Button className="btn-gold px-8" onClick={() => setCheckoutOpen(true)}><BellRing className="h-4 w-4" />Subscribe for $10/month</Button>}
        </div>
      ) : (
        <form onSubmit={finish} className="space-y-6">
          <div className="space-y-1.5"><Label htmlFor="email">Report email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <PrefsPicker prefs={prefs} onChange={setPrefs} options={options} disabled={busy} />
          <Button type="submit" className="btn-gold px-8" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Start my reports</Button>
        </form>
      )}
      <p className="text-sm text-muted-foreground mt-10">Already subscribed? <Link to="/subscriber/dashboard" className="underline">Go to your dashboard</Link></p>
    </SubscriberShell>
  );
};
export default SubscriberSignup;
