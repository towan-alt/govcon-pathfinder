import { useEffect, useState } from "react";
import { Bot, CheckCircle2, Eye, EyeOff, Loader2, Pencil, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiStatusLabel, type ApiStatus } from "./SamGovApiTab";

export type AiSettings = {
  ai_scoring_enabled: boolean; ai_fit_threshold: number; ai_model: string; ai_max_per_run: number; ai_auto_scoring: boolean;
  ai_input_price_cents_per_mtok: number | null; ai_output_price_cents_per_mtok: number | null;
};

export async function callAi(action: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("samgov-ai", { body: { action, ...extra } });
  if (error) {
    let msg = "Request failed.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

const MODELS = [{ v: "claude-haiku-5-5", l: "Claude Haiku 5.5 (default, lower cost)" }, { v: "claude-sonnet-5-5", l: "Claude Sonnet 5.5" }];
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : "Never");

export function ClaudeAiSettings({ settings, saveSettings, profile, setProfile, keyStatus, setKeyStatus }: {
  settings: AiSettings; saveSettings: (p: Partial<AiSettings>) => Promise<void>;
  profile: string; setProfile: (s: string) => void; keyStatus: ApiStatus | null; setKeyStatus: (s: ApiStatus) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const [newKey, setNewKey] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(profile);
  useEffect(() => setDraft(settings), [settings]);

  const label = apiStatusLabel(keyStatus);
  const run = async (action: string, extra?: Record<string, unknown>) => {
    setBusy(action);
    try { const s = await callAi(action, extra); setKeyStatus(s); return s; }
    catch (e) { toast.error(e instanceof Error ? e.message : "Request failed."); return null; }
    finally { setBusy(null); }
  };

  const saveKey = async () => {
    const s = await run("save_key", { api_key: newKey });
    setNewKey(""); setShow(false);
    if (s) { setTest(null); toast.success("Anthropic API key saved."); }
  };

  const saveProfile = async () => {
    const t = text.trim();
    const { error } = await supabase.from("samgov_ai_profile").update({ profile_text: t, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return toast.error(error.message);
    setProfile(t); setEditing(false); toast.success("Capability profile saved.");
  };

  const price = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.round(Number(v))));

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 mt-1 text-primary" />
          <div>
            <h2 className="font-display text-xl font-bold">Claude AI Settings</h2>
            <p className="text-sm text-muted-foreground">Anthropic API key used to score filtered opportunities. The key is encrypted on the server and never shown again.</p>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <Badge variant={label === "Connected" ? "default" : label === "Failed" ? "destructive" : "outline"}>{label}</Badge>
          <p className="text-sm text-muted-foreground mt-2">
            {keyStatus?.configured ? `Key ending ${keyStatus.api_key_last4}. Last tested: ${fmt(keyStatus.last_tested_at)}` : "Setup required: add an Anthropic API key to enable Claude scoring."}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="anthropic-key">{keyStatus?.configured ? "Replace Anthropic API Key" : "Anthropic API Key"}</Label>
          <div className="relative">
            <Input id="anthropic-key" type={show ? "text" : "password"} autoComplete="off" spellCheck={false} value={newKey}
              onChange={(e) => setNewKey(e.target.value)} placeholder="sk-ant-..." className="pr-10 font-mono" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide key" : "Show key"}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveKey} disabled={!newKey.trim() || busy !== null}>{busy === "save_key" && <Loader2 className="h-4 w-4 animate-spin" />} {keyStatus?.configured ? "Replace Key" : "Save Key"}</Button>
          <Button variant="outline" disabled={!keyStatus?.configured || !keyStatus.is_active || busy !== null}
            onClick={async () => { const s = await run("test"); if (s) setTest({ ok: Boolean(s.ok), message: s.message }); }}>
            {busy === "test" && <Loader2 className="h-4 w-4 animate-spin" />} Test Connection
          </Button>
          {keyStatus?.configured && <Button variant="ghost" disabled={busy !== null} onClick={() => run(keyStatus.is_active ? "disable" : "enable")}>{keyStatus.is_active ? "Disable Key" : "Enable Key"}</Button>}
        </div>
        {test && (
          <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${test.ok ? "" : "border-destructive"}`}>
            {test.ok ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" /> : <XCircle className="h-5 w-5 text-destructive shrink-0" />}
            <p>{test.message}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-display text-xl font-bold">AI Settings</h2>
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-sm font-semibold">AI Fit Scoring Enabled</p><p className="text-xs text-muted-foreground">Only opportunities that pass the NAICS or keyword filter are ever sent to Claude.</p></div>
          <Switch checked={draft.ai_scoring_enabled} onCheckedChange={(v) => setDraft({ ...draft, ai_scoring_enabled: v })} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-sm font-semibold">Automatic Scoring</p><p className="text-xs text-muted-foreground">After a rule-based filter run on this page, automatically score eligible opportunities (within the per-run limit).</p></div>
          <Switch checked={draft.ai_auto_scoring} onCheckedChange={(v) => setDraft({ ...draft, ai_auto_scoring: v })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Claude Model</Label>
            <Select value={draft.ai_model} onValueChange={(v) => setDraft({ ...draft, ai_model: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MODELS.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-max">Max Opportunities per Run</Label>
            <Input id="ai-max" type="number" min={1} max={200} value={draft.ai_max_per_run}
              onChange={(e) => setDraft({ ...draft, ai_max_per_run: Math.min(200, Math.max(1, Number(e.target.value) || 1)) })} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Minimum Fit Score: {draft.ai_fit_threshold}/10</p>
          <Slider className="mt-4" min={1} max={10} step={1} value={[draft.ai_fit_threshold]} onValueChange={([v]) => setDraft({ ...draft, ai_fit_threshold: v })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="p-in">Input price (cents per 1M tokens, optional)</Label>
            <Input id="p-in" type="number" min={0} value={draft.ai_input_price_cents_per_mtok ?? ""} onChange={(e) => setDraft({ ...draft, ai_input_price_cents_per_mtok: price(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-out">Output price (cents per 1M tokens, optional)</Label>
            <Input id="p-out" type="number" min={0} value={draft.ai_output_price_cents_per_mtok ?? ""} onChange={(e) => setDraft({ ...draft, ai_output_price_cents_per_mtok: price(e.target.value) })} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Estimated cost is shown only when both prices are set. Otherwise only token usage is shown.</p>
        <Button onClick={() => saveSettings(draft)}>Save Settings</Button>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">IGS Capability Profile</h2>
          <Button variant="outline" onClick={() => { setText(profile); setEditing(true); }}><Pencil className="h-4 w-4" /> Edit Profile</Button>
        </div>
        <p className="text-xs text-muted-foreground">Included in every Claude evaluation. Editing it marks existing scores as outdated for the next batch.</p>
        <div className="border-l-4 border-primary pl-4 space-y-1.5 text-sm">
          {profile.split("\n").filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
        </div>
      </section>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Capability Profile</DialogTitle></DialogHeader>
          <Textarea rows={14} maxLength={8000} value={text} onChange={(e) => setText(e.target.value)} />
          <DialogFooter><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={saveProfile} disabled={!text.trim()}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
