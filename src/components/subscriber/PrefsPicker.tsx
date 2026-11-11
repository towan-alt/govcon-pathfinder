import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Prefs, SubOptions } from "@/lib/subscriber";

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export const PrefsPicker = ({ prefs, onChange, options, disabled }: { prefs: Prefs; onChange: (p: Prefs) => void; options: SubOptions | null; disabled?: boolean }) => (
  <div className="space-y-6">
    <div className="space-y-1.5">
      <Label htmlFor="frequency">Report frequency</Label>
      <Select value={prefs.frequency} onValueChange={(v) => onChange({ ...prefs, frequency: v as Prefs["frequency"] })} disabled={disabled}>
        <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium mb-1">NAICS codes</legend>
      <p className="text-xs text-muted-foreground">Leave all unchecked to receive every listed code.</p>
      {!options ? <p className="text-sm text-muted-foreground">Loading...</p> : options.naics.length === 0 ? <p className="text-sm text-muted-foreground">No NAICS codes are available yet.</p> : (
        <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto border p-3">
          {options.naics.map((n) => (
            <label key={n.code} className="flex items-start gap-2 text-sm cursor-pointer">
              <Checkbox checked={prefs.naics_codes.includes(n.code)} disabled={disabled} onCheckedChange={() => onChange({ ...prefs, naics_codes: toggle(prefs.naics_codes, n.code) })} />
              <span><span className="font-semibold">{n.code}</span> <span className="text-muted-foreground">{n.description}</span></span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium mb-1">Keywords</legend>
      {!options ? null : options.keywords.length === 0 ? <p className="text-sm text-muted-foreground">No keywords are available yet.</p> : (
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto border p-3">
          {options.keywords.map((k) => {
            const on = prefs.keywords.some((x) => x.toLowerCase() === k.keyword.toLowerCase());
            return (
              <button key={k.keyword} type="button" disabled={disabled} title={k.group} aria-pressed={on}
                onClick={() => onChange({ ...prefs, keywords: on ? prefs.keywords.filter((x) => x.toLowerCase() !== k.keyword.toLowerCase()) : [...prefs.keywords, k.keyword] })}
                className={`border px-3 py-1 text-xs transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                {k.keyword}
              </button>
            );
          })}
        </div>
      )}
    </fieldset>
    {options?.ai_enabled && (
      <div className="space-y-1.5">
        <Label htmlFor="minscore">Minimum AI fit score</Label>
        <Select value={prefs.min_ai_score == null ? "any" : String(prefs.min_ai_score)} disabled={disabled} onValueChange={(v) => onChange({ ...prefs, min_ai_score: v === "any" ? null : Number(v) })}>
          <SelectTrigger id="minscore"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any score</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <SelectItem key={n} value={String(n)}>{n}+ / 10</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    )}
  </div>
);
