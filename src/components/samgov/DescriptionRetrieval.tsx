import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Run = {
  id: string; mode: string; status: string; total: number; processed: number; fetched: number;
  unavailable: number; failed: number; retry_pending: number; error_message: string | null;
  started_at: string; completed_at: string | null;
};
type Counts = { total: number; fetched: number; pending: number; unavailable: number; failed: number };

async function call(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("samgov-descriptions", { body });
  if (error) {
    let msg = "Request failed.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

const STATUS: Record<string, string> = { running: "Running", completed: "Completed", completed_with_errors: "Completed with errors", stopped: "Stopped", failed: "Failed" };

export function DescriptionRetrieval({ ready, refreshKey, onRefilter, onChanged }: { ready: boolean; refreshKey: number; onRefilter: () => void; onChanged: () => void }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [lastRun, setLastRun] = useState<Run | null>(null);
  const [live, setLive] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const base = () => supabase.from("samgov_opportunities").select("id", { count: "exact", head: true });
    const n = (q: ReturnType<typeof base>) => q.then((r) => r.count ?? 0);
    const [total, fetched, pending, unavailable, failed, run] = await Promise.all([
      n(base()), n(base().eq("description_status", "fetched")), n(base().in("description_status", ["pending", "retry_pending"])),
      n(base().eq("description_status", "unavailable")), n(base().eq("description_status", "failed")),
      supabase.from("samgov_description_runs").select("*").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setCounts({ total, fetched, pending, unavailable, failed });
    setLastRun((run.data ?? null) as Run | null);
  }, []);
  useEffect(() => { void load(); }, [load, refreshKey]);

  const execute = async (mode: "missing" | "failed") => {
    setBusy(true);
    let run: Run | null = null; let failed = false;
    try {
      run = await call({ action: "start", mode });
      setLive(run);
      // Explicit continuation: each call processes one bounded batch server-side.
      for (let i = 0; i < 2000; i++) {
        const r = await call({ action: "batch", run_id: run!.id });
        setLive(r);
        if (r.fatal) toast.error(r.error_message);
        if (r.done) break;
      }
    } catch (e) {
      failed = true;
      toast.error(e instanceof Error ? e.message : "Description retrieval failed.");
    }
    if (run) {
      try {
        const fin: Run = await call({ action: "finish", run_id: run.id, failed });
        if (fin.status === "completed") toast.success(`Descriptions retrieved: ${fin.fetched}.`);
      } catch { /* visible on reload */ }
    }
    setLive(null); setBusy(false);
    await load(); onChanged();
  };

  const pct = live && live.total ? Math.min(100, Math.round((live.processed / live.total) * 100)) : 0;
  const Stat = ({ k, v }: { k: string; v: number }) => <div><p className="text-muted-foreground">{k}</p><p className="font-semibold">{v}</p></div>;

  return (
    <section className="rounded-xl border bg-card p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 mt-1 text-primary" />
          <div>
            <h2 className="font-display text-xl font-bold">Description Retrieval</h2>
            <p className="text-sm text-muted-foreground">Retrieve the full notice text from SAM.gov so keyword filtering can search it.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => execute("missing")} disabled={!ready || busy || !counts?.pending}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Fetch Missing Descriptions
          </Button>
          <Button variant="outline" onClick={() => execute("failed")} disabled={!ready || busy || !counts?.failed}>Retry Failed Descriptions</Button>
          <Button variant="outline" onClick={onRefilter} disabled={busy}>Re-filter After Retrieval</Button>
        </div>
      </div>

      {!ready && <p className="text-sm text-muted-foreground">Configure and enable a SAM.gov API key to retrieve descriptions.</p>}

      {live && (
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <p className="font-semibold">Retrieving descriptions</p>
          <Progress value={pct} />
          <p className="text-muted-foreground">{live.processed} of {live.total} processed · {live.fetched} fetched · {live.unavailable} unavailable · {live.failed} failed · {live.retry_pending} to retry</p>
        </div>
      )}

      {counts && (
        <div className="rounded-lg border p-4 text-sm space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Stat k="Total opportunities" v={counts.total} />
            <Stat k="Descriptions fetched" v={counts.fetched} />
            <Stat k="Descriptions pending" v={counts.pending} />
            <Stat k="Unavailable" v={counts.unavailable} />
            <Stat k="Failed requests" v={counts.failed} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3">
            <span><span className="text-muted-foreground">Last retrieval run: </span>{lastRun ? new Date(lastRun.completed_at ?? lastRun.started_at).toLocaleString() : "Never"}</span>
            {lastRun && <Badge variant={lastRun.status === "completed" ? "default" : lastRun.status === "running" ? "outline" : "destructive"}>{STATUS[lastRun.status] ?? lastRun.status}</Badge>}
          </div>
          {lastRun?.error_message && lastRun.status !== "completed" && <p className="text-destructive">{lastRun.error_message}</p>}
        </div>
      )}
    </section>
  );
}
