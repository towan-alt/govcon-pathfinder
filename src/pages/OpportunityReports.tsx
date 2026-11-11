import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BellRing, CheckCircle2, Loader2, Pause, Play, Settings2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { oppStatus } from "@/lib/opp-status";
import { getStripeEnvironment } from "@/lib/stripe";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PrefsPicker } from "@/components/subscriber/PrefsPicker";
import { type SubOptions, sanitizePrefs } from "@/lib/subscriber";

const PRICE_ID = "opportunity_reports_monthly";
type Billing = { status: string; current_period_end: string | null; cancel_at_period_end: boolean | null } | null;
const billingActive = (b: Billing) => !!b && ((["active", "trialing", "past_due"].includes(b.status) && (!b.current_period_end || new Date(b.current_period_end) > new Date())) || (b.status === "canceled" && !!b.current_period_end && new Date(b.current_period_end) > new Date()));

type Prefs = { frequency: "daily" | "weekly"; naics_codes: string[]; keywords: string[]; min_ai_score: number | null };
type Sub = Prefs & { email: string; status: string; verified: boolean; last_sent_at: string | null; created_at: string; next_send_at: string };
type History = { id: string; report_type: string; status: string; created_at: string; sent_at: string | null; attempts: number };
type Opportunity = { title: string; organization: string; notice_id: string; solicitation_number: string | null; naics_code: string; type_of_set_aside_description: string | null; posted_date: string; response_deadline: string | null; active: string | null; ai_score: number | null; description_text: string | null; ui_link: string | null };

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("opportunity-subscribe", { body });
  if (error) {
    let msg = "Request failed. Please try again.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = typeof b.error === "string" ? b.error : msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

const PlanCard = () => (
  <div className="border border-primary/50 p-5">
    <p className="eyebrow text-xs mb-1">Opportunity Reports</p>
    <p className="font-display text-3xl font-bold !leading-[1.1]">$10<span className="text-base font-normal text-muted-foreground">/month</span></p>
    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
      <li>Daily or weekly SAM.gov opportunity reports</li>
      <li>Matched to your NAICS codes and keywords</li>
      <li>Pause, change or cancel anytime</li>
    </ul>
  </div>
);

const OpportunityReports = () => {
  const [params] = useSearchParams();
  const verifyToken = params.get("verify");
  const manageToken = params.get("t");
  const opportunityId = params.get("opportunity");
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [options, setOptions] = useState<SubOptions | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);

  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState<Prefs>({ frequency: "weekly", naics_codes: [], keywords: [], min_ai_score: null });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [billing, setBilling] = useState<Billing>(null);
  const [billingReady, setBillingReady] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const paid = billingActive(billing);

  const loadBilling = useCallback(async () => {
    if (!session) { setBilling(null); setBillingReady(true); return null; }
    let env: "sandbox" | "live";
    try { env = getStripeEnvironment(); } catch { setBillingReady(true); return null; }
    const { data } = await supabase.from("subscriptions").select("status,current_period_end,cancel_at_period_end").eq("user_id", session.user.id).eq("environment", env).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setBilling(data); setBillingReady(true); return data;
  }, [session]);
  useEffect(() => { loadBilling(); }, [loadBilling]);
  useEffect(() => {
    if (params.get("checkout") !== "success" || !session) return;
    setMessage("Payment received. Activating your subscription...");
    let tries = 0;
    const t = setInterval(async () => {
      tries++;
      const b = await loadBilling();
      if (billingActive(b) || tries > 15) { clearInterval(t); setMessage(billingActive(b) ? "Your $10/month plan is active. Choose your report preferences below." : "Payment received. Activation is taking longer than usual; refresh in a minute."); }
    }, 2000);
    return () => clearInterval(t);
  }, [params, session, loadBilling]);

  const openBillingPortal = async () => {
    setBusy(true); setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", { body: { returnUrl: window.location.href, environment: getStripeEnvironment() } });
      if (error || !data?.url) throw new Error("Could not open billing.");
      window.open(data.url, "_blank");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not open billing."); }
    finally { setBusy(false); }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null); setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email: authEmail, password, options: { emailRedirectTo: `${window.location.origin}/opportunity-reports` } });
    setPassword(""); setBusy(false);
    if (error) setError(error.message);
    else if (!data.session) setMessage("Check your inbox to confirm your email, then come back and sign in to subscribe.");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    call({ action: "options" }).then((r) => { setAiEnabled(r.ai_enabled); setOptions(r); }).catch(() => {});
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!manageToken || !opportunityId) return;
    call({ action: "opportunity", token: manageToken, id: opportunityId }).then((r) => setOpportunity(r.opportunity)).catch((e) => setError(e.message));
  }, [manageToken, opportunityId]);

  useEffect(() => {
    if (!verifyToken) return;
    setBusy(true);
    call({ action: "verify", token: verifyToken })
      .then((r) => setMessage(r.message))
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, [verifyToken]);

  const loadSub = useCallback(() => {
    if (!manageToken && !session) return;
    setBusy(true);
    call({ action: "manage", token: manageToken })
      .then((r) => { setSub(r.subscription); setHistory(r.history ?? []); if (r.subscription) { setEmail(r.subscription.email); setPrefs({ frequency: r.subscription.frequency, naics_codes: r.subscription.naics_codes, keywords: r.subscription.keywords, min_ai_score: r.subscription.min_ai_score }); } else if (session?.user.email) setEmail(session.user.email); })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, [manageToken, session]);
  useEffect(() => { loadSub(); }, [loadSub]);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try { const r = await call({ action: "subscribe", email, ...sanitizePrefs(prefs, options), environment: getStripeEnvironment() }); setMessage(r.message); if (session) loadSub(); }
    catch (err) { setError(err instanceof Error ? err.message : "Subscription failed."); }
    finally { setBusy(false); }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
    setPassword(""); setBusy(false);
    if (error) setError(error.message); else setAuthOpen(false);
  };

  const manageAction = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true); setError(null); setMessage(null);
    try { const r = await call({ action, token: manageToken, ...extra }); setMessage(r.message); loadSub(); }
    catch (err) { setError(err instanceof Error ? err.message : "Request failed."); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PaymentTestModeBanner />
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <p className="eyebrow text-xs mb-3">GoGovCon Opportunity Intelligence</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold !leading-[1.15] mb-4">
            {opportunityId ? "Opportunity Details" : sub || manageToken ? "Manage Your Opportunity Reports" : "Subscribe to Opportunity Reports"}
          </h1>

          {busy && <p className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><Loader2 className="h-4 w-4 animate-spin" />Working...</p>}
          {message && <p role="status" className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm mb-6"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />{message}</p>}
          {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive mb-6">{error}</p>}

          {!manageToken && !verifyToken && authReady && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {session ? <><span className="text-sm text-muted-foreground">{session.user.email}</span><Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button></> : <Button variant="outline" onClick={() => setAuthOpen(!authOpen)}>Sign in to manage reports</Button>}
            </div>
          )}
          {authOpen && !session && <form onSubmit={signIn} className="mb-8 space-y-4 border-b pb-6">
            <div><Label htmlFor="auth-email">Account email</Label><Input id="auth-email" type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} /></div>
            <div><Label htmlFor="auth-pass">Password</Label><Input id="auth-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" disabled={busy}>Sign in</Button>
          </form>}
          {opportunityId ? opportunity && (
            <article className="space-y-4">
              <h2 className="font-display text-2xl font-bold !leading-[1.2]">{opportunity.title}</h2>
              <p>{opportunity.organization}</p>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                {[["Notice ID", opportunity.notice_id], ["Solicitation", opportunity.solicitation_number], ["NAICS", opportunity.naics_code], ["Set-aside", opportunity.type_of_set_aside_description], ["Posted", opportunity.posted_date], ["Response deadline", opportunity.response_deadline ? new Date(opportunity.response_deadline).toLocaleString() : "Not listed"], ["Status", oppStatus(opportunity.response_deadline, opportunity.active)], ["AI fit", opportunity.ai_score == null ? "Not scored" : `${opportunity.ai_score}/10`]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-medium break-words">{value ?? "Not listed"}</dd></div>)}
              </dl>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{opportunity.description_text ?? "Description not available."}</p>
              {opportunity.ui_link && /^https:\/\/(www\.)?sam\.gov\//.test(opportunity.ui_link) && <Button asChild><a href={opportunity.ui_link} target="_blank" rel="noopener noreferrer">View on SAM.gov</a></Button>}
              <Button asChild variant="outline"><a href={`?t=${manageToken}`}>Manage reports</a></Button>
            </article>
          ) : verifyToken ? (
            <p className="text-sm text-muted-foreground">You can close this page, or manage your preferences from the link in any report email.</p>
          ) : sub ? (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 text-sm space-y-1">
                <p><span className="text-muted-foreground">Email:</span> <span className="font-semibold">{sub.email}</span></p>
                <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold capitalize">{sub.status}</span>{!sub.verified && <span className="text-muted-foreground"> (email not confirmed yet)</span>}</p>
                {session && <p><span className="text-muted-foreground">Plan:</span> <span className="font-semibold">{paid ? `$10/month${billing?.cancel_at_period_end || billing?.status === "canceled" ? `, ends ${billing?.current_period_end ? new Date(billing.current_period_end).toLocaleDateString() : "soon"}` : ""}` : "No active plan, reports are on hold"}</span>{billing && <Button variant="link" size="sm" className="h-auto p-0 ml-2" onClick={openBillingPortal}>Manage billing</Button>}</p>}
                <p><span className="text-muted-foreground">Last report sent:</span> <span className="font-semibold">{sub.last_sent_at ? new Date(sub.last_sent_at).toLocaleString() : "Not sent yet"}</span></p>
              </div>
              {params.get("unsubscribe") === "1" && <p className="text-sm">Confirm below to stop receiving opportunity reports.</p>}
              <div className="space-y-1.5"><Label htmlFor="manage-email">Email address</Label><Input id="manage-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} /></div>
              <p className="text-sm text-muted-foreground">Next report: {sub.status === "active" ? new Date(sub.next_send_at).toLocaleString() : "Paused until subscription is active"}</p>
              <PrefsPicker prefs={prefs} onChange={setPrefs} disabled={busy} options={options} />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => manageAction("update", { prefs: sanitizePrefs(prefs, options), email })} disabled={busy}><Settings2 className="h-4 w-4" />Save preferences</Button>
                {sub.status === "paused"
                  ? <Button variant="outline" onClick={() => manageAction("resume")} disabled={busy}><Play className="h-4 w-4" />Resume reports</Button>
                  : <Button variant="outline" onClick={() => manageAction("pause")} disabled={busy}><Pause className="h-4 w-4" />Pause reports</Button>}
                <Button variant="ghost" className="text-destructive" onClick={() => manageAction("unsubscribe")} disabled={busy}>Unsubscribe</Button>
              </div>
              {history.length > 0 && <section className="border-t pt-6"><h2 className="font-semibold mb-3">Recent reports</h2><ul className="divide-y">{history.map((h) => <li key={h.id} className="py-3 text-sm flex justify-between gap-3"><span className="capitalize">{h.report_type} · {h.status}{h.status === "failed" ? " (retry scheduled)" : ""}</span><span className="text-muted-foreground">{new Date(h.sent_at ?? h.created_at).toLocaleDateString()}</span></li>)}</ul></section>}
            </div>
          ) : manageToken ? null : !session ? (
            <>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                Get federal contracting opportunities matched to your business delivered to your inbox,
                daily or weekly, for $10/month. Create an account to get started.
              </p>
              <PlanCard />
              <form onSubmit={authMode === "signup" ? signUp : signIn} className="space-y-4 mt-6">
                <div><Label htmlFor="su-email">Email</Label><Input id="su-email" type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} /></div>
                <div><Label htmlFor="su-pass">Password</Label><Input id="su-pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button type="submit" className="btn-gold w-full sm:w-auto px-8" disabled={busy}>{authMode === "signup" ? "Create account" : "Sign in"}</Button>
                <p className="text-sm text-muted-foreground">{authMode === "signup" ? "Already have an account?" : "New here?"} <button type="button" className="underline" onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}>{authMode === "signup" ? "Sign in" : "Create an account"}</button></p>
              </form>
            </>
          ) : !billingReady ? null : !paid ? (
            <>
              <PlanCard />
              {checkoutOpen
                ? <div className="mt-6"><StripeEmbeddedCheckout priceId={PRICE_ID} returnUrl={`${window.location.origin}/opportunity-reports?checkout=success&session_id={CHECKOUT_SESSION_ID}`} /></div>
                : <Button className="btn-gold mt-6 px-8" onClick={() => setCheckoutOpen(true)}><BellRing className="h-4 w-4" />Subscribe for $10/month</Button>}
            </>
          ) : (
            <>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                Your $10/month plan is active. Choose your NAICS codes, keywords and minimum AI fit score,
                and we will send only what matches, with deadlines and opportunity details.
              </p>
              <form onSubmit={subscribe} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" disabled={busy} />
                </div>
                <PrefsPicker prefs={prefs} onChange={setPrefs} disabled={busy} options={options} />
                <Button type="submit" className="btn-gold w-full sm:w-auto px-8" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                  Start my reports
                </Button>
                <p className="text-xs text-muted-foreground">Every report includes manage and unsubscribe links. Cancel billing anytime.</p>
              </form>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default OpportunityReports;
