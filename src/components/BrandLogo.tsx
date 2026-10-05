import { useState } from "react";
import { LOGO_ALT, LOGO_PATH } from "@/lib/funnel";
import { cn } from "@/lib/utils";

/**
 * Official gold Capitol GoGovCon logo. Black and gold art on transparent:
 * shown as-is on light grounds; on dark grounds always inside a white circle with a gold ring.
 */
export const BrandLogo = ({ width = 150, onDark = false, className }: { width?: number; onDark?: boolean; className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  const img = <img src={LOGO_PATH} alt={LOGO_ALT} width={width} style={{ width }} className="h-auto block" onError={() => setFailed(true)} />;
  if (!onDark) return <div className={className}>{img}</div>;
  const size = Math.round(width * 1.35);
  return (
    <div
      className={cn("rounded-full bg-background border-4 border-gold flex items-center justify-center overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      {img}
    </div>
  );
};

export default BrandLogo;
