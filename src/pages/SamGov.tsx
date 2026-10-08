import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ChevronDown, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Naics = { id: string; code: string; description: string; category: string; active: boolean };
type Group = { id: string; name: string; active: boolean; sort_order: number };
type Keyword = { id: string; group_id: string; keyword: string; active: boolean };
type Settings = {
  ai_scoring_enabled: boolean; ai_fit_threshold: number; default_date_range: string; results_per_request: number;
  auto_pagination: boolean; match_title: boolean; match_description: boolean; match_additional_description: boolean;
  match_solicitation_information: boolean; case_insensitive: boolean; partial_phrase_matching: boolean;
};

const RANGES = [
  { v: "7", l: "Last 7 days" }, { v: "14", l: "Last 14 days" }, { v: "30", l: "Last 30 days" },
  { v: "60", l: "Last 60 days" }, { v: "90", l: "Last 90 days" }, { v: "custom", l: "Custom" },
];

const MATCH_FIELDS: { key: keyof Settings; label: string }[] = [
  { key: "match_title", label: "Opportunity Title" },
  { key: "match_description", label: "Opportunity Description" },
  { key: "match_additional_description", label: "Additional Description" },
  { key: "match_solicitation_information", label: "Solicitation Information" },
];

const FLOW = `                 SAM.gov Opportunity
                          │
                          ▼
              ┌─────────────────────┐
              │     NAICS MATCH     │
              └──────────┬──────────┘
                         │ OR
                         ▼
              ┌─────────────────────┐
              │    KEYWORD MATCH    │
              └──────────┬──────────┘
                         ▼
                     SEND TO AI
                         ▼
                 AI FIT SCORE 1–10
                         │
                    Score ≥ {T}
                         ▼
                 OPPORTUNITY DIGEST`;

/* ---------------- Sign-in gate ---------------- */

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/samgov` } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "up") toast.success("Check your inbox to confirm your email, then sign in.");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-7 shadow-sm">
        <h1 className="font-display text-2xl font-bold !leading-[1.2]">SAM.gov Opportunity Intelligence</h1>
        <p className="text-sm text-muted-foreground">Administrator sign-in</p>
        <div className="space-y-1.5"><Label htmlFor="sg-email">Email</Label><Input id="sg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="sg-pass">Password</Label><Input id="sg-pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "in" ? "Sign in" : "Create account"}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-xs text-muted-foreground underline w-full">
          {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- Main page ---------------- */

export default function SamGov() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session]);

  if (!authReady) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!session) return <SignIn />;
  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-2xl font-bold">Administrator access required</p>
        <p className="text-sm text-muted-foreground max-w-md">You're signed in as {session.user.email}, but this account has not been given administrator access yet.</p>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>
    );
  }
  return <Config email={session.user.email ?? ""} />;
}

function Config({ email }: { email: string }) {
  const [naics, setNaics] = useState<Naics[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [profile, setProfile] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [n, g, k, s, p] = await Promise.all([
      supabase.from("samgov_naics").select("*").order("code"),
      supabase.from("samgov_keyword_groups").select("*").order("sort_order"),
      supabase.from("samgov_keywords").select("*").order("created_at"),
      supabase.from("samgov_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("samgov_ai_profile").select("profile_text").eq("id", 1).maybeSingle(),
    ]);
    if (n.error || g.error || k.error || s.error) toast.error("Could not load configuration.");
    setNaics((n.data ?? []) as Naics[]);
    setGroups((g.data ?? []) as Group[]);
    setKeywords((k.data ?? []) as Keyword[]);
    setSettings((s.data ?? null) as Settings | null);
    setProfile(p.data?.profile_text ?? "");
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const saveSetting = async (patch: Partial<Settings>) => {
    if (!settings) return;
    const prev = settings;
    setSettings({ ...settings, ...patch });
    const { error } = await supabase.from("samgov_settings").update(patch).eq("id", 1);
    if (error) { setSettings(prev); toast.error(error.message); } else toast.success("Settings saved.");
  };

  const summary = useMemo(() => {
    const activeGroups = groups.filter((g) => g.active);
    const activeIds = new Set(activeGroups.map((g) => g.id));
    return {
      naics: naics.filter((n) => n.active).length,
      groups: activeGroups.length,
      keywords: keywords.filter((k) => k.active && activeIds.has(k.group_id)).length,
    };
  }, [naics, groups, keywords]);

  if (loading || !settings) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const rangeLabel = settings.default_date_range === "custom" ? "Custom" : `${settings.default_date_range} days`;

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold !leading-[1.2]">SAM.gov Opportunity Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage the criteria used to identify relevant federal contracting opportunities for IGS.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 py-1"><span className="h-2 w-2 rounded-full bg-primary" /> Filter Configuration: Active</Badge>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} title={email}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <Tabs defaultValue="naics">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="naics">NAICS Codes</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="ai">AI Scoring</TabsTrigger>
              <TabsTrigger value="search">Search Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="naics"><NaicsTab rows={naics} reload={load} /></TabsContent>
            <TabsContent value="keywords"><KeywordsTab groups={groups} keywords={keywords} reload={load} settings={settings} saveSetting={saveSetting} /></TabsContent>
            <TabsContent value="ai"><AiTab settings={settings} saveSetting={saveSetting} profile={profile} setProfile={setProfile} /></TabsContent>
            <TabsContent value="search"><SearchTab settings={settings} saveSetting={saveSetting} /></TabsContent>
          </Tabs>

          <section className="rounded-xl border bg-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl font-bold">Current Filtering Logic</h2>
              <Badge variant="secondary">Planned processing logic</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">The processing pipeline will be connected in a later phase. It will read these saved settings.</p>
            <pre className="mt-4 overflow-x-auto text-xs md:text-sm leading-snug font-mono text-foreground">{FLOW.replace("{T}", String(settings.ai_fit_threshold))}</pre>
          </section>
        </div>

        <aside className="rounded-xl border bg-card p-5 lg:sticky lg:top-6">
          <h2 className="font-display text-lg font-bold">Configuration Summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            {[
              ["Active NAICS codes", summary.naics],
              ["Active keyword groups", summary.groups],
              ["Active keywords", summary.keywords],
              ["AI scoring", settings.ai_scoring_enabled ? "Enabled" : "Disabled"],
              ["AI threshold", settings.ai_fit_threshold],
              ["Default search range", rangeLabel],
              ["Auto pagination", settings.auto_pagination ? "Enabled" : "Disabled"],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-3 border-b border-border pb-2 last:border-0">
                <dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </main>
    </div>
  );
}

/* ---------------- Shared confirm ---------------- */

function ConfirmDelete({ open, onOpenChange, label, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; label: string; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>This removes it permanently. To keep it for history, turn it off instead.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------------- NAICS tab ---------------- */

function NaicsTab({ rows, reload }: { rows: Naics[]; reload: () => Promise<void> }) {
  const [edit, setEdit] = useState<Partial<Naics> | null>(null);
  const [del, setDel] = useState<Naics | null>(null);
  const [err, setErr] = useState("");

  const save = async () => {
    if (!edit) return;
    const code = (edit.code ?? "").trim();
    if (!code) return setErr("NAICS code is required.");
    if (!/^\d{2,6}$/.test(code)) return setErr("NAICS code should contain numbers only (2 to 6 digits).");
    if (rows.some((r) => r.code === code && r.id !== edit.id)) return setErr("That NAICS code already exists.");
    const row = { code, description: (edit.description ?? "").trim(), category: (edit.category ?? "").trim(), active: edit.active ?? true };
    const { error } = edit.id
      ? await supabase.from("samgov_naics").update(row).eq("id", edit.id)
      : await supabase.from("samgov_naics").insert(row);
    if (error) return setErr(error.message);
    toast.success(edit.id ? "NAICS code updated successfully." : "NAICS code added successfully.");
    setEdit(null);
    await reload();
  };

  const toggle = async (r: Naics, active: boolean) => {
    const { error } = await supabase.from("samgov_naics").update({ active }).eq("id", r.id);
    if (error) toast.error(error.message); else { toast.success("Settings saved."); await reload(); }
  };

  const remove = async () => {
    if (!del) return;
    const { error } = await supabase.from("samgov_naics").delete().eq("id", del.id);
    setDel(null);
    if (error) toast.error(error.message); else { toast.success("Configuration deleted."); await reload(); }
  };

  return (
    <section className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">NAICS Codes</h2>
        <Button onClick={() => { setErr(""); setEdit({ active: true }); }}><Plus className="h-4 w-4" /> Add NAICS Code</Button>
      </div>
      <p className="rounded-md border-l-4 border-primary bg-secondary px-4 py-3 text-sm">
        Verify the final NAICS list against the IGS SAM.gov entity registration before go-live and add any registered codes not shown here.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow><TableHead>NAICS Code</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className={r.active ? "" : "opacity-60"}>
                <TableCell className="font-mono font-semibold">{r.code}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell><Switch checked={r.active} onCheckedChange={(v) => toggle(r, v)} aria-label={`Active ${r.code}`} /></TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${r.code}`} onClick={() => { setErr(""); setEdit(r); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${r.code}`} onClick={() => setDel(r)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(edit)} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Edit NAICS Code" : "Add NAICS Code"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="n-code">NAICS Code</Label><Input id="n-code" inputMode="numeric" maxLength={6} value={edit?.code ?? ""} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="n-desc">Description</Label><Input id="n-desc" maxLength={200} value={edit?.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="n-cat">Category</Label><Input id="n-cat" maxLength={80} value={edit?.category ?? ""} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></div>
            <div className="flex items-center gap-3"><Switch id="n-active" checked={edit?.active ?? true} onCheckedChange={(v) => setEdit({ ...edit, active: v })} /><Label htmlFor="n-active">Active</Label></div>
            {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDelete open={Boolean(del)} onOpenChange={(o) => !o && setDel(null)} label={`NAICS ${del?.code ?? ""}`} onConfirm={remove} />
    </section>
  );
}

/* ---------------- Keywords tab ---------------- */

function KeywordsTab({ groups, keywords, reload, settings, saveSetting }: {
  groups: Group[]; keywords: Keyword[]; reload: () => Promise<void>; settings: Settings; saveSetting: (p: Partial<Settings>) => Promise<void>;
}) {
  const [kwEdit, setKwEdit] = useState<{ id?: string; group_id: string; keyword: string } | null>(null);
  const [groupEdit, setGroupEdit] = useState<{ id?: string; name: string } | null>(null);
  const [del, setDel] = useState<{ kind: "keyword" | "group"; id: string; label: string } | null>(null);
  const [err, setErr] = useState("");

  const saveKw = async () => {
    if (!kwEdit) return;
    const keyword = kwEdit.keyword.trim();
    if (!keyword) return setErr("Keyword is required.");
    if (keywords.some((k) => k.group_id === kwEdit.group_id && k.keyword.toLowerCase() === keyword.toLowerCase() && k.id !== kwEdit.id)) return setErr("That keyword is already in this group.");
    const { error } = kwEdit.id
      ? await supabase.from("samgov_keywords").update({ keyword }).eq("id", kwEdit.id)
      : await supabase.from("samgov_keywords").insert({ group_id: kwEdit.group_id, keyword });
    if (error) return setErr(error.message);
    toast.success(kwEdit.id ? "Keyword updated successfully." : "Keyword added successfully.");
    setKwEdit(null);
    await reload();
  };

  const saveGroup = async () => {
    if (!groupEdit) return;
    const name = groupEdit.name.trim();
    if (!name) return setErr("Category name is required.");
    const { error } = groupEdit.id
      ? await supabase.from("samgov_keyword_groups").update({ name }).eq("id", groupEdit.id)
      : await supabase.from("samgov_keyword_groups").insert({ name, sort_order: groups.length + 1 });
    if (error) return setErr(error.message);
    toast.success(groupEdit.id ? "Keyword category renamed." : "Keyword category added.");
    setGroupEdit(null);
    await reload();
  };

  const toggle = async (table: "samgov_keywords" | "samgov_keyword_groups", id: string, active: boolean) => {
    const { error } = await supabase.from(table).update({ active }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Settings saved."); await reload(); }
  };

  const remove = async () => {
    if (!del) return;
    const { error } = await supabase.from(del.kind === "keyword" ? "samgov_keywords" : "samgov_keyword_groups").delete().eq("id", del.id);
    setDel(null);
    if (error) toast.error(error.message); else { toast.success("Configuration deleted."); await reload(); }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Keyword Groups</h2>
          <Button onClick={() => { setErr(""); setGroupEdit({ name: "" }); }}><Plus className="h-4 w-4" /> Add Keyword Category</Button>
        </div>
        <div className="space-y-3">
          {groups.map((g) => {
            const list = keywords.filter((k) => k.group_id === g.id);
            return (
              <Collapsible key={g.id} defaultOpen className={`rounded-lg border ${g.active ? "" : "opacity-60"}`}>
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left min-w-0 group">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=closed]:-rotate-90" />
                    <span className="font-semibold uppercase tracking-wide text-sm truncate">{g.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{list.length} keywords</span>
                  </CollapsibleTrigger>
                  <Switch checked={g.active} onCheckedChange={(v) => toggle("samgov_keyword_groups", g.id, v)} aria-label={`Active ${g.name}`} />
                  <Button variant="ghost" size="icon" aria-label={`Rename ${g.name}`} onClick={() => { setErr(""); setGroupEdit({ id: g.id, name: g.name }); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${g.name}`} onClick={() => setDel({ kind: "group", id: g.id, label: `the ${g.name} category and its keywords` })}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <CollapsibleContent className="border-t px-4 py-3 space-y-1.5">
                  {list.map((k) => (
                    <div key={k.id} className={`flex items-center gap-3 ${k.active ? "" : "opacity-60"}`}>
                      <Switch checked={k.active} onCheckedChange={(v) => toggle("samgov_keywords", k.id, v)} aria-label={`Active ${k.keyword}`} />
                      <span className="flex-1 text-sm">{k.keyword}</span>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${k.keyword}`} onClick={() => { setErr(""); setKwEdit({ id: k.id, group_id: g.id, keyword: k.keyword }); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${k.keyword}`} onClick={() => setDel({ kind: "keyword", id: k.id, label: `"${k.keyword}"` })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="text-right pt-1">
                    <Button variant="outline" size="sm" onClick={() => { setErr(""); setKwEdit({ group_id: g.id, keyword: "" }); }}><Plus className="h-4 w-4" /> Add Keyword</Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-display text-xl font-bold">Keyword Matching</h2>
        <div>
          <p className="text-sm font-semibold mb-2">Match against</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {MATCH_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <Checkbox checked={Boolean(settings[f.key])} onCheckedChange={(v) => saveSetting({ [f.key]: v === true })} /> {f.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <div><p className="text-sm font-semibold">Case insensitive matching</p><p className="text-xs text-muted-foreground">"public relations" matches "Public Relations" and "PUBLIC RELATIONS".</p></div>
          <Switch checked={settings.case_insensitive} onCheckedChange={(v) => saveSetting({ case_insensitive: v })} />
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <div><p className="text-sm font-semibold">Match partial phrases</p><p className="text-xs text-muted-foreground">Match keywords anywhere inside the opportunity text.</p></div>
          <Switch checked={settings.partial_phrase_matching} onCheckedChange={(v) => saveSetting({ partial_phrase_matching: v })} />
        </div>
      </section>

      <Dialog open={Boolean(kwEdit)} onOpenChange={(o) => !o && setKwEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{kwEdit?.id ? "Edit Keyword" : "Add Keyword"}</DialogTitle></DialogHeader>
          <div className="space-y-1.5"><Label htmlFor="kw">Keyword</Label><Input id="kw" maxLength={120} value={kwEdit?.keyword ?? ""} onChange={(e) => kwEdit && setKwEdit({ ...kwEdit, keyword: e.target.value })} /></div>
          {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
          <DialogFooter><Button variant="outline" onClick={() => setKwEdit(null)}>Cancel</Button><Button onClick={saveKw}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(groupEdit)} onOpenChange={(o) => !o && setGroupEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{groupEdit?.id ? "Rename Keyword Category" : "Add Keyword Category"}</DialogTitle></DialogHeader>
          <div className="space-y-1.5"><Label htmlFor="grp">Category name</Label><Input id="grp" maxLength={120} value={groupEdit?.name ?? ""} onChange={(e) => groupEdit && setGroupEdit({ ...groupEdit, name: e.target.value })} /></div>
          {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
          <DialogFooter><Button variant="outline" onClick={() => setGroupEdit(null)}>Cancel</Button><Button onClick={saveGroup}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDelete open={Boolean(del)} onOpenChange={(o) => !o && setDel(null)} label={del?.label ?? ""} onConfirm={remove} />
    </div>
  );
}

/* ---------------- AI tab ---------------- */

function AiTab({ settings, saveSetting, profile, setProfile }: {
  settings: Settings; saveSetting: (p: Partial<Settings>) => Promise<void>; profile: string; setProfile: (s: string) => void;
}) {
  const [draft, setDraft] = useState(settings.ai_fit_threshold);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(profile);
  useEffect(() => setDraft(settings.ai_fit_threshold), [settings.ai_fit_threshold]);

  const saveProfile = async () => {
    const { error } = await supabase.from("samgov_ai_profile").update({ profile_text: text.trim() }).eq("id", 1);
    if (error) return toast.error(error.message);
    setProfile(text.trim());
    setEditing(false);
    toast.success("Settings saved.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-display text-xl font-bold">AI Fit Scoring</h2>
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-sm font-semibold">AI Scoring Enabled</p><p className="text-xs text-muted-foreground">Controls whether opportunities that pass the NAICS or keyword filters are sent for AI scoring.</p></div>
          <Switch checked={settings.ai_scoring_enabled} onCheckedChange={(v) => saveSetting({ ai_scoring_enabled: v })} />
        </div>
        <div className="border-t pt-5">
          <p className="text-sm font-semibold">Minimum Fit Score</p>
          <Slider className="mt-4" min={1} max={10} step={1} value={[draft]} onValueChange={([v]) => setDraft(v)} onValueCommit={([v]) => saveSetting({ ai_fit_threshold: v })} />
          <div className="mt-3 grid grid-cols-10 text-center text-xs font-mono">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <span key={n} className={n === draft ? "font-bold text-foreground" : "text-muted-foreground"}>{n === draft ? `[${n}]` : n}</span>
            ))}
          </div>
          <p className="mt-3 text-sm">Opportunities scoring <strong>{draft}</strong> or higher will appear in the primary opportunity digest.</p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">IGS Capability Profile</h2>
          <Button variant="outline" onClick={() => { setText(profile); setEditing(true); }}><Pencil className="h-4 w-4" /> Edit Profile</Button>
        </div>
        <div className="border-l-4 border-primary pl-4 space-y-1.5 text-sm">
          {profile.split("\n").filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}
        </div>
      </section>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Capability Profile</DialogTitle></DialogHeader>
          <Textarea rows={12} maxLength={5000} value={text} onChange={(e) => setText(e.target.value)} />
          <DialogFooter><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={saveProfile}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- Search tab ---------------- */

function SearchTab({ settings, saveSetting }: { settings: Settings; saveSetting: (p: Partial<Settings>) => Promise<void> }) {
  const [perPage, setPerPage] = useState(String(settings.results_per_request));
  const [err, setErr] = useState("");
  const savePerPage = () => {
    const n = Number(perPage);
    if (!Number.isInteger(n) || n < 1 || n > 1000) return setErr("Enter a whole number from 1 to 1000.");
    setErr("");
    if (n !== settings.results_per_request) void saveSetting({ results_per_request: n });
  };
  return (
    <section className="rounded-xl border bg-card p-6 space-y-5">
      <h2 className="font-display text-xl font-bold">SAM.gov Search Settings</h2>
      <div className="space-y-1.5 max-w-xs">
        <Label>Default Date Range</Label>
        <Select value={settings.default_date_range} onValueChange={(v) => saveSetting({ default_date_range: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{RANGES.map((r) => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 border-t pt-5 max-w-xs">
        <Label htmlFor="per-page">Results Per API Request</Label>
        <Input id="per-page" type="number" min={1} max={1000} value={perPage} onChange={(e) => setPerPage(e.target.value)} onBlur={savePerPage} onKeyDown={(e) => e.key === "Enter" && savePerPage()} />
        {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
        <p className="text-xs text-muted-foreground">Used when requesting opportunities from the SAM.gov Public Contract Opportunities API. Maximum 1000.</p>
      </div>
      <div className="flex items-center justify-between gap-4 border-t pt-5">
        <div><p className="text-sm font-semibold">Automatic Pagination</p><p className="text-xs text-muted-foreground">Automatically retrieve additional pages when more opportunities are available.</p></div>
        <Switch checked={settings.auto_pagination} onCheckedChange={(v) => saveSetting({ auto_pagination: v })} />
      </div>
    </section>
  );
}
