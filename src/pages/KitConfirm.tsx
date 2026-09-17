import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import coverUrl from "@/assets/govcon-launch-kit-cover.png";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/track";

type State =
  | { kind: "loading" }
  | { kind: "ready"; firstName: string; url: string }
  | { kind: "error"; message: string };

const KitConfirm = () => {
  const [state, setState] = useState<State>({ kind: "loading" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = new URLSearchParams(window.location.search).get("token") ?? "";

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("kit-verify", { body: { token } });
        if (error) throw new Error(error.message);
        if (data?.error) {
          setState({ kind: "error", message: data.message ?? "This confirmation link isn't valid." });
          return;
        }
        setState({ kind: "ready", firstName: data.firstName, url: data.url });
        void trackEvent("kit_verified");
      } catch {
        setState({ kind: "error", message: "We couldn't confirm your email. Please try the link again." });
      }
    })();
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      <Navbar />

      <section className="pt-36 pb-24 lg:pt-44">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto text-center space-y-8">
            <img
              src={coverUrl}
              alt="GovCon Launch Kit Booklet cover"
              className="w-36 mx-auto rounded-md shadow-2xl border"
              style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
            />

            {state.kind === "loading" && (
              <p className="text-sm text-white/50">Confirming your email…</p>
            )}

            {state.kind === "ready" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-[1.15]">
                  You're verified, {state.firstName}. Here's your{" "}
                  <em className="text-primary italic">Launch Kit</em>.
                </h1>
                <p className="text-base text-white/60 leading-relaxed">
                  Download the booklet, then block 2–4 uninterrupted hours for your SAM.gov registration day.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href={state.url}
                    onClick={() => void trackEvent("kit_download")}
                    className="btn-gold text-sm px-10 py-4 rounded-md"
                  >
                    Download the booklet
                  </a>
                  <a
                    href="/book"
                    className="text-sm px-10 py-4 rounded-md border text-white/80 hover:text-primary hover:border-primary transition-colors"
                    style={{ borderColor: "hsl(0 0% 100% / 0.15)" }}
                  >
                    Book a strategy call
                  </a>
                </div>
                <p className="text-xs text-white/55">
                  This download link stays active for 24 hours.
                </p>
                <div
                  className="mt-6 rounded-lg p-6 text-left max-w-lg mx-auto"
                  style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.12)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Want the templates too?
                  </p>
                  <p className="text-sm text-white/70 mt-2 leading-relaxed">
                    Launch Kit Pro adds the fill-in-the-blank capability statement, the registration
                    walkthrough and a recorded training — $97 one-time.
                  </p>
                  <a
                    href="/kit/upgrade"
                    onClick={() => void trackEvent("cta_click", "kit-confirm-upgrade")}
                    className="btn-gold inline-block text-sm px-8 py-3 rounded-md mt-4"
                  >
                    See Launch Kit Pro
                  </a>
                </div>

              </>
            )}

            {state.kind === "error" && (
              <>
                <h1 className="font-display text-3xl font-bold text-white">Link didn't work</h1>
                <p className="text-base text-white/60">{state.message}</p>
                <a href="/kit" className="btn-gold inline-block text-sm px-10 py-4 rounded-md">
                  Request the booklet again
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default KitConfirm;
