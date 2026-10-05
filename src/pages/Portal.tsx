import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Loader2, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { REVIEW_PRICE, VIP_PRICE } from "@/lib/funnel";

const INTAKE_FIELDS = [
  { key: "goals", label: "Your goals", hint: "What do you want federal work to do for your business in the next 12 months?" },
  { key: "services", label: "Products and services", hint: "What you sell, in plain language." },
  { key: "staffing", label: "Staffing", hint: "Who delivers the work today: employees, contractors, just you?" },
  { key: "partners", label: "Partners", hint: "Any teaming partners, subcontractors or suppliers you already work with." },
  { key: "pricing", label: "Pricing process", hint: "How you price your work today, and any rate structures you use." },
  { key: "financial", label: "Financial capacity", hint: "Can you carry 30 to 60 day payment terms? Any lines of credit or reserves?" },
  { key: "opportunities", label: "Current opportunities", hint: "Anything you are bidding on, watching, or considering right now." },
  { key: "challenges", label: "Biggest challenges", hint: "What is blocking you from winning federal work today?" },
] as const;

const DOCS = [
  { key: "website", label: "Business website", hint: "Paste your website address, or mark that you do not have one yet." },
  { key: "capability_statement", label: "Capability statement", hint: "Upload the PDF if you have one." },
  { key: "sam_profile", label: "SAM.gov profile or UEI", hint: "Paste your SAM.gov profile link or UEI if you are registered." },
  { key: "project_summaries", label: "Project summaries or portfolio", hint: "Two or three short summaries of past work, or an existing portfolio file." },
  { key: "previous_proposal", label: "A previous proposal or opportunity", hint: "A proposal you have submitted, or an opportunity you are considering." },
] as const;

type PortalData = {
  firstName: string | null;
  product: string;
  intake: Record<string, string>;
  intakeSubmitted: boolean;
  creditExpiresAt: string | null;
  creditRedeemed: boolean;
  planDelivered: boolean;
  documents: { id: string; label: string }[];
};

const Portal = () => {
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");
  const [intake, setIntake] = useState<Record<string, string>>({});
  const [docText, setDocText] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "submitting">("idle");
  const [uploading, setUploading] = useState("");

  const load = useCallback(async () => {
    const { data: d, error: e } = await supabase.functions.invoke("portal", { body: { token, action: "get" } });
    if (e || d?.error) {
      setError("This link is invalid or has expired. Check the email we sent you, or contact us for a new one.");
      return;
    }
    setData(d as PortalData);
    setIntake((d as PortalData).intake ?? {});
  }, [token]);

  useEffect(() => {
    if (token) void load();
    else setError("This link is invalid or has expired. Check the email we sent you, or contact us for a new one.");
  }, [token, load]);

  const save = async (submit: boolean) => {
    setSaving(submit ? "submitting" : "saving");
    const merged = { ...intake };
    for (const d of DOCS) if (docText[d.key]) merged[`doc_${d.key}`] = docText[d.key];
    const { data: r, error: e } = await supabase.functions.invoke("portal", {
      body: { token, action: submit ? "submit_intake" : "save_intake", intake: merged },
    });
    setSaving("idle");
    if (e || r?.error) {
      setError("We could not save just now. Please try again.");
      return;
    }
    if (submit) void load();
    else {
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 2500);
    }
  };

  const upload = async (label: string, file: File) => {
    setUploading(label);
    try {
      const ext = file.name.split(".").pop() ?? "pdf";
      const { data: u, error: e1 } = await supabase.functions.invoke("portal", {
        body: { token, action: "upload_url", label, ext },
      });
      if (e1 || !u?.signedUrl) throw new Error("url");
      const res = await fetch(u.signedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!res.ok) throw new Error("upload");
      await supabase.functions.invoke("portal", { body: { token, action: "record_upload", label, path: u.path } });
      await load();
    } catch {
      setError("The upload did not go through. Please try again, or email the file to the team.");
    } finally {
      setUploading("");
    }
  };

  const uploadedLabels = new Set(data?.documents.map((d) => d.label) ?? []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          {error && !data ? (
            <div className="rounded-md border border-border bg-card p-8 text-center">
              <p className="text-base text-foreground/80 leading-relaxed">{error}</p>
            </div>
          ) : !data ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-10">
              <header className="space-y-3">
                <p className="eyebrow-dark text-xs">Your private client portal</p>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground !leading-[1.15]">
                  Welcome{data.firstName ? `, ${data.firstName}` : ""}.
                </h1>
                <p className="text-base text-foreground/75 leading-relaxed">
                  Complete your intake and share your materials below. You can save and come back any
                  time with this same link. Anything you do not have yet, just mark as such. You do
                  not need to create new documents.
                </p>
                {data.creditExpiresAt && !data.creditRedeemed && (
                  <p className="rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-foreground">
                    Your {REVIEW_PRICE} credit toward the VIP Engagement ({VIP_PRICE}) is active until{" "}
                    <strong>{new Date(data.creditExpiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.
                  </p>
                )}
              </header>

              {data.intakeSubmitted ? (
                <div className="rounded-md border border-border bg-card p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15"><Check className="h-5 w-5 text-primary" /></span>
                    <h2 className="font-display text-xl font-bold text-foreground">Intake received</h2>
                  </div>
                  <p className="text-sm text-foreground/75 leading-relaxed">
                    We have everything you submitted and a confirmation email is on its way. The team
                    now prepares your scorecard, agency research and draft plan, and Towan reviews the
                    findings before your session. {data.planDelivered ? "Your final plan has been delivered below." : "You will get an email the moment your final materials are ready."}
                  </p>
                </div>
              ) : (
                <>
                  <section className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-foreground !leading-[1.2]">Step 1 · Your intake</h2>
                    {INTAKE_FIELDS.map((f) => (
                      <div key={f.key}>
                        <label htmlFor={`intake-${f.key}`} className="block text-sm font-semibold text-foreground mb-1.5">{f.label}</label>
                        <textarea
                          id={`intake-${f.key}`}
                          rows={3}
                          value={intake[f.key] ?? ""}
                          onChange={(e) => setIntake((p) => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.hint}
                          className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </section>

                  <section className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-foreground !leading-[1.2]">Step 2 · Your materials</h2>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      Share what you already have. For anything missing, type "I don't have this yet" in the box.
                    </p>
                    {DOCS.map((d) => (
                      <div key={d.key} className="rounded-md border border-border bg-card p-5 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-foreground">{d.label}</h3>
                          {uploadedLabels.has(d.key) && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><Check className="h-3.5 w-3.5" /> Received</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{d.hint}</p>
                        <input
                          value={docText[d.key] ?? ""}
                          onChange={(e) => setDocText((p) => ({ ...p, [d.key]: e.target.value }))}
                          placeholder="Link, details, or &quot;I don't have this yet&quot;"
                          className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-foreground/80 hover:text-primary">
                          {uploading === d.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploading === d.key ? "Uploading…" : "Upload a file"}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void upload(d.key, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    ))}
                  </section>

                  {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => void save(false)}
                      disabled={saving !== "idle"}
                      className="rounded-md border border-foreground px-6 py-3 text-sm font-semibold text-foreground disabled:opacity-60"
                    >
                      {saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : "Save and finish later"}
                    </button>
                    <button
                      onClick={() => void save(true)}
                      disabled={saving !== "idle"}
                      className="btn-gold rounded-md px-6 py-3 text-sm font-bold disabled:opacity-60"
                    >
                      {saving === "submitting" ? "Submitting…" : "Submit my intake"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Portal;
