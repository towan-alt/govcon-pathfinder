import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ApiStatus = {
  configured: boolean;
  api_key_last4?: string;
  is_active?: boolean;
  last_test_status?: "not_tested" | "success" | "failed";
  last_tested_at?: string | null;
};

export function apiStatusLabel(s: ApiStatus | null): string {
  if (!s || !s.configured) return "Not Configured";
  if (!s.is_active) return "Disabled";
  if (s.last_test_status === "success") return "Connected";
  if (s.last_test_status === "failed") return "Failed";
  return "Configured";
}

export async function callCreds(action: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("samgov-credentials", { body: { action, ...extra } });
  if (error) {
    let msg = "Request failed.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data as ApiStatus & { ok?: boolean };
}

const mask = (l4?: string) => `••••••••••••••••••••${l4 ?? ""}`;
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : "Never");

export function SamGovApiTab({ status, setStatus }: { status: ApiStatus | null; setStatus: (s: ApiStatus) => void }) {
  const [newKey, setNewKey] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const configured = Boolean(status?.configured);
  const label = apiStatusLabel(status);

  const run = async (action: string, extra?: Record<string, unknown>) => {
    setBusy(action);
    try {
      const s = await callCreds(action, extra);
      setStatus(s);
      return s;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed.");
      return null;
    } finally { setBusy(null); }
  };

  const save = async () => {
    const s = await run("save", { api_key: newKey });
    setNewKey(""); setShow(false);
    if (s) {
      setTestResult(null); setReplaceOpen(false); setConfirmReplace(false);
      toast.success(configured ? "New SAM.gov API key saved successfully." : "SAM.gov API key saved.");
    }
  };

  const test = async () => {
    const s = await run("test");
    if (s) setTestResult(Boolean(s.ok));
  };

  const statusText: Record<string, string> = {
    "Not Configured": "Add a SAM.gov API key to enable opportunity retrieval.",
    Configured: "API key has been securely stored.",
    Connected: `Last verified: ${fmt(status?.last_tested_at)}`,
    Failed: `Last tested: ${fmt(status?.last_tested_at)}`,
    Disabled: "Opportunity retrieval is stopped until the key is enabled again.",
  };

  const keyInput = (id: string, placeholder: string) => (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} autoComplete="off" spellCheck={false} value={newKey}
        onChange={(e) => setNewKey(e.target.value)} placeholder={placeholder} className="pr-10 font-mono" />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide key" : "Show key"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex items-start gap-3">
          <KeyRound className="h-5 w-5 mt-1 text-primary" />
          <div>
            <h2 className="font-display text-xl font-bold">SAM.gov Public API Configuration</h2>
            <p className="text-sm text-muted-foreground">Configure the SAM.gov Public API key used to retrieve federal contract opportunities.</p>
          </div>
        </div>

        <div className="rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge variant={label === "Connected" ? "default" : label === "Failed" ? "destructive" : "outline"}>{label}</Badge>
            <p className="text-sm text-muted-foreground mt-2">{statusText[label]}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="samgov-key">SAM.gov Public API Key</Label>
          {configured
            ? <Input id="samgov-key" readOnly value={mask(status?.api_key_last4)} className="font-mono" />
            : keyInput("samgov-key", "Enter SAM.gov public API key")}
        </div>

        <div className="flex flex-wrap gap-2">
          {configured ? (
            <Button onClick={() => { setNewKey(""); setReplaceOpen(true); }}>Replace API Key</Button>
          ) : (
            <Button onClick={save} disabled={!newKey.trim() || busy !== null}>
              {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />} Save API Key
            </Button>
          )}
          <Button variant="outline" onClick={test} disabled={!configured || !status?.is_active || busy !== null}>
            {busy === "test" && <Loader2 className="h-4 w-4 animate-spin" />} Test API Key
          </Button>
          {configured && (status?.is_active
            ? <Button variant="ghost" onClick={() => setConfirmDisable(true)} disabled={busy !== null}>Disable API Key</Button>
            : <Button variant="ghost" onClick={() => run("enable").then((s) => s && toast.success("SAM.gov API key enabled."))} disabled={busy !== null}>Enable API Key</Button>)}
        </div>

        {testResult === true && (
          <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <div><p className="font-semibold">API Key is valid</p><p className="text-muted-foreground">Successfully connected to SAM.gov.</p></div>
          </div>
        )}
        {testResult === false && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive p-3 text-sm">
            <XCircle className="h-5 w-5 text-destructive shrink-0" />
            <div><p className="font-semibold">API Key test failed</p><p className="text-muted-foreground">Unable to authenticate with SAM.gov. Please verify the API key.</p></div>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h3 className="font-display text-lg font-bold">Connection Details</h3>
        <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[
            ["API Provider", "SAM.gov"],
            ["API Type", "Public API, Contract Opportunities"],
            ["Status", label],
            ["Last Tested", fmt(status?.last_tested_at)],
            ["Key", configured ? mask(status?.api_key_last4).slice(-16) : "None"],
          ].map(([k, v]) => (
            <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold font-mono break-all">{v}</dd></div>
          ))}
        </dl>
      </section>

      <Dialog open={replaceOpen} onOpenChange={(o) => { setReplaceOpen(o); if (!o) { setNewKey(""); setShow(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace SAM.gov API Key</DialogTitle>
            <DialogDescription>Enter a new SAM.gov Public API Key. The existing key will remain active until the new key is successfully saved.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="samgov-new-key">New API Key</Label>
            {keyInput("samgov-new-key", "Enter new SAM.gov public API key")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplaceOpen(false)}>Cancel</Button>
            <Button onClick={() => setConfirmReplace(true)} disabled={!newKey.trim() || busy !== null}>Save New Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReplace} onOpenChange={setConfirmReplace}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Replace the existing SAM.gov API key?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={save}>Replace Key</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDisable} onOpenChange={setConfirmDisable}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable API Key</AlertDialogTitle>
            <AlertDialogDescription>Disable the SAM.gov API connection? Opportunity retrieval will stop until an API key is enabled again.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => run("disable").then((s) => s && toast.success("SAM.gov API key disabled."))}>Disable</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
