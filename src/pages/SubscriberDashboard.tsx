import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle2, Loader2, Pause, Play, Settings2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { SubscriberShell } from "@/components/subscriber/SubscriberShell";
import { PrefsPicker } from "@/components/subscriber/PrefsPicker";
import { useSubscriberAccount } from "@/hooks/useSubscriberAccount";
import { type Prefs, billingActive, sanitizePrefs, subCall } from "@/lib/subscriber";

type Sub = Prefs & { email: string; status: string; verified: boolean; last_sent_at: string | null; next_send_at: string; created_at: string };
type History = { id: string; report_type: string; status: string; created_at: string; sent_at: string | null };

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold capitalize mt-1">{value}</p></div>
);

const SubscriberDashboard = () => {
  const { session, authReady, billing, options } = useSubscriberAccount();
  const [sub, setSub] = useState<Sub | null | undefined>(undefined);
  const [history, setHistory] = useState<History[]>([]);
  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState<Prefs>({ frequency: "weekly", naics_codes: [], keywords: [], min_ai_score: null });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmUnsub, setConfirmUnsub] = useState(false);
  const paid = billingActive(billing);

  const load = useCallback(() => {
    if (!session) return;
    subCall({ action: "manage" }).then((r) => {
      setSub(r.subscription); setHistory(r.history ?? []);
      if (r.subscription) { setEmail(r.subscription.email); setPrefs({ frequency: r.subscription.frequency, naics_codes: r.subscription.naics_codes, keywords: r.subscription.keywords, min_ai_score: r.subscription.min_ai_score }); }
    }).catch((e) => { setError(e.message); setSub(null); });
  }, [session]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (options) setPrefs((p) => sanitizePrefs(p, options)); }, [options, sub]);

  const act = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true); setError(null); setMessage(null);
    try { const r = await subCall({ action, ...extra }); setMessage(r.message); setConfirmUnsub(false); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Request failed."); }
    finally { setBusy(false); }
  };

  const billingPortal = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("create-portal-session", { body: { returnUrl: window.location.href, environment: getStripeEnvironment() } });
    setBusy(false);
    if (error || !data?.url) setError("Could not open billing."); else window.open(data.url, "_blank");
  };

  if (authReady && !session) return <Navigate to="/subscribe" replace />;

  return (
    <SubscriberShell eyebrow="Subscriber Dashboard" title="Your Opportunity Reports">
      <div className="flex items-center justify-between gap-3 mb-6 text-sm">
        <span className="text-muted-foreground">{session?.user.email}</span>
        <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" />Sign out</Button>
      </div>
      {message && <p role="status" className="flex items-start gap-2 border border-primary/40 bg-primary/10 p-4 text-sm mb-6"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />{message}</p>}
      {error && <p role="alert" className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive mb-6">{error}</p>}

      {sub === undefined ? <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading...</p>
      : sub === null ? (
        <div className="border p-6"><p className="mb-4">You don't have report preferences yet.</p><Button asChild className="btn-gold"><Link to="/subscribe">Finish signup</Link></Button></div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-bold mb-3">Subscription status</h2>
            <div className="grid sm:grid-cols-4 gap-3">
              <Stat label="Reports" value={sub.verified ? sub.status : "Awaiting email confirmation"} />
              <Stat label="Plan" value={paid ? (billing?.cancel_at_period_end || billing?.status === "canceled" ? `Ends ${billing?.current_period_end ? new Date(billing.current_period_end).toLocaleDateString() : "soon"}` : "$10/month") : "Not active"} />
              <Stat label="Last report" value={sub.last_sent_at ? new Date(sub.last_sent_at).toLocaleDateString() : "Not sent yet"} />
              <Stat label="Next report" value={sub.status === "active" && paid ? new Date(sub.next_send_at).toLocaleDateString() : "On hold"} />
            </div>
            {billing && <Button variant="link" className="px-0 mt-2" onClick={billingPortal} disabled={busy}>Manage billing</Button>}
            {!paid && <Button asChild className="btn-gold mt-2"><Link to="/subscribe">Renew plan</Link></Button>}
          </section>

          <section className="space-y-6">
            <h2 className="font-display text-xl font-bold">Report preferences</h2>
            <div className="space-y-1.5"><Label htmlFor="email">Email address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} /><p className="text-xs text-muted-foreground">Changing it pauses reports until the new address is confirmed.</p></div>
            <PrefsPicker prefs={prefs} onChange={setPrefs} options={options} disabled={busy} />
            <Button onClick={() => act("update", { prefs: sanitizePrefs(prefs, options), email })} disabled={busy}><Settings2 className="h-4 w-4" />Save changes</Button>
          </section>

          <section className="border-t pt-6 flex flex-wrap gap-3">
            {sub.status === "paused"
              ? <Button variant="outline" onClick={() => act("resume")} disabled={busy}><Play className="h-4 w-4" />Resume reports</Button>
              : sub.status !== "unsubscribed" && <Button variant="outline" onClick={() => act("pause")} disabled={busy}><Pause className="h-4 w-4" />Pause reports</Button>}
            {sub.status !== "unsubscribed" && (confirmUnsub
              ? <><Button variant="destructive" onClick={() => act("unsubscribe")} disabled={busy}>Yes, unsubscribe</Button><Button variant="ghost" onClick={() => setConfirmUnsub(false)}>Cancel</Button></>
              : <Button variant="ghost" className="text-destructive" onClick={() => setConfirmUnsub(true)} disabled={busy}>Unsubscribe from email reports</Button>)}
            {sub.status === "unsubscribed" && <p className="text-sm text-muted-foreground">You're unsubscribed. Save your preferences above to restart, or resubscribe from signup.</p>}
          </section>
          <p className="text-xs text-muted-foreground -mt-6">Unsubscribing stops emails only. Cancel billing separately under Manage billing.</p>

          {history.length > 0 && <section className="border-t pt-6"><h2 className="font-semibold mb-3">Recent reports</h2><ul className="divide-y">{history.map((h) => <li key={h.id} className="py-3 text-sm flex justify-between"><span className="capitalize">{h.report_type} · {h.status}</span><span className="text-muted-foreground">{new Date(h.sent_at ?? h.created_at).toLocaleDateString()}</span></li>)}</ul></section>}
        </div>
      )}
    </SubscriberShell>
  );
};
export default SubscriberDashboard;
