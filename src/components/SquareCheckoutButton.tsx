import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SQUARE_PRODUCTS, type SquareProductKey } from "@/lib/funnel";

type Status = { configured: boolean; environment: "sandbox" | "production" } | null;
let statusPromise: Promise<Status> | null = null;

/** Fetches once per page load whether Square secrets are configured and which environment. */
export function getSquareStatus(): Promise<Status> {
  if (!statusPromise) {
    statusPromise = supabase.functions
      .invoke("square-checkout", { body: { action: "status" } })
      .then(({ data, error }) => (error || !data ? null : (data as Status)))
      .catch(() => null);
  }
  return statusPromise;
}

interface Props {
  product: SquareProductKey;
  email?: string;
  className?: string;
  children: ReactNode;
  onStart?: () => void;
  /** Known status (null = unknown). When not configured and no static link, the button is disabled. */
  status: Status | undefined;
}

export function SquareCheckoutButton({ product, email, className, children, onStart, status }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const staticLink = SQUARE_PRODUCTS[product].staticLink;
  const unavailable = status !== undefined && !status?.configured && !staticLink;

  const go = async () => {
    setError("");
    onStart?.();
    if (!status?.configured) {
      if (staticLink) window.location.href = staticLink;
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.functions.invoke("square-checkout", {
      body: { product, email, origin: window.location.origin },
    });
    if (!err && data?.url) {
      window.location.href = data.url as string;
      return;
    }
    if (!err && data?.configured === false && staticLink) {
      window.location.href = staticLink;
      return;
    }
    setLoading(false);
    setError("We couldn't open checkout. Please try again.");
  };

  if (unavailable) {
    return <button disabled className={`${className ?? ""} opacity-60 cursor-not-allowed`}>Checkout coming soon</button>;
  }

  return (
    <div className="w-full">
      <button onClick={go} disabled={loading || status === undefined} className={`${className ?? ""} disabled:opacity-70`}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening secure checkout…</> : children}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive text-center">
          {error}{" "}
          <button onClick={go} className="underline font-semibold">Retry</button>
        </p>
      )}
    </div>
  );
}

export function SandboxNote({ status }: { status: Status | undefined }) {
  if (!status?.configured || status.environment !== "sandbox") return null;
  return <p className="text-xs text-center text-muted-foreground">Sandbox mode: no real charges.</p>;
}
