import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Run = {
  id: string; status: string; stage: string; fetched: number; new_opportunities: number; descriptions_fetched: number;
  matched: number; ai_scored: number; ai_skipped: number; ai_failed: number; warnings: string[];
  error_message: string | null; started_at: string; completed_at: string | null;
};

const STAGES = [
  { key: "fetch", label: "Fetching opportunities" },
  { key: "descriptions", label: "Retrieving descriptions" },
  { key: "filter", label: "Applying filters" },
  { key: "ai", label: "Running Claude AI analysis" },
  { key: "done", label: "Saving results" },
];

async function call(body: Record<string, unknown>): Promise<{ run: Run | null }> {
  const { data, error } = await supabase.functions.invoke("samgov-pipeline", { body });
  if (error) {
    let msg = "Request failed.";
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}

export function FetchAndAnalyze({ onUpdated }: { onUpdated: () => void }) {
  const [run, setRun] = useState<Run | null>(null);
  const [starting, setStarting] = useState(false);
  const prevStatus = useRef<string | null>(null);
  const running = run?.status === "running";

  const apply = useCallback((r: Run | null) => {
    setRun(r);
    if (r && prevStatus.current === "running" && r.status !== "running") {
      onUpdated();
      if (r.status === "failed") toast.error(r.error_message ?? "Fetch & Analyze failed.");
      else toast.success("Fetch & Analyze completed.");
    }
    prevStatus.current = r?.status ?? null;
  }, [onUpdated]);

  useEffect(() => { call({ action: "status" }).then((d) => apply(d.run)).catch(() => {}); }, [apply]);

  // While open, the page advances the run itself; the background runner continues if the page closes.
  useEffect(() => {
    if (!running) return;
    let alive = true;
    const loop = async () => {
      while (alive) {
        try { const d = await call({ action: "tick" }); if (!alive) return; apply(d.run); if (d.run?.status !== "running") return; }
        catch { /* background runner keeps going */ }
        await new Promise((r) => setTimeout(r, 3000));
      }
    };
    loop();
    return () => { alive = false; };
  }, [running, apply]);

  const start = async () => {
    setStarting(true);
    try { const d = await call({ action: "start" }); prevStatus.current = "running"; setRun(d.run); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not start."); }
    finally { setStarting(false); }
  };

  const idx = run ? STAGES.findIndex((s) => s.key === run.stage) : -1;
  const finished = run && run.status !== "running";

  return (
    <section className="rounded-xl border-2 border-primary bg-card p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Fetch & Analyze Opportunities</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">One click runs the full workflow: SAM.gov fetch, full descriptions, NAICS/keyword filtering and Claude AI fit scoring. It keeps running if you leave this page.</p>
        </div>
        <Button size="lg" onClick={start} disabled={running || starting} className="gap-2">
          {running || starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {running || starting ? "Processing..." : "Fetch & Analyze Opportunities"}
        </Button>
      </div>

      {run && (
        <>
          <ol className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
            {[...STAGES, { key: "completed", label: "Completed" }].map((s, i) => {
              const done = finished ? run.status !== "failed" || i < idx : i < idx;
              const active = running && i === idx;
              const failedHere = run.status === "failed" && i === idx;
              return (
                <li key={s.key} className={`flex items-center gap-2 rounded-md border px-3 py-2 ${active ? "border-primary" : ""}`}>
                  {failedHere ? <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    : active ? <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                    : done ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <span className={done || active ? "" : "text-muted-foreground"}>{s.label}</span>
                </li>
              );
            })}
          </ol>

          <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
            {[
              ["Fetched", run.fetched], ["New", run.new_opportunities], ["Descriptions", run.descriptions_fetched],
              ["Matched", run.matched], ["AI scored", run.ai_scored], ["AI failed", run.ai_failed],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md bg-muted px-3 py-2"><dt className="text-muted-foreground text-xs">{k}</dt><dd className="font-bold text-lg">{v}</dd></div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">Skipped (already scored and unchanged, or over the per-run AI limit): {run.ai_skipped}</p>

          {run.error_message && <p className="text-sm text-destructive">{run.error_message}</p>}
          {run.warnings.length > 0 && (
            <ul className="text-sm space-y-1">{run.warnings.map((w) => <li key={w} className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0 text-accent-foreground" />{w}</li>)}</ul>
          )}

          {finished && (
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={run.status === "failed" ? "destructive" : "outline"}>{run.status === "completed" ? "Completed" : run.status === "failed" ? "Failed" : "Completed with warnings"}</Badge>
              <Button variant="outline" size="sm" onClick={() => { onUpdated(); setTimeout(() => document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" }), 300); }}>View Opportunities</Button>
              <span className="text-xs text-muted-foreground">Last run {new Date(run.started_at).toLocaleString()}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
