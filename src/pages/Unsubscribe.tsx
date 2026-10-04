import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { trainingAction } from "@/lib/trainingApi";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("t");
  const [state, setState] = useState<"ask" | "working" | "done" | "invalid">(token ? "ask" : "invalid");

  const confirm = async () => {
    setState("working");
    const res = await trainingAction({ action: "unsubscribe", token });
    setState(res && !res.error && (res.data as { ok?: boolean })?.ok ? "done" : "invalid");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-36 pb-20">
        <div className="container mx-auto px-6 max-w-xl text-center space-y-5">
          {state === "done" ? (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.2]">You're unsubscribed</h1>
              <p className="text-foreground/80">You won't get any more training emails or texts from us.</p>
            </>
          ) : state === "invalid" ? (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.2]">This link isn't valid</h1>
              <p className="text-foreground/80">It may have expired. Email hello@gogovcon.com and we'll remove you right away.</p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground !leading-[1.2]">Stop training emails?</h1>
              <p className="text-foreground/80">Confirm below and we'll stop all training reminders and follow-ups.</p>
              <button onClick={confirm} disabled={state === "working"} className="btn-gold gap-2">
                {state === "working" && <Loader2 className="h-4 w-4 animate-spin" />} Unsubscribe me
              </button>
            </>
          )}
          <p><Link to="/" className="text-sm underline text-foreground">Back to the site</Link></p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Unsubscribe;
