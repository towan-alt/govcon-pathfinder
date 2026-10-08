import { useCallback, useEffect, useState } from "react";
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
};
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

export function OpportunityData({ apiStatus }: { apiStatus: ApiStatus | null }) {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [prog, setProg] = useState<Progress | null>(null);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<(Totals & { error_message?: string | null }) | null>(null);
  const [detail, setDetail] = useState<Opp | null>(null);

  const ready = Boolean(apiStatus?.configured && apiStatus.is_active);

  const loadOpps = useCallback(async () => {
    const { data } = await supabase.from("samgov_opportunities")
      .select("id,notice_id,solicitation_number,title,naics_code,posted_date,response_deadline,organization,active,type,type_of_set_aside_description,full_parent_path_name,description,ui_link,point_of_contact")
      .order("last_seen_at", { ascending: false }).order("posted_date", { ascending: false }).limit(25);
    setOpps((data ?? []) as unknown as Opp[]);
  }, []);
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
    void loadOpps();
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
        </div>
      )}

      <div>
        <h3 className="font-display text-lg font-bold mb-2">Recently Retrieved</h3>
        {opps.length === 0 ? <p className="text-sm text-muted-foreground">No opportunities retrieved yet.</p> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Opportunity</TableHead><TableHead>Notice ID</TableHead><TableHead>NAICS</TableHead>
                <TableHead>Posted</TableHead><TableHead>Deadline</TableHead><TableHead>Organization</TableHead><TableHead>Status</TableHead><TableHead />
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
                    <TableCell><Badge variant={o.active === "Yes" ? "default" : "outline"}>{o.active === "Yes" ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => setDetail(o)}>View Details</Button></TableCell>
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
            <div className="text-sm">
              <p className="text-muted-foreground">Description</p>
              <p>{detail.description && !/^https?:\/\//.test(detail.description) ? detail.description : "The full description is available on SAM.gov."}</p>
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
