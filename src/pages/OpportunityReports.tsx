import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BellRing, CheckCircle2, Loader2, Pause, Play, Settings2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Prefs = { frequency: "daily" | "weekly"; naics_codes: string[]; keywords: string[]; min_ai_score: number | null };
type Sub = Prefs & { email: string; status: string; verified: boolean; last_sent_at: string | null; created_at: string };

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("opportunity-subscribe", { body });
  if (error) {
    let msg = "Request failed. Please try again.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = typeof b.error === "string" ? b.error : msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

const parseList = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

const PrefsForm = ({ prefs, onChange, disabled }: { prefs: Prefs; onChange: (p: Prefs) => void; disabled?: boolean }) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <Label htmlFor="frequency">Report frequency</Label>
      <Select value={prefs.frequency} onValueChange={(v) => onChange({ ...prefs, frequency: v as Prefs["frequency"] })} disabled={disabled}>
        <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily - new matching opportunities each day</SelectItem>
          <SelectItem value="weekly">Weekly - consolidated report of the last 7 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="naics">NAICS codes (optional, comma separated)</Label>
      <Input id="naics" placeholder="e.g. 541611, 541512" defaultValue={prefs.naics_codes.join(", ")} disabled={disabled}
        onBlur={(e) => onChange({ ...prefs, naics_codes: parseList(e.target.value).filter((x) => /^\d{2,6}$/.test(x)) })} />
      <p className="text-xs text-muted-foreground">Leave blank to receive opportunities for every NAICS code.</p>
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="keywords">Keywords (optional, comma separated)</Label>
      <Input id="keywords" placeholder="e.g. cybersecurity, training, logistics" defaultValue={prefs.keywords.join(", ")} disabled={disabled}
        onBlur={(e) => onChange({ ...prefs, keywords: parseList(e.target.value) })} />
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="minscore">Minimum AI fit score (optional)</Label>
      <Select value={prefs.min_ai_score == null ? "any" : String(prefs.min_ai_score)} disabled={disabled}
        onValueChange={(v) => onChange({ ...prefs, min_ai_score: v === "any" ? null : Number(v) })}>
        <SelectTrigger id="minscore"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any score</SelectItem>
          {[5, 6, 7, 8, 9].map((n) => <SelectItem key={n} value={String(n)}>{n}+ / 10</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const OpportunityReports = () => {
  const [params] = useSearchParams();
  const verifyToken = params.get("verify");
  const manageToken = params.get("t");

  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState<Prefs>({ frequency: "weekly", naics_codes: [], keywords: [], min_ai_score: null });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);

  useEffect(() => {
    if (!verifyToken) return;
    setBusy(true);
    call({ action: "verify", token: verifyToken })
      .then((r) => setMessage(r.message))
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, [verifyToken]);

  const loadSub = useCallback(() => {
    if (!manageToken) return;
    setBusy(true);
    call({ action: "manage", token: manageToken })
      .then((r) => { setSub(r.subscription); setPrefs({ frequency: r.subscription.frequency, naics_codes: r.subscription.naics_codes, keywords: r.subscription.keywords, min_ai_score: r.subscription.min_ai_score }); })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, [manageToken]);
  useEffect(() => { loadSub(); }, [loadSub]);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null); setMessage(null);
    try { const r = await call({ action: "subscribe", email, ...prefs }); setMessage(r.message); }
    catch (err) { setError(err instanceof Error ? err.message : "Subscription failed."); }
    finally { setBusy(false); }
  };

  const manageAction = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true); setError(null); setMessage(null);
    try { const r = await call({ action, token: manageToken, ...extra }); setMessage(r.message); loadSub(); }
    catch (err) { setError(err instanceof Error ? err.message : "Request failed."); setBusy(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <p className="eyebrow text-xs mb-3">GoGovCon Opportunity Intelligence</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold !leading-[1.15] mb-4">
            {manageToken ? "Manage Your Opportunity Reports" : "Subscribe to Opportunity Reports"}
          </h1>

          {busy && <p className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><Loader2 className="h-4 w-4 animate-spin" />Working...</p>}
          {message && <p role="status" className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm mb-6"><CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />{message}</p>}
          {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive mb-6">{error}</p>}

          {verifyToken ? (
            <p className="text-sm text-muted-foreground">You can close this page, or manage your preferences from the link in any report email.</p>
          ) : manageToken && sub ? (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 text-sm space-y-1">
                <p><span className="text-muted-foreground">Email:</span> <span className="font-semibold">{sub.email}</span></p>
                <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold capitalize">{sub.status}</span>{!sub.verified && <span className="text-muted-foreground"> (email not confirmed yet)</span>}</p>
                <p><span className="text-muted-foreground">Last report sent:</span> <span className="font-semibold">{sub.last_sent_at ? new Date(sub.last_sent_at).toLocaleString() : "Not sent yet"}</span></p>
              </div>
              <PrefsForm prefs={prefs} onChange={setPrefs} disabled={busy} />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => manageAction("update", { prefs })} disabled={busy}><Settings2 className="h-4 w-4" />Save preferences</Button>
                {sub.status === "paused"
                  ? <Button variant="outline" onClick={() => manageAction("resume")} disabled={busy}><Play className="h-4 w-4" />Resume reports</Button>
                  : <Button variant="outline" onClick={() => manageAction("pause")} disabled={busy}><Pause className="h-4 w-4" />Pause reports</Button>}
                <Button variant="ghost" className="text-destructive" onClick={() => manageAction("unsubscribe")} disabled={busy}>Unsubscribe</Button>
              </div>
            </div>
          ) : manageToken ? null : (
            <>
              <p className="text-base text-muted-foreground leading-relaxed mb-8">
                Get federal contracting opportunities matched to your business delivered to your inbox,
                daily or weekly. Choose your NAICS codes, keywords and minimum AI fit score, and we will
                send only what matches, with deadlines and direct SAM.gov links.
              </p>
              <form onSubmit={subscribe} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" disabled={busy} />
                </div>
                <PrefsForm prefs={prefs} onChange={setPrefs} disabled={busy} />
                <Button type="submit" className="btn-gold w-full sm:w-auto px-8" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                  Subscribe
                </Button>
                <p className="text-xs text-muted-foreground">
                  We will email you a confirmation link before your subscription starts. Every report
                  includes manage and unsubscribe links.
                </p>
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
