import { splitCountdown } from "@/lib/trainingApi";

export default function CountdownBoxes({ ms }: { ms: number }) {
  const cd = splitCountdown(ms);
  const units = [
    ...(cd.d ? [{ v: cd.d, l: "Days" }] : []),
    { v: cd.h, l: "Hours" },
    { v: cd.m, l: "Min" },
    { v: cd.s, l: "Sec" },
  ];
  return (
    <div className="flex justify-center gap-3" aria-live="polite">
      {units.map((u) => (
        <div key={u.l} className="min-w-[4rem] rounded-lg border border-primary/40 px-3 py-2 text-center">
          <p className="font-display text-3xl font-bold text-primary tabular-nums">{String(u.v).padStart(2, "0")}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/70">{u.l}</p>
        </div>
      ))}
    </div>
  );
}
