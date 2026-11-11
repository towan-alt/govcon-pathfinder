import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { type Billing, type SubOptions, subCall } from "@/lib/subscriber";

export function useSubscriberAccount() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [billing, setBilling] = useState<Billing>(null);
  const [billingReady, setBillingReady] = useState(false);
  const [options, setOptions] = useState<SubOptions | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, next) => setSession(next));
    subCall({ action: "options" }).then(setOptions).catch(() => setOptions({ ai_enabled: false, naics: [], keywords: [] }));
    return () => data.subscription.unsubscribe();
  }, []);

  const loadBilling = useCallback(async () => {
    if (!session) { setBilling(null); setBillingReady(true); return null; }
    let env: "sandbox" | "live";
    try { env = getStripeEnvironment(); } catch { setBillingReady(true); return null; }
    const { data } = await supabase.from("subscriptions").select("status,current_period_end,cancel_at_period_end").eq("user_id", session.user.id).eq("environment", env).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setBilling(data); setBillingReady(true); return data;
  }, [session]);
  useEffect(() => { loadBilling(); }, [loadBilling]);

  return { session, authReady, billing, billingReady, loadBilling, options };
}
