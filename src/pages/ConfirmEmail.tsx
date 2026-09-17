import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { trackCta, trackEvent } from "@/lib/track";

type State =
  | { kind: "loading" }
  | { kind: "ready"; firstName: string; naicsCode?: string | null; alreadyVerified: boolean }
  | { kind: "error"; message: string };

const ConfirmEmail = () => {
  const [state, setState] = useState<State>({ kind: "loading" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = new URLSearchParams(window.location.search).get("token") ?? "";

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("lead-verify", { body: { token } });
        if (error) throw new Error(error.message);
        if (data?.error) {
          setState({ kind: "error", message: data.message ?? "This confirmation link isn't valid." });
          return;
        }
        setState({
          kind: "ready",
          firstName: data.firstName,
          naicsCode: data.naicsCode,
          alreadyVerified: Boolean(data.alreadyVerified),
        });
        void trackEvent("lead_verified");
      } catch {
        setState({
          kind: "error",
          message: "We couldn't confirm your email. Please try the link again.",
        });
      }
    })();
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      <Navbar />

      <section className="pt-36 pb-24 lg:pt-44">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto text-center space-y-8">
            {state.kind === "loading" && (
              <p className="text-sm text-white/50">Confirming your email…</p>
            )}

            {state.kind === "ready" && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-primary/15 border border-primary/40">
                  <span className="text-primary text-3xl">✓</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
                  {state.alreadyVerified ? "Already confirmed" : "You're confirmed"},{" "}
                  <em className="text-primary italic">{state.firstName}</em>.
                </h1>
                <p className="text-white/60 leading-relaxed">
                  {state.naicsCode
                    ? `Your email is confirmed for NAICS ${state.naicsCode}. Check your inbox for your starting-point questions.`
                    : "Your email is confirmed. Towan will review your details and follow up with next steps."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/launch-kit"
                    onClick={() => trackCta("confirm-email-launch-kit")}
                    className="btn-gold text-sm px-8 py-3 rounded-md"
                  >
                    Get the free Launch Kit
                  </Link>
                  <Link
                    to="/"
                    onClick={() => trackCta("confirm-email-home")}
                    className="rounded-md border border-primary/40 px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    Back to the site
                  </Link>
                </div>
              </>
            )}

            {state.kind === "error" && (
              <>
                <h1 className="font-display text-3xl font-bold text-white">
                  Something's off with this link
                </h1>
                <p className="text-white/60">{state.message}</p>
                <Link to="/naics" className="btn-gold text-sm px-8 py-3 rounded-md inline-block">
                  Sign up again
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ConfirmEmail;
