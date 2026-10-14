import { useCallback, useEffect, useState } from "react";
import { callAi, type AiSettings } from "./ClaudeAiSettings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ApiStatus } from "./SamGovApiTab";

type Poc = { type: string | null; full_name: string | null; email: string | null; phone: string | null };
type Opp = {
  id: string; notice_id: string; solicitation_number: string | null; title: string | null; naics_code: string | null;
  posted_date: string | null; response_deadline: string | null; organization: string | null; active: string | null;
  type: string | null; type_of_set_aside_description: string | null; full_parent_path_name: string | null;
  description: string | null; ui_link: string | null; point_of_contact: Poc[] | null;
  filter_status: string; naics_match: boolean | null; matched_naics_code: string | null; keyword_match: boolean | null;
  matched_keywords: string[]; matched_keyword_groups: string[]; filter_error: string | null;
  description_status: string; description_text: string | null; description_error: string | null; keyword_match_fields: Record<string, string[]> | null;
  ai_status: string; ai_score: number | null; ai_category: string | null; ai_error: string | null; ai_model: string | null;
  ai_scored_at: string | null; ai_limited_info: boolean | null;
  ai_analysis: { rationale: string; strengths: string[]; risks: string[]; recommended_action: string; confidence: string; usage?: { input_tokens: number; output_tokens: number } } | null;
};
const AI_LABEL: Record<string, string> = { not_scored: "Not Scored", pending: "Pending", scored: "Scored", failed: "Failed" };
type Batch = { total: number; done: number; scored: number; failed: number; input_tokens: number; output_tokens: number; stopped?: string | null; running: boolean };
let lastAutoTrigger = 0;
type Totals = { total_api_requests: number; total_records_received: number; new_opportunities: number; updated_opportunities: number; duplicate_records: number; error_count: number };
type Progress = Totals & { from: string; to: string; total: number; done: number; current: string };

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("samgov-fetch", { body });
  if (error) {
    let msg = "Request failed.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

const day = (d: string | null) => (d ? new Date(d.length === 10 ? d + "T12:00:00" : d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "None");
const ZERO: Totals = { total_api_requests: 0, total_records_received: 0, new_opportunities: 0, updated_opportunities: 0, duplicate_records: 0, error_count: 0 };
const FILTER_LABEL: Record<string, string> = { pending_filter: "Pending filter", matched: "Matched", not_matched: "Not matched", filter_incomplete: "Incomplete", filter_failed: "Filter failed" };
const DESC_LABEL: Record<string, string> = { pending: "Description pending", retry_pending: "Retry pending", fetched: "Description fetched", unavailable: "No description", failed: "Description failed" };
const FIELD_LABEL: Record<string, string> = { title: "title", description: "description", additional_description: "additional description", solicitation_number: "solicitation number", notice_type: "notice type", set_aside: "set-aside", classification_code: "classification code", agency: "agency" };
const inDescription = (o: Opp) => Object.values(o.keyword_match_fields ?? {}).some((f) => f.includes("description"));

export function OpportunityData({ apiStatus, onFetched, settings, aiReady, autoScoreTrigger = 0 }: {
  apiStatus: ApiStatus | null; onFetched?: () => void; settings: AiSettings; aiReady: boolean; autoScoreTrigger?: number;
}) {
  const [minScore, setMinScore] = useState("any");
  const [category, setCategory] = useState("any");
  const [sort, setSort] = useState<"recent" | "score">("recent");
  const [scoring, setScoring] = useState<string | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const aiUsable = aiReady && settings.ai_scoring_enabled;
  const [opps, setOpps] = useState<Opp[]>([]);
  const [prog, setProg] = useState<Progress | null>(null);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<(Totals & { error_message?: string | null }) | null>(null);
  const [detail, setDetail] = useState<Opp | null>(null);

  const ready = Boolean(apiStatus?.configured && apiStatus.is_active);

  const loadOpps = useCallback(async () => {
    let q = supabase.from("samgov_opportunities")
      .select("id,notice_id,solicitation_number,title,naics_code,posted_date,response_deadline,organization,active,type,type_of_set_aside_description,full_parent_path_name,description,ui_link,point_of_contact,filter_status,naics_match,matched_naics_code,keyword_match,matched_keywords,matched_keyword_groups,filter_error,description_status,description_text,description_error,keyword_match_fields,ai_status,ai_score,ai_category,ai_error,ai_model,ai_scored_at,ai_limited_info,ai_analysis");
    if (minScore !== "any") q = q.gte("ai_score", Number(minScore));
    if (category !== "any") q = q.eq("ai_category", category);
    q = sort === "score" ? q.order("ai_score", { ascending: false, nullsFirst: false }).order("last_seen_at", { ascending: false })
      : q.order("last_seen_at", { ascending: false }).order("posted_date", { ascending: false });
    const { data } = await q.limit(50);
    const rows = (data ?? []) as unknown as Opp[];
    setOpps(rows);
    setDetail((d) => (d ? rows.find((r) => r.id === d.id) ?? d : d));
  }, [minScore, category, sort]);

  const scoreOne = async (o: Opp) => {
    setScoring(o.id);
    try { const r = await callAi("score_one", { id: o.id }); toast.success(`Scored ${r.score}/10.`); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Scoring failed."); }
    finally { setScoring(null); void loadOpps(); }
  };

  const scoreBatch = useCallback(async (force = false) => {
    let runId: string | null = null;
    try {
      const start = await callAi("batch_start", { force });
      if (!start.run_id) { toast.info("No eligible opportunities need scoring."); return; }
      runId = start.run_id;
      const ids: string[] = start.ids;
      const b: Batch = { total: ids.length, done: 0, scored: 0, failed: 0, input_tokens: 0, output_tokens: 0, running: true };
      setBatch({ ...b });
      for (const id of ids) {
        const r = await callAi("batch_step", { run_id: runId, id }).catch((e) => ({ ok: false, error: e.message, stop: true }));
        b.done++; if (r.ok) b.scored++; else b.failed++;
        b.input_tokens += r.input_tokens ?? 0; b.output_tokens += r.output_tokens ?? 0;
        if (r.stop) { b.stopped = r.error; setBatch({ ...b }); break; }
        setBatch({ ...b });
      }
      if (!b.stopped) await callAi("batch_finish", { run_id: runId }).catch(() => {});
      setBatch({ ...b, running: false });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Batch scoring failed.");
      setBatch((x) => (x ? { ...x, running: false } : x));
    } finally { void loadOpps(); }
  }, [loadOpps]);

  useEffect(() => {
    if (autoScoreTrigger > lastAutoTrigger && aiUsable) { lastAutoTrigger = autoScoreTrigger; void scoreBatch(false); }
  }, [autoScoreTrigger, aiUsable, scoreBatch]);

  const cost = (i: number, o: number) => settings.ai_input_price_cents_per_mtok != null && settings.ai_output_price_cents_per_mtok != null
    ? `, est. $${((i * settings.ai_input_price_cents_per_mtok + o * settings.ai_output_price_cents_per_mtok) / 1e6 / 100).toFixed(4)}` : "";
  useEffect(() => { void loadOpps(); }, [loadOpps]);

  const fetchAll = async () => {
    setRunning(true); setSummary(null);
    let runId: string | null = null;
    let failed = false; let lastMsg: string | null = null;
    try {
      const start = await call({ action: "start" });
      runId = start.run_id;
      const codes: { code: string; description: string }[] = start.naics;
      let totals: Totals = { ...ZERO };
      setProg({ ...totals, from: start.date_from, to: start.date_to, total: codes.length, done: 0, current: "" });
      for (let i = 0; i < codes.length; i++) {
        const c = codes[i];
        setProg((p) => p && { ...p, current: `${c.code}${c.description ? ` (${c.description})` : ""}` });
        const r = await call({ action: "naics", run_id: runId, code: c.code });
        totals = { ...ZERO, ...Object.fromEntries(Object.keys(ZERO).map((k) => [k, r[k]])) } as Totals;
        if (r.message) lastMsg = r.message;
        setProg((p) => p && { ...p, ...totals, done: i + 1 });
        if (r.fatal) { failed = true; toast.error(r.message); break; }
      }
    } catch (e) {
      failed = true; lastMsg = e instanceof Error ? e.message : "Fetch failed.";
      toast.error(lastMsg);
    }
    if (runId) {
      try {
        const fin = await call({ action: "finish", run_id: runId, failed });
        setSummary({ ...fin, error_message: fin.error_message ?? lastMsg });
        if (fin.status === "completed") toast.success("Fetch complete.");
      } catch { /* run stays visible as running */ }
    }
    setRunning(false); setProg(null);
    void loadOpps(); onFetched?.();
  };

  const pct = prog && prog.total ? Math.round((prog.done / prog.total) * 100) : 0;

  return (
    <section className="rounded-xl border bg-card p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 mt-1 text-primary" />
          <div>
            <h2 className="font-display text-xl font-bold">Opportunity Data</h2>
            <p className="text-sm text-muted-foreground">Retrieve recent federal contract opportunities from SAM.gov using the configured API connection.</p>
          </div>
        </div>
        <Button onClick={fetchAll} disabled={!ready || running}>
          {running && <Loader2 className="h-4 w-4 animate-spin" />} Fetch Opportunities
        </Button>
      </div>

      {!ready && <p className="text-sm text-muted-foreground">{apiStatus?.configured ? "The SAM.gov API key is disabled. Enable it in the SAM.gov API tab to fetch opportunities." : "Configure a SAM.gov API key before fetching opportunities."}</p>}
      {ready && apiStatus?.last_test_status === "not_tested" && <p className="text-sm text-muted-foreground">Your SAM.gov API key has not been verified yet. You can test it in the SAM.gov API tab first.</p>}

      {prog && (
        <div className="rounded-lg border p-4 space-y-3 text-sm">
          <p className="font-semibold">Fetching SAM.gov Opportunities</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><p className="text-muted-foreground">Date Range</p><p className="font-semibold">{day(prog.from)} to {day(prog.to)}</p></div>
            <div><p className="text-muted-foreground">NAICS Codes</p><p className="font-semibold">{prog.total} active</p></div>
          </div>
          <Progress value={pct} />
          <p className="text-muted-foreground">{pct}% · Current NAICS: <span className="text-foreground font-semibold">{prog.current}</span></p>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-muted-foreground">API Requests</p><p className="font-semibold">{prog.total_api_requests}</p></div>
            <div><p className="text-muted-foreground">Records Retrieved</p><p className="font-semibold">{prog.total_records_received}</p></div>
            <div><p className="text-muted-foreground">New Opportunities</p><p className="font-semibold">{prog.new_opportunities}</p></div>
          </div>
        </div>
      )}

      {summary && (
        <div className="rounded-lg border p-4 text-sm space-y-2">
          <p className="font-semibold">{summary.error_count ? "Fetch Complete with Errors" : "Fetch Complete"}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[["Records Retrieved", summary.total_records_received], ["New Opportunities", summary.new_opportunities], ["Updated Opportunities", summary.updated_opportunities], ["Duplicates Skipped", summary.duplicate_records], ["Errors", summary.error_count]].map(([k, v]) => (
              <div key={k}><p className="text-muted-foreground">{k}</p><p className="font-semibold">{v}</p></div>
            ))}
          </div>
          {summary.error_message && <p className="text-destructive">{summary.error_message}</p>}
          {summary.new_opportunities > 0 && <p className="text-muted-foreground">New opportunities need their full descriptions. Use Fetch Missing Descriptions below, then re-filter.</p>}
        </div>
      )}

      <div className="rounded-lg border p-4 space-y-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Claude AI Fit Scoring</p>
            <p className="text-muted-foreground">{!aiReady ? "Setup required: add and enable an Anthropic API key in Claude AI Settings." : !settings.ai_scoring_enabled ? "AI fit scoring is disabled in Claude AI Settings." : `Scores up to ${settings.ai_max_per_run} matched opportunities per run with ${settings.ai_model}. Unchanged scored records are skipped.`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => scoreBatch(false)} disabled={!aiUsable || Boolean(batch?.running) || scoring !== null}>{batch?.running && <Loader2 className="h-4 w-4 animate-spin" />} Score Eligible Opportunities</Button>
            <Button variant="outline" onClick={() => scoreBatch(true)} disabled={!aiUsable || Boolean(batch?.running) || scoring !== null}>Rescore All Matched</Button>
          </div>
        </div>
        {batch && (<>
          <Progress value={batch.total ? Math.round((batch.done / batch.total) * 100) : 0} />
          <p className="text-muted-foreground">{batch.done}/{batch.total} processed · {batch.scored} scored · {batch.failed} failed · {batch.input_tokens.toLocaleString()} input / {batch.output_tokens.toLocaleString()} output tokens{cost(batch.input_tokens, batch.output_tokens)}</p>
          {batch.stopped && <p className="text-destructive">Stopped: {batch.stopped}</p>}
        </>)}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
          <h3 className="font-display text-lg font-bold">Opportunities</h3>
          <div className="flex flex-wrap gap-2">
            <Select value={minScore} onValueChange={setMinScore}>
              <SelectTrigger className="w-40" aria-label="Minimum fit score"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="any">Any fit score</SelectItem>{[9, 8, 7, 6, 5, 4, 3].map((n) => <SelectItem key={n} value={String(n)}>{n}+ / 10</SelectItem>)}</SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40" aria-label="Fit category"><SelectValue /></SelectTrigger>
              <SelectContent>{["any", "Strong Fit", "Moderate Fit", "Low Fit"].map((c) => <SelectItem key={c} value={c}>{c === "any" ? "Any category" : c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as "recent" | "score")}>
              <SelectTrigger className="w-44" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="recent">Most recent</SelectItem><SelectItem value="score">Highest AI fit score</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        {opps.length === 0 ? <p className="text-sm text-muted-foreground">No opportunities retrieved yet.</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Opportunity</TableHead><TableHead>Notice ID</TableHead><TableHead>NAICS</TableHead>
                <TableHead>Posted</TableHead><TableHead>Deadline</TableHead><TableHead>Organization</TableHead><TableHead>AI Fit Score</TableHead><TableHead>Status</TableHead><TableHead />
              </TableRow></TableHeader>
              <TableBody>
                {opps.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="max-w-[260px] font-medium">{o.title}</TableCell>
                    <TableCell className="font-mono text-xs">{o.notice_id.slice(0, 10)}…</TableCell>
                    <TableCell>{o.naics_code}</TableCell>
                    <TableCell className="whitespace-nowrap">{day(o.posted_date)}</TableCell>
                    <TableCell className="whitespace-nowrap">{day(o.response_deadline)}</TableCell>
                    <TableCell className="max-w-[200px]">{o.organization}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {o.ai_score != null ? <p className="font-semibold">{o.ai_score}/10</p> : <p className="text-muted-foreground">None</p>}
                      {o.ai_category && <p className="text-xs">{o.ai_category}</p>}
                      <Badge variant={o.ai_status === "failed" ? "destructive" : o.ai_status === "scored" ? "default" : "outline"} className="mt-1">{AI_LABEL[o.ai_status] ?? o.ai_status}</Badge>
                      {o.ai_score != null && o.ai_score < settings.ai_fit_threshold && <p className="text-xs text-muted-foreground">Below threshold</p>}
                    </TableCell>
                    <TableCell className="space-y-1">
                      <Badge variant={o.active === "Yes" ? "default" : "outline"}>{o.active === "Yes" ? "Active" : "Inactive"}</Badge>
                      <Badge variant={o.filter_status === "matched" ? "default" : o.filter_status === "filter_failed" ? "destructive" : "outline"} className="block w-fit">{FILTER_LABEL[o.filter_status] ?? o.filter_status}</Badge>
                      <Badge variant={o.description_status === "failed" ? "destructive" : "secondary"} className="block w-fit">{DESC_LABEL[o.description_status] ?? o.description_status}</Badge>
                      {o.keyword_match && <p className="text-xs text-muted-foreground max-w-[180px]">{o.matched_keywords.join(", ")}{inDescription(o) ? " (in description)" : ""}</p>}
                    </TableCell>
                    <TableCell className="space-y-1">
                      <Button size="sm" variant="outline" onClick={() => setDetail(o)}>View Details</Button>
                      {o.filter_status === "matched" && (
                        <Button size="sm" variant="ghost" className="block" disabled={!aiUsable || scoring !== null || Boolean(batch?.running)} onClick={() => scoreOne(o)}>
                          {scoring === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : o.ai_status === "scored" ? "Rescore" : "Score with Claude"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (<>
            <DialogHeader><DialogTitle>{detail.title}</DialogTitle></DialogHeader>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Notice ID", detail.notice_id], ["Solicitation Number", detail.solicitation_number ?? "None"],
                ["NAICS", detail.naics_code ?? "None"], ["Posted Date", day(detail.posted_date)],
                ["Response Deadline", detail.response_deadline ? new Date(detail.response_deadline).toLocaleString() : "None"],
                ["Opportunity Type", detail.type ?? "None"], ["Set Aside", detail.type_of_set_aside_description ?? "None"],
                ["Organization", detail.full_parent_path_name ?? detail.organization ?? "None"],
              ].map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold break-words">{v}</dd></div>)}
            </dl>
            <div className="text-sm rounded-lg border p-3 space-y-1">
              <p className="text-muted-foreground">Filter result: <span className="text-foreground font-semibold">{FILTER_LABEL[detail.filter_status] ?? detail.filter_status}</span></p>
              {detail.filter_status === "pending_filter" ? <p>Not filtered yet.</p> : detail.filter_status === "filter_failed" ? <p className="text-destructive">Could not evaluate this record ({detail.filter_error}).</p> : (<>
                <p>NAICS: {detail.naics_match ? `matched ${detail.matched_naics_code}` : "no match"}</p>
                <p>Keywords: {detail.keyword_match ? detail.matched_keywords.map((k) => `${k} [${(detail.keyword_match_fields?.[k] ?? []).map((f) => FIELD_LABEL[f] ?? f).join(", ")}]`).join("; ") : "no match"}</p>
                {detail.keyword_match && <p className="text-muted-foreground">Groups: {detail.matched_keyword_groups.join(", ")}</p>}
                {detail.filter_status === "filter_incomplete" && <p>Waiting on the full description before this can be confirmed as not matched.</p>}
              </>)}
            </div>
            <div className="text-sm rounded-lg border p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">AI Fit Analysis</p>
                {detail.filter_status === "matched" && <Button size="sm" variant="outline" disabled={!aiUsable || scoring !== null} onClick={() => scoreOne(detail)}>{scoring === detail.id && <Loader2 className="h-4 w-4 animate-spin" />}{detail.ai_status === "scored" ? "Rescore" : "Score with Claude"}</Button>}
              </div>
              {detail.ai_status === "scored" && detail.ai_analysis ? (<>
                <p><span className="text-2xl font-bold">{detail.ai_score}/10</span> <Badge className="ml-2">{detail.ai_category}</Badge> <span className="ml-2 text-muted-foreground">Confidence: {detail.ai_analysis.confidence}</span></p>
                {detail.ai_limited_info && <p className="text-muted-foreground">Based on limited information: the full description was not available.</p>}
                <p className="whitespace-pre-line">{detail.ai_analysis.rationale}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><p className="text-muted-foreground">Key Strengths</p><ul className="list-disc pl-5">{detail.ai_analysis.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
                  <div><p className="text-muted-foreground">Potential Risks</p><ul className="list-disc pl-5">{detail.ai_analysis.risks.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
                </div>
                <p><span className="text-muted-foreground">Recommended action:</span> {detail.ai_analysis.recommended_action}</p>
                <p className="text-xs text-muted-foreground">Model: {detail.ai_model} · Last evaluated: {detail.ai_scored_at ? new Date(detail.ai_scored_at).toLocaleString() : "Never"}{detail.ai_analysis.usage ? ` · ${detail.ai_analysis.usage.input_tokens} in / ${detail.ai_analysis.usage.output_tokens} out tokens${cost(detail.ai_analysis.usage.input_tokens, detail.ai_analysis.usage.output_tokens)}` : ""}</p>
              </>) : detail.ai_status === "failed" ? <p className="text-destructive">Scoring failed: {detail.ai_error}</p>
                : detail.ai_status === "pending" ? <p>Scoring in progress.</p>
                : <p className="text-muted-foreground">{detail.filter_status === "matched" ? "Not scored yet." : "Only opportunities that pass the NAICS or keyword filter are scored."}</p>}
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Full Description <span className="ml-1">({DESC_LABEL[detail.description_status] ?? detail.description_status})</span></p>
              {detail.description_status === "fetched" && detail.description_text
                ? <div className="mt-1 max-h-80 overflow-y-auto rounded border p-3 whitespace-pre-line break-words">{detail.description_text}</div>
                : <p>{detail.description_status === "unavailable" ? `The full description is unavailable${detail.description_error ? ` (${detail.description_error})` : ""}.` : detail.description_status === "failed" ? `Retrieval failed: ${detail.description_error ?? "unknown error"}. Use Retry Failed Descriptions.` : "Not retrieved yet. Use Fetch Missing Descriptions."}</p>}
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Point of Contact</p>
              {detail.point_of_contact?.length ? detail.point_of_contact.map((p, i) => (
                <p key={i}><span className="font-semibold">{p.full_name ?? "Name not listed"}</span>{p.email && <> · <a className="underline" href={`mailto:${p.email}`}>{p.email}</a></>}{p.phone && <> · {p.phone}</>}</p>
              )) : <p>No point of contact listed.</p>}
            </div>
            {detail.ui_link && <Button asChild variant="outline"><a href={detail.ui_link} target="_blank" rel="noopener noreferrer">Open on SAM.gov</a></Button>}
          </>)}
        </DialogContent>
      </Dialog>
    </section>
  );
}
