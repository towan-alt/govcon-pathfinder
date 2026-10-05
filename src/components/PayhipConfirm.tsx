import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLead, type PayhipProductKey } from "@/lib/funnel";

type State = "email" | "checking" | "paid" | "pending";

/**
 * Payhip-hosted checkout returns the buyer without a verifiable order id, so
 * confirmation pages ask for the purchase email and poll the payhip-lookup
 * function until the webhook has recorded the sale.
 */
const PayhipConfirm = ({
  product,
  storageKey,
  onPaid,
  children,
}: {
  product: PayhipProductKey;
  storageKey: string;
  onPaid?: () => void;
  children: ReactNode;
}) => {
  const [state, setState] = useState<State>(() => (localStorage.getItem(storageKey) ? "paid" : "email"));
  const [email, setEmail] = useState(getLead()?.email ?? "");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (state !== "checking") return;
    let cancelled = false;
    const check = async () => {
      const { data, error } = await supabase.functions.invoke("payhip-lookup", { body: { email, product } });
      if (cancelled) return;
      if (!error && data?.paid) {
        localStorage.setItem(storageKey, email);
        onPaid?.();
        setState("paid");
        return;
      }
      setAttempts((a) => a + 1);
    };
    void check();
    const id = setInterval(() => void check(), 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state === "paid") return <>{children}</>;

  return (
    <div className="mx-auto max-w-md space-y-5 text-center">
      <Loader2 className={`h-8 w-8 mx-auto text-primary ${state === "checking" ? "animate-spin" : "hidden"}`} />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground !leading-[1.2]">
        {state === "checking" ? "Confirming your payment" : "Enter the email you used at checkout"}
      </h1>
      <p className="text-sm text-foreground/75 leading-relaxed">
        {state === "checking"
          ? "This usually takes a few seconds after Payhip confirms your payment. Keep this page open."
          : "Payhip processes your payment on their secure checkout. Enter the same email here and we will confirm your purchase."}
      </p>
      {state !== "checking" && (
        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setAttempts(0);
            setState("checking");
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground"
          />
          <button type="submit" className="btn-gold px-6 py-3 text-sm">Confirm My Purchase</button>
        </form>
      )}
      {state === "checking" && attempts >= 4 && (
        <p className="text-xs text-foreground/60">
          Still waiting. If you completed checkout more than a couple of minutes ago, check your inbox for the receipt and next-steps email.
        </p>
      )}
    </div>
  );
};

export default PayhipConfirm;
