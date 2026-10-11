import { useCallback, useEffect, useState } from "react";
import { Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Run = {
  id: string; dry_run: boolean; status: string; total_opportunities: number; processed: number;
  naics_only: number; keyword_only: number; both_match: number; neither: number; incomplete: number; failed: number;
  error_message: string | null; started_at: string; completed_at: string | null; config_version: string;
};
type Counts = { total: number; naics: number; keyword: number; both: number; neither: number; incomplete: number; pending: number; failed: number };

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("samgov-filter", { body });
  if (error) {
    let msg = "Request failed.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

const STATUS: Record<string, string> = { running: "Running", completed: "Completed", completed_with_errors: "Completed with errors", failed: "Failed" };

export function RuleFiltering({ onFiltered, trigger = 0 }: { onFiltered?: () => void; trigger?: number }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [lastRun, setLastRun] = useState<Run | null>(null);
  const [live, setLive] = useState<Run | null>(null);
  const [dryResult, setDryResult] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const c = (q: ReturnType<typeof base>) => q.then((r) => r.count ?? 0);
    const base = () => supabase.from("samgov_opportunities").select("id", { count: "exact", head: true });
    const [total, naics, keyword, both, neither, incomplete, pending, failed, run] = await Promise.all([
      c(base()), c(base().eq("naics_match", true)), c(base().eq("keyword_match", true)),
      c(base().eq("naics_match", true).eq("keyword_match", true)), c(base().eq("filter_status", "not_matched")), c(base().eq("filter_status", "filter_incomplete")),
      c(base().eq("filter_status", "pending_filter")), c(base().eq("filter_status", "filter_failed")),
      supabase.from("samgov_filter_runs").select("*").eq("dry_run", false).order("started_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setCounts({ total, naics, keyword, both, neither, incomplete, pending, failed });
    setLastRun((run.data ?? null) as Run | null);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const execute = async (dry: boolean) => {
    setBusy(true); setDryResult(null);
    let run: Run | null = null; let failed = false;
    try {
      run = await call({ action: "start", dry_run: dry });
      setLive(run);
      let after: string | null = null;
      for (let i = 0; i < 1000; i++) {
        const r = await call({ action: "batch", run_id: run!.id, after_id: after });
        setLive(r);
        if (r.done || !r.next_after_id) break;
        after = r.next_after_id;
      }
    } catch (e) {
      failed = true;
      toast.error(e instanceof Error ? e.message : "Filtering failed.");
    }
    if (run) {
      try {
        const fin: Run = await call({ action: "finish", run_id: run.id, failed });
        if (dry) setDryResult(fin);
        if (!failed) toast.success(dry ? "Dry run complete. Saved results were not changed." : "Filter complete. Results saved.");
        if (fin.failed) toast.error(fin.error_message ?? "Some records failed.");
      } catch { /* status visible on next load */ }
    }
    setLive(null); setBusy(false);
    await load();
    if (!dry) onFiltered?.();
  };

  useEffect(() => {
    if (trigger > 0) void execute(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const pct = live && live.total_opportunities ? Math.min(100, Math.round((live.processed / live.total_opportunities) * 100)) : 0;
  const stale = lastRun && counts && counts.pending > 0;

  const Stat = ({ k, v }: { k: string; v: number | string }) => (
    <div><p className="text-muted-foreground">{k}</p><p className="font-semibold">{v}</p></div>
  );

  return (
    <section className="rounded-xl border bg-card p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Filter className="h-5 w-5 mt-1 text-primary" />
          <div>
            <h2 className="font-display text-xl font-bold">Rule-Based Filtering</h2>
            <p className="text-sm text-muted-foreground">An opportunity qualifies when it matches an active NAICS code OR an active keyword. Unmatched opportunities are kept.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => execute(true)} disabled={busy || !counts?.total}>Dry Run</Button>
          <Button onClick={() => execute(false)} disabled={busy || !counts?.total}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Run Filter
          </Button>
        </div>
      </div>

      {counts && counts.total === 0 && <p className="text-sm text-muted-foreground">Fetch opportunities first, then run the filter.</p>}
      {stale && <p className="text-sm text-muted-foreground">{counts!.pending} opportunities have not been filtered yet. Run Filter to process them. Rerun it any time you change NAICS codes, keywords or match settings.</p>}

      {live && (
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <p className="font-semibold">{live.dry_run ? "Dry run in progress" : "Filtering opportunities"}</p>
          <Progress value={pct} />
          <p className="text-muted-foreground">{live.processed} of {live.total_opportunities} processed ({pct}%)</p>
        </div>
      )}

      {counts && (
        <div className="rounded-lg border p-4 text-sm space-y-3">
          <p className="font-semibold">Saved results</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Stat k="Total opportunities" v={counts.total} />
            <Stat k="Matching NAICS" v={counts.naics} />
            <Stat k="Matching keywords" v={counts.keyword} />
            <Stat k="Matching both" v={counts.both} />
            <Stat k="Matching neither" v={counts.neither} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3">
            <span><span className="text-muted-foreground">Last run: </span>{lastRun ? new Date(lastRun.completed_at ?? lastRun.started_at).toLocaleString() : "Never"}</span>
            <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Status:</span>
              {lastRun ? <Badge variant={lastRun.status === "completed" ? "default" : lastRun.status === "running" ? "outline" : "destructive"}>{STATUS[lastRun.status] ?? lastRun.status}</Badge> : <Badge variant="outline">Not run</Badge>}
            </span>
            {counts.incomplete > 0 && <span>{counts.incomplete} incomplete (waiting on description retrieval)</span>}
            {counts.failed > 0 && <span className="text-destructive">{counts.failed} failed records</span>}
          </div>
          {lastRun?.error_message && lastRun.status !== "completed" && <p className="text-destructive">{lastRun.error_message}</p>}
        </div>
      )}

      {dryResult && (
        <div className="rounded-lg border border-dashed p-4 text-sm space-y-3">
          <p className="font-semibold">Dry run preview (nothing saved)</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Stat k="Evaluated" v={dryResult.processed} />
            <Stat k="Matching NAICS" v={dryResult.naics_only + dryResult.both_match} />
            <Stat k="Matching keywords" v={dryResult.keyword_only + dryResult.both_match} />
            <Stat k="Matching both" v={dryResult.both_match} />
            <Stat k="Matching neither" v={dryResult.neither} />
            <Stat k="Incomplete" v={dryResult.incomplete} />
          </div>
          {dryResult.failed > 0 && <p className="text-destructive">{dryResult.error_message}</p>}
        </div>
      )}
    </section>
  );
}
