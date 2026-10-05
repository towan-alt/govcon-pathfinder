import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Token-gated client portal: intake save-and-resume, document uploads, status.
// Clients can only ever reach the row matching their portal token.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const TOKEN = /^[0-9a-f]{48}$/;
const BUCKET = "client-documents";

const DOC_LABELS = ["website", "capability_statement", "sam_profile", "project_summaries", "previous_proposal"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    const token = String(b.token ?? "");
    if (!TOKEN.test(token)) return json({ error: "Invalid link" }, 401);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: client } = await sb.from("clients").select("*").eq("portal_token", token).maybeSingle();
    if (!client) return json({ error: "Invalid or expired link" }, 404);

    const action = String(b.action ?? "get");

    if (action === "get") {
      const { data: docs } = await sb.from("client_documents").select("id, label, created_at").eq("client_id", client.id);
      return json({
        firstName: client.first_name,
        product: client.product,
        intake: client.intake,
        intakeSubmitted: Boolean(client.intake_submitted_at),
        creditExpiresAt: client.credit_expires_at,
        creditRedeemed: Boolean(client.credit_redeemed_at),
        planDelivered: Boolean(client.plan_delivered_at),
        documents: docs ?? [],
      });
    }

    if (action === "save_intake" || action === "submit_intake") {
      const intake = b.intake;
      if (typeof intake !== "object" || intake === null || Array.isArray(intake)) return json({ error: "Invalid intake" }, 400);
      // Cap size and keep only string values.
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(intake as Record<string, unknown>)) {
        if (typeof k === "string" && k.length <= 60 && typeof v === "string") clean[k] = v.slice(0, 5000);
      }
      const patch: Record<string, unknown> = { intake: clean };
      if (action === "submit_intake") patch.intake_submitted_at = new Date().toISOString();
      await sb.from("clients").update(patch).eq("id", client.id);
      return json({ ok: true, submitted: action === "submit_intake" });
    }

    if (action === "upload_url") {
      const label = String(b.label ?? "");
      if (!DOC_LABELS.includes(label as (typeof DOC_LABELS)[number])) return json({ error: "Unknown document type" }, 400);
      const ext = String(b.ext ?? "pdf").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "pdf";
      const path = `${client.id}/${label}-${Date.now()}.${ext}`;
      const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
      if (error) throw error;
      return json({ path, signedUrl: data.signedUrl, token: data.token });
    }

    if (action === "record_upload") {
      const label = String(b.label ?? "");
      const path = String(b.path ?? "");
      if (!DOC_LABELS.includes(label as (typeof DOC_LABELS)[number]) || !path.startsWith(`${client.id}/`)) {
        return json({ error: "Invalid upload" }, 400);
      }
      await sb.from("client_documents").insert({ client_id: client.id, label, file_path: path });
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("portal error:", e instanceof Error ? e.message : String(e));
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
