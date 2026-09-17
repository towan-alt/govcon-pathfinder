import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import coverUrl from "@/assets/govcon-launch-kit-cover.png";
import { supabase } from "@/integrations/supabase/client";
import { getDevice, getSource, trackEvent } from "@/lib/track";

const chapters = [
  "GovCon in plain English — what the government actually buys",
  "What “contract-ready” really means (and what it doesn't)",
  "The setup roadmap in the only order that makes sense",
  "Business foundation before the EIN",
  "Getting your EIN the right way",
  "GovCon-ready business banking",
  "SAM.gov registration, step by step",
  "UEI, entity validation and the delays that trip people up",
  "After SAM.gov: the actions that create revenue",
  "Choosing the right NAICS codes, with examples",
];

const KIT_CONFIRM_KEY = "ggc_kit_confirmed";

const Kit = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(true);

  useEffect(() => {
    void trackEvent("kit_view");
  }, []);

  // Repeat the confirmation page after submission — restore it on return visits
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KIT_CONFIRM_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      setFirstName(s.firstName ?? "");
      setLastName(s.lastName ?? "");
      setEmail(s.email ?? "");
      setPhone(s.phone ?? "");
      setBusinessName(s.businessName ?? "");
      setEmailSent(Boolean(s.emailSent));
      setStatus("sent");
    } catch {
      // ignore malformed storage
    }
  }, []);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter your first name, last name and a valid email address.");
      return;
    }
    setStatus("sending");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("kit-request", {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          businessName: businessName.trim(),
          origin: window.location.origin,
          device: getDevice(),
          source: getSource(),
        },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      const didSend = Boolean(data?.emailSent);
      setEmailSent(didSend);
      sessionStorage.setItem(
        KIT_CONFIRM_KEY,
        JSON.stringify({ firstName, lastName, email, phone, businessName, emailSent: didSend })
      );
      setStatus("sent");
      void trackEvent("kit_request");

    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      <Navbar />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start max-w-6xl mx-auto">
            {/* Left: pitch */}
            <div className="space-y-8">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Free download
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-[1.1]">
                The GovCon Launch Kit{" "}
                <em className="text-primary italic">Booklet</em>
              </h1>
              <p className="text-base text-white/60 leading-relaxed max-w-lg">
                New opportunities. New business. New money. A step-by-step booklet that takes you from
                “I've never sold to the government” to a registered, verified, contract-ready business —
                in the right order, without the guesswork.
              </p>

              <div className="rounded-lg border p-6 space-y-3" style={{ borderColor: "hsl(0 0% 100% / 0.08)", background: "hsl(0 0% 7%)" }}>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">What's inside</p>
                <ul className="space-y-2.5">
                  {chapters.map((c) => (
                    <li key={c} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-8 pt-2">
                <div>
                  <p className="font-display text-2xl font-bold text-primary">25+</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Years of experience</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-primary">6,500+</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/40">Businesses coached</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-primary">$27M+</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/60">Federal contract value</p>
                </div>

              </div>
            </div>

            {/* Right: cover + form */}
            <div className="space-y-8 lg:sticky lg:top-24">
              <img
                src={coverUrl}
                alt="GovCon Launch Kit Booklet cover"
                className="w-40 md:w-48 rounded-md shadow-2xl border"
                style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}
              />

              {status === "sent" ? (
                <div
                  className="rounded-lg border p-8 space-y-4"
                  style={{ borderColor: "hsl(45 55% 55% / 0.35)", background: "hsl(0 0% 7%)" }}
                >
                  <h2 className="font-display text-2xl font-bold text-white">Check your inbox</h2>
                  <p className="text-sm text-white/60 leading-relaxed">
                    We sent a confirmation email to <span className="text-primary">{email}</span>. Click the
                    button in that email and your booklet downloads right away.
                  </p>
                  {!emailSent && (
                    <p className="text-sm text-white/50 leading-relaxed border-t pt-4" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
                      Heads up: email delivery isn't switched on for this site yet, so the confirmation
                      message may not arrive. Your request was saved and Towan will follow up directly.
                    </p>
                  )}
                  <p className="text-xs text-white/30">
                    Didn't get it? Check spam, or{" "}
                    <button
                      onClick={() => {
                        sessionStorage.removeItem(KIT_CONFIRM_KEY);
                        setStatus("idle");
                      }}
                      className="text-primary underline"
                    >
                      try another email address
                    </button>
                    .
                  </p>

                </div>
              ) : (
                <form
                  onSubmit={submit}
                  className="rounded-lg border p-8 space-y-5"
                  style={{ borderColor: "hsl(0 0% 100% / 0.08)", background: "hsl(0 0% 7%)" }}
                >
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold text-white">Get your free copy</h2>
                    <p className="text-sm text-white/50">
                      Confirm your email and the download unlocks instantly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="kit-first" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                        First name *
                      </label>
                      <input
                        id="kit-first"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-md border px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                        placeholder="Towan"
                      />
                    </div>
                    <div>
                      <label htmlFor="kit-last" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                        Last name *
                      </label>
                      <input
                        id="kit-last"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-md border px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                        placeholder="Isom"
                      />
                    </div>
                    <div>
                      <label htmlFor="kit-email" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                        Email address *
                      </label>
                      <input
                        id="kit-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="kit-phone" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                        Phone number
                      </label>
                      <input
                        id="kit-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-md border px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label htmlFor="kit-business" className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                        Business name
                      </label>

                      <input
                        id="kit-business"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full rounded-md border px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary"
                        style={{ borderColor: "hsl(0 0% 100% / 0.12)", background: "hsl(0 0% 10%)" }}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn-gold w-full text-sm px-8 py-4 rounded-md disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Send me the booklet"}
                  </button>

                  <p className="text-xs text-white/30 leading-relaxed">
                    We verify your email so the booklet reaches a real inbox. No spam, unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Kit;
