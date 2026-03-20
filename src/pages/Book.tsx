import { useState, useCallback } from "react";
import { Link } from "react-router-dom";

const REVENUE_VALUES = [
  "Under $50K", "$75K", "$100K", "$150K", "$200K",
  "$250K", "$350K", "$500K", "$750K", "$1M", "$2M+"
];

const INDUSTRIES = [
  "IT & Technology Services",
  "Construction & Facilities",
  "Professional & Management Services",
  "Healthcare & Medical",
  "Logistics & Transportation",
  "Training & Education",
  "Marketing & Communications",
  "Security Services",
  "Environmental Services",
  "Staffing & HR",
  "Financial Services",
  "Other",
];

const REFERRAL_SOURCES = [
  "Google / Web search",
  "Social media (LinkedIn)",
  "Social media (Instagram / Facebook)",
  "Referral from someone I know",
  "SBA / SCORE event",
  "Podcast or YouTube",
  "Email newsletter",
  "Other",
];

const Book = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");

  // Step 2
  const [samStatus, setSamStatus] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [journeyStage, setJourneyStage] = useState("");

  // Step 3
  const [revenueIndex, setRevenueIndex] = useState(5);
  const [contractSize, setContractSize] = useState("");
  const [contractStrategy, setContractStrategy] = useState("");
  const [targetAgencies, setTargetAgencies] = useState("");
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [referralSource, setReferralSource] = useState("");

  const toggleCert = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const validateStep = useCallback(
    (s: number) => {
      const errs: Record<string, boolean> = {};
      if (s === 1) {
        if (!firstName.trim()) errs.firstName = true;
        if (!lastName.trim()) errs.lastName = true;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = true;
        if (!businessName.trim()) errs.businessName = true;
      }
      if (s === 2) {
        if (!samStatus) errs.samStatus = true;
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [firstName, lastName, email, businessName, samStatus]
  );

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const progressWidth = submitted ? 100 : ((step - 1) / 3) * 100 + (step === 3 ? 66 : step === 2 ? 33 : 0);

  return (
    <div className="min-h-screen" style={{ background: "hsl(40, 10%, 4%)" }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 20%, hsla(43, 44%, 54%, 0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 90% 80%, hsla(43, 44%, 54%, 0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* LEFT PANEL */}
        <div
          className="relative flex flex-col justify-between lg:sticky lg:top-0 lg:h-screen overflow-hidden border-b lg:border-b-0 lg:border-r"
          style={{
            padding: "64px 56px",
            borderColor: "hsla(43, 44%, 54%, 0.2)",
          }}
        >
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none hidden lg:block"
            style={{
              background: "linear-gradient(to top, hsl(40, 10%, 4%), transparent)",
            }}
          />

          <Link
            to="/"
            className="text-xs font-semibold uppercase tracking-[0.18em] hover:opacity-80 transition-opacity"
            style={{ color: "hsl(var(--blue))", fontFamily: "var(--font-display)" }}
          >
            GovCon Strategy Hub
          </Link>

          <div className="flex-1 flex flex-col justify-center py-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium w-fit mb-7"
              style={{
                background: "hsla(43, 44%, 54%, 0.15)",
                border: "1px solid hsla(43, 44%, 54%, 0.2)",
                color: "hsl(var(--blue))",
                letterSpacing: "0.04em",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "hsl(var(--blue))" }}
              />
              Free · 15 Minutes · No Obligation
            </div>

            <h1
              className="font-bold mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 3.5vw, 42px)",
                lineHeight: 1.15,
                color: "hsl(0, 0%, 94%)",
              }}
            >
              In 15 minutes, you'll know exactly{" "}
              <span style={{ color: "hsl(var(--blue))" }}>why you're not winning</span> —
              and what to fix first.
            </h1>

            <p
              className="mb-10"
              style={{
                fontSize: "15px",
                color: "hsl(0, 0%, 54%)",
                lineHeight: 1.7,
                maxWidth: 380,
              }}
            >
              Towan Isom has executed 105+ federal contracts and generated $25M+ in
              revenue. This session is your direct line to her strategy — no pitch, no
              fluff.
            </p>

            {/* Session details */}
            <div className="flex flex-col gap-4 mb-10">
              {[
                { icon: "⏱", text: <><strong className="text-[hsl(0,0%,94%)]">15 minutes</strong> — tight, diagnostic, actionable</> },
                { icon: "🎯", text: <><strong className="text-[hsl(0,0%,94%)]">What's covered:</strong> NAICS alignment, agency targets, positioning gaps</> },
                { icon: "📅", text: <><strong className="text-[hsl(0,0%,94%)]">Confirmation</strong> within 24 hours via email</> },
                { icon: "🔒", text: <><strong className="text-[hsl(0,0%,94%)]">Limited spots</strong> released on the 1st of each month</> },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{
                      background: "hsla(43, 44%, 54%, 0.15)",
                      border: "1px solid hsla(43, 44%, 54%, 0.2)",
                    }}
                  >
                    {d.icon}
                  </div>
                  <span className="text-sm" style={{ color: "hsl(0, 0%, 54%)" }}>
                    {d.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="w-12 h-px mb-8" style={{ background: "hsla(43, 44%, 54%, 0.2)" }} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "105+", label: "Contracts Executed" },
                { num: "$25M+", label: "Revenue Generated" },
                { num: "6,500+", label: "Businesses Coached" },
                { num: "25+", label: "Years Experience" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-lg p-4"
                  style={{
                    background: "hsl(40, 8%, 10%)",
                    border: "1px solid hsla(43, 44%, 54%, 0.2)",
                  }}
                >
                  <div
                    className="text-[28px] font-bold leading-none mb-1"
                    style={{ fontFamily: "var(--font-display)", color: "hsl(var(--blue))" }}
                  >
                    {s.num}
                  </div>
                  <div
                    className="text-[11px] uppercase tracking-wider"
                    style={{ color: "hsl(0, 0%, 36%)" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs relative z-10" style={{ color: "hsl(0, 0%, 36%)" }}>
            © 2026 Towan Isom · GovCon Strategy Hub
          </p>
        </div>

        {/* RIGHT PANEL — FORM */}
        <div className="p-8 sm:p-14 overflow-y-auto">
          {/* Progress bar */}
          <div
            className="h-0.5 rounded-full mb-9 overflow-hidden"
            style={{ background: "hsl(40, 6%, 14%)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressWidth}%`, background: "hsl(var(--blue))" }}
            />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{
                    background:
                      submitted || step > s
                        ? "hsla(43, 44%, 54%, 0.4)"
                        : step === s
                        ? "hsl(var(--blue))"
                        : "hsl(40, 6%, 18%)",
                  }}
                />
                {i < 2 && (
                  <div
                    className="w-8 h-px transition-colors"
                    style={{
                      background:
                        submitted || step > s
                          ? "hsla(43, 44%, 54%, 0.4)"
                          : "hsl(40, 6%, 18%)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Header */}
          <h2
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "var(--font-display)", color: "hsl(0, 0%, 94%)" }}
          >
            {submitted
              ? "Session Reserved"
              : step === 1
              ? "About Your Business"
              : step === 2
              ? "Your GovCon Status"
              : "Your Goals & Targets"}
          </h2>
          <p className="text-sm mb-10" style={{ color: "hsl(0, 0%, 54%)" }}>
            {submitted
              ? "You're all set. Towan will be in touch shortly."
              : step === 1
              ? "Let's start with the basics so Towan can prepare for your session."
              : step === 2
              ? "Help Towan understand where you are in the process."
              : "The more specific you are, the more Towan can tailor the session to you."}
          </p>

          {/* SUCCESS STATE */}
          {submitted ? (
            <div className="text-center py-16 animate-fade-in">
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl mx-auto mb-7"
                style={{
                  background: "hsla(149, 36%, 45%, 0.15)",
                  border: "1px solid hsla(149, 36%, 45%, 0.4)",
                }}
              >
                ✓
              </div>
              <h3
                className="text-3xl font-bold mb-3.5"
                style={{ fontFamily: "var(--font-display)", color: "hsl(0, 0%, 94%)", lineHeight: 1.3 }}
              >
                You're on the list,{" "}
                <span style={{ color: "hsl(var(--blue))" }}>{firstName || "friend"}</span>.
              </h3>
              <p
                className="text-[15px] mb-9 mx-auto"
                style={{ color: "hsl(0, 0%, 54%)", lineHeight: 1.7, maxWidth: 380 }}
              >
                Towan will review your intake before the session. Expect a confirmation
                email within 24 hours with your session details.
              </p>
              <div
                className="rounded-xl p-6 text-left max-w-md mx-auto"
                style={{
                  background: "hsl(40, 8%, 10%)",
                  border: "1px solid hsla(43, 44%, 54%, 0.2)",
                }}
              >
                {[
                  { icon: "⏱", label: "Session length:", value: "15 minutes" },
                  { icon: "📧", label: "Next step:", value: "Check your email for confirmation" },
                  { icon: "📋", label: "Prep tip:", value: "Have your SAM.gov UEI number handy" },
                  { icon: "🔒", label: "Spots:", value: "Limited — you're confirmed for this month" },
                ].map((r, i, arr) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 text-sm"
                    style={{
                      borderBottom: i < arr.length - 1 ? "1px solid hsla(43, 44%, 54%, 0.2)" : "none",
                      color: "hsl(0, 0%, 54%)",
                    }}
                  >
                    <span>{r.icon}</span>
                    <span>
                      {r.label}{" "}
                      <strong style={{ color: "hsl(0, 0%, 94%)" }}>{r.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1 */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <FieldGroup label="First Name" required error={errors.firstName} errorMsg="Please enter your first name.">
                      <FormInput value={firstName} onChange={setFirstName} placeholder="First name" />
                    </FieldGroup>
                    <FieldGroup label="Last Name" required error={errors.lastName} errorMsg="Please enter your last name.">
                      <FormInput value={lastName} onChange={setLastName} placeholder="Last name" />
                    </FieldGroup>
                  </div>
                  <FieldGroup label="Email Address" required error={errors.email} errorMsg="Please enter a valid email address.">
                    <FormInput value={email} onChange={setEmail} placeholder="you@yourbusiness.com" type="email" />
                  </FieldGroup>
                  <FieldGroup label="Phone Number">
                    <FormInput value={phone} onChange={setPhone} placeholder="(555) 000-0000" type="tel" />
                  </FieldGroup>
                  <FieldGroup label="Business Name" required error={errors.businessName} errorMsg="Please enter your business name.">
                    <FormInput value={businessName} onChange={setBusinessName} placeholder="Your company name" />
                  </FieldGroup>
                  <FieldGroup label="Industry / Type of Business">
                    <FormSelect value={industry} onChange={setIndustry} placeholder="Select your industry" options={INDUSTRIES} />
                  </FieldGroup>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <FieldGroup label="Are you registered in SAM.gov?" required error={errors.samStatus}>
                    <RadioGroup
                      options={["Yes, active", "Registered but expired", "Not yet"]}
                      value={samStatus}
                      onChange={setSamStatus}
                    />
                  </FieldGroup>
                  <FieldGroup label="Which certifications do you hold? (Select all)">
                    <CheckboxGroup
                      options={["8(a) Business Development", "WOSB / EDWOSB", "SDVOSB / VOSB", "HUBZone", "SDB / MBE", "None yet"]}
                      selected={certifications}
                      onToggle={toggleCert}
                    />
                  </FieldGroup>
                  <FieldGroup label="Where are you in your GovCon journey?">
                    <RadioGroup
                      options={[
                        "Brand new — haven't started yet",
                        "Registered but haven't bid yet",
                        "Bidding but not winning",
                        "Have some wins — want to scale",
                      ]}
                      value={journeyStage}
                      onChange={setJourneyStage}
                    />
                  </FieldGroup>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="animate-fade-in">
                  <FieldGroup label="Revenue goal for the next 12 months">
                    <div className="text-center mb-2">
                      <span
                        className="text-[22px] font-bold"
                        style={{ fontFamily: "var(--font-display)", color: "hsl(var(--blue))" }}
                      >
                        {REVENUE_VALUES[revenueIndex]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={revenueIndex}
                      onChange={(e) => setRevenueIndex(Number(e.target.value))}
                      className="w-full accent-[hsl(var(--blue))] cursor-pointer"
                      style={{ height: 4, background: "hsl(40, 6%, 18%)", borderRadius: 2, border: "none", padding: 0 }}
                    />
                    <div className="flex justify-between mt-2 text-[11px]" style={{ color: "hsl(0, 0%, 36%)" }}>
                      <span>Under $50K</span>
                      <span>$500K</span>
                      <span>$2M+</span>
                    </div>
                  </FieldGroup>

                  <FieldGroup label="What size contracts are you targeting?">
                    <RadioGroup
                      options={[
                        "Micro purchases — Under $25K",
                        "Small contracts — $25K–$250K",
                        "Mid-size — $250K–$1M",
                        "Large contracts — $1M+",
                      ]}
                      value={contractSize}
                      onChange={setContractSize}
                      cols={2}
                    />
                  </FieldGroup>

                  <FieldGroup label="Preferred contracting strategy">
                    <RadioGroup
                      options={["Prime contractor", "Subcontractor", "Both / unsure"]}
                      value={contractStrategy}
                      onChange={setContractStrategy}
                    />
                  </FieldGroup>

                  <FieldGroup label="Which agencies are you targeting? (optional)">
                    <FormInput value={targetAgencies} onChange={setTargetAgencies} placeholder="e.g. DoD, VA, HHS, GSA…" />
                  </FieldGroup>

                  <FieldGroup label="What's your biggest challenge right now?">
                    <textarea
                      value={biggestChallenge}
                      onChange={(e) => setBiggestChallenge(e.target.value.slice(0, 500))}
                      maxLength={500}
                      placeholder="Tell Towan what's keeping you stuck…"
                      rows={4}
                      className="w-full rounded-lg px-4 py-3.5 text-[15px] outline-none transition-colors resize-y"
                      style={{
                        background: "hsl(40, 8%, 10%)",
                        border: "1px solid hsla(43, 44%, 54%, 0.2)",
                        color: "hsl(0, 0%, 94%)",
                        fontFamily: "var(--font-body)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "hsl(var(--blue))")}
                      onBlur={(e) => (e.target.style.borderColor = "hsla(43, 44%, 54%, 0.2)")}
                    />
                    <div className="text-right text-[11px] mt-1.5" style={{ color: "hsl(0, 0%, 36%)" }}>
                      {biggestChallenge.length} / 500
                    </div>
                  </FieldGroup>

                  <FieldGroup label="How did you hear about Towan?">
                    <FormSelect value={referralSource} onChange={setReferralSource} placeholder="Select one" options={REFERRAL_SOURCES} />
                  </FieldGroup>
                </div>
              )}

              {/* NAV BUTTONS */}
              <div
                className="flex items-center justify-between mt-9 pt-7"
                style={{ borderTop: "1px solid hsla(43, 44%, 54%, 0.2)" }}
              >
                {step > 1 ? (
                  <button
                    onClick={back}
                    className="rounded-lg px-7 py-3.5 text-sm font-medium transition-colors cursor-pointer"
                    style={{
                      background: "transparent",
                      border: "1px solid hsla(43, 44%, 54%, 0.2)",
                      color: "hsl(0, 0%, 54%)",
                      fontFamily: "var(--font-body)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "hsla(43, 44%, 54%, 0.5)";
                      e.currentTarget.style.color = "hsl(0, 0%, 94%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "hsla(43, 44%, 54%, 0.2)";
                      e.currentTarget.style.color = "hsl(0, 0%, 54%)";
                    }}
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    onClick={next}
                    className="rounded-lg px-9 py-3.5 text-[15px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    style={{
                      background: "hsl(var(--blue))",
                      color: "hsl(40, 10%, 4%)",
                      fontFamily: "var(--font-body)",
                      letterSpacing: "0.02em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "hsl(45, 65%, 55%)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "hsl(var(--blue))";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="rounded-lg px-10 py-4 text-[15px] font-semibold w-full transition-all cursor-pointer"
                    style={{
                      background: "hsl(var(--blue))",
                      color: "hsl(40, 10%, 4%)",
                      fontFamily: "var(--font-body)",
                      letterSpacing: "0.03em",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(45, 65%, 55%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--blue))")}
                  >
                    Reserve My Session →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─── */

function FieldGroup({
  label,
  required,
  error,
  errorMsg,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  errorMsg?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label
        className="block text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: "hsl(0, 0%, 54%)" }}
      >
        {label}
        {required && <span className="ml-1" style={{ color: "hsl(var(--blue))" }}>*</span>}
      </label>
      {children}
      {error && errorMsg && (
        <p className="text-xs mt-1.5" style={{ color: "hsl(0, 65%, 55%)" }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}

function FormInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg px-4 py-3.5 text-[15px] outline-none transition-colors"
      style={{
        background: "hsl(40, 8%, 10%)",
        border: "1px solid hsla(43, 44%, 54%, 0.2)",
        color: "hsl(0, 0%, 94%)",
        fontFamily: "var(--font-body)",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "hsl(var(--blue))";
        e.target.style.background = "hsl(40, 6%, 14%)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "hsla(43, 44%, 54%, 0.2)";
        e.target.style.background = "hsl(40, 8%, 10%)";
      }}
    />
  );
}

function FormSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg px-4 py-3.5 text-[15px] outline-none transition-colors cursor-pointer appearance-none"
      style={{
        background: "hsl(40, 8%, 10%)",
        border: "1px solid hsla(43, 44%, 54%, 0.2)",
        color: value ? "hsl(0, 0%, 94%)" : "hsl(0, 0%, 36%)",
        fontFamily: "var(--font-body)",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a8680' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 16px center",
        paddingRight: 40,
      }}
      onFocus={(e) => (e.target.style.borderColor = "hsl(var(--blue))")}
      onBlur={(e) => (e.target.style.borderColor = "hsla(43, 44%, 54%, 0.2)")}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "hsl(40, 8%, 10%)", color: "hsl(0, 0%, 94%)" }}>
          {o}
        </option>
      ))}
    </select>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
  cols,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: cols ? `repeat(${cols}, 1fr)` : "1fr" }}
    >
      {options.map((o) => (
        <label
          key={o}
          className="flex items-start gap-3 rounded-lg px-4 py-3.5 cursor-pointer transition-colors"
          style={{
            background: value === o ? "hsla(43, 44%, 54%, 0.15)" : "hsl(40, 8%, 10%)",
            border: `1px solid ${value === o ? "hsl(var(--blue))" : "hsla(43, 44%, 54%, 0.2)"}`,
            color: value === o ? "hsl(0, 0%, 94%)" : "hsl(0, 0%, 54%)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <span
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
            style={{
              border: `1.5px solid ${value === o ? "hsl(var(--blue))" : "hsl(0, 0%, 36%)"}`,
              background: value === o ? "hsl(var(--blue))" : "transparent",
            }}
          >
            {value === o && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(40, 10%, 4%)" }} />
            )}
          </span>
          {o}
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const checked = selected.includes(o);
        return (
          <label
            key={o}
            className="flex items-start gap-3 rounded-lg px-4 py-3.5 cursor-pointer transition-colors"
            style={{
              background: checked ? "hsla(43, 44%, 54%, 0.15)" : "hsl(40, 8%, 10%)",
              border: `1px solid ${checked ? "hsl(var(--blue))" : "hsla(43, 44%, 54%, 0.2)"}`,
              color: checked ? "hsl(0, 0%, 94%)" : "hsl(0, 0%, 54%)",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <span
              className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors text-[11px] font-bold"
              style={{
                border: `1.5px solid ${checked ? "hsl(var(--blue))" : "hsl(0, 0%, 36%)"}`,
                background: checked ? "hsl(var(--blue))" : "transparent",
                color: checked ? "hsl(40, 10%, 4%)" : "transparent",
              }}
            >
              ✓
            </span>
            {o}
          </label>
        );
      })}
    </div>
  );
}

export default Book;
