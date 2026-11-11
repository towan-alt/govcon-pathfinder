/** Dynamic opportunity status derived from the SAM.gov response deadline and active flag.
 *  Mirrors public.samgov_opp_status in the database so the dashboard shows live status
 *  even between hourly recomputes. */
export type OppStatus = "active" | "expired" | "inactive" | "unknown";

export function oppStatus(responseDeadline: string | null, samgovActive: string | null, now = Date.now()): OppStatus {
  if (samgovActive != null && samgovActive !== "Yes") return "inactive";
  if (!responseDeadline) return "unknown";
  const t = new Date(responseDeadline).getTime();
  if (isNaN(t)) return "unknown";
  return t > now ? "active" : "expired";
}

export const OPP_STATUS_LABEL: Record<OppStatus, string> = {
  active: "Active",
  expired: "Expired",
  inactive: "Inactive",
  unknown: "Unknown",
};

export const OPP_STATUS_VARIANT: Record<OppStatus, "default" | "outline" | "secondary" | "destructive"> = {
  active: "default",
  expired: "secondary",
  inactive: "outline",
  unknown: "outline",
};
