import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FetchAndAnalyze } from "./FetchAndAnalyze";
import { OpportunityData } from "./OpportunityData";
import { DescriptionRetrieval } from "./DescriptionRetrieval";
import { RuleFiltering } from "./RuleFiltering";
import type { AiSettings } from "./ClaudeAiSettings";
import type { ApiStatus } from "./SamGovApiTab";

type Summary = { total: number; matched: number; scored: number; strong: number; lastFetch: string | null };

export function OpportunitiesTab({ active, apiStatus, settings, aiReady }: {
  active: boolean; apiStatus: ApiStatus | null; settings: AiSettings; aiReady: boolean;
}) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refilter, setRefilter] = useState(0);
  const [autoScore, setAutoScore] = useState(0);
  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    if (!active) return;
    let alive = true;
    const load = async () => {
      const base = () => supabase.from("samgov_opportunities").select("id", { count: "exact", head: true });
      const [total, matched, scored, strong, last] = await Promise.all([
        base(), base().eq("filter_status", "matched"), base().eq("ai_status", "scored"),
        base().eq("ai_status", "scored").eq("ai_category", "Strong Fit"),
        supabase.from("samgov_fetch_runs").select("completed_at").eq("status", "completed")
          .order("completed_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (!alive) return;
      if (total.error || matched.error || scored.error || strong.error || last.error) {
        toast.error("Could not refresh opportunity statistics."); return;
      }
      setSummary({ total: total.count ?? 0, matched: matched.count ?? 0, scored: scored.count ?? 0,
        strong: strong.count ?? 0, lastFetch: last.data?.completed_at ?? null });
    };
    void load();
    return () => { alive = false; };
  }, [active, refreshKey]);

  return (
    <div className="space-y-6">
      <FetchAndAnalyze onUpdated={refresh} lastSuccessfulFetch={summary?.lastFetch}>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[["Total Opportunities", summary?.total], ["Matched Opportunities", summary?.matched],
            ["AI Scored Opportunities", summary?.scored], ["Strong Fit Opportunities", summary?.strong]].map(([label, count]) => (
            <div key={label} className="border-l-2 border-primary pl-3 py-1">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-bold mt-1">{count == null ? "—" : count.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      </FetchAndAnalyze>
      <OpportunityData apiStatus={apiStatus} onFetched={refresh} onChanged={refresh} refreshKey={refreshKey}
        settings={settings} aiReady={aiReady} autoScoreTrigger={autoScore} />
      <Collapsible className="space-y-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="gap-2"><ChevronDown className="h-4 w-4" />Individual processing controls</Button>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount className="space-y-6 data-[state=closed]:hidden">
          <DescriptionRetrieval ready={Boolean(apiStatus?.configured && apiStatus.is_active)} refreshKey={refreshKey}
            onRefilter={() => setRefilter((key) => key + 1)} onChanged={refresh} />
          <RuleFiltering trigger={refilter} refreshKey={refreshKey} onFiltered={() => {
            refresh();
            if (settings.ai_auto_scoring && settings.ai_scoring_enabled) setAutoScore((key) => key + 1);
          }} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}