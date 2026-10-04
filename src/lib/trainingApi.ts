import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TrainingSessionType } from "@/lib/funnel";

export type TrainingReg = {
  id: string;
  first_name: string;
  session_type: TrainingSessionType;
  session_start: string;
  attended_at: string | null;
  max_progress_pct: number;
  cta_clicked_at: string | null;
};

export function useTrainingReg(id: string | null) {
  const [reg, setReg] = useState<TrainingReg | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">(id ? "loading" : "missing");
  useEffect(() => {
    if (!id) return setState("missing");
    supabase.functions.invoke("training", { body: { action: "get", id } }).then(({ data, error }) => {
      if (error || !data?.id) return setState("missing");
      setReg(data as TrainingReg);
      setState("ok");
    });
  }, [id]);
  return { reg, state };
}

export function trainingAction(body: Record<string, unknown>) {
  return supabase.functions.invoke("training", { body }).catch(() => null);
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function splitCountdown(ms: number) {
  const d = Math.max(0, ms);
  return { d: Math.floor(d / 86400000), h: Math.floor((d / 3600000) % 24), m: Math.floor((d / 60000) % 60), s: Math.floor((d / 1000) % 60) };
}
