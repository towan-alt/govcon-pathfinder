import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac, timingSafeEqual } from "node:crypto";
import { SMS_HELP_REPLY } from "../_shared/assessment-templates.ts";

/** Twilio inbound SMS webhook: honors STOP and replies to HELP. Verifies Twilio's signature. */
const twiml = (msg?: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${msg ? `<Message>${msg.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</Message>` : ""}</Response>`,
    { headers: { "Content-Type": "text/xml" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!token) return new Response("Not configured", { status: 503 });
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/sms-inbound`;
  const sorted = [...params.keys()].sort().map((k) => k + params.get(k)).join("");
  const expected = createHmac("sha1", token).update(url + sorted).digest();
  const got = new Uint8Array([...atob(req.headers.get("x-twilio-signature") ?? "")].map((c) => c.charCodeAt(0)));
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return new Response("Forbidden", { status: 403 });

  const from = (params.get("From") ?? "").replace(/[^\d+]/g, "");
  const body = (params.get("Body") ?? "").trim().toUpperCase();
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "REVOKE", "OPTOUT"].includes(body)) {
    await sb.from("sms_opt_outs").upsert({ phone: from });
    return twiml(); // Twilio sends its own STOP confirmation.
  }
  if (["START", "UNSTOP", "YES"].includes(body)) {
    await sb.from("sms_opt_outs").delete().eq("phone", from);
    return twiml();
  }
  if (["HELP", "INFO"].includes(body)) return twiml(SMS_HELP_REPLY);
  return twiml();
});
