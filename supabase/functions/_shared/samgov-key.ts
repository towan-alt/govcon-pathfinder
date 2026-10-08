// AES-GCM encryption for the stored SAM.gov API key. Server-side only.
// Future opportunity-fetching code should call getSamgovApiKey().
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

async function cryptoKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("SAMGOV_KEY_ENCRYPTION_SECRET");
  if (!secret) throw new Error("encryption_not_configured");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
}

const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function encryptKey(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await cryptoKey(), new TextEncoder().encode(plain)));
  return `v1:${b64(iv)}:${b64(ct)}`;
}

export async function decryptKey(stored: string): Promise<string> {
  const [, iv, ct] = stored.split(":");
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await cryptoKey(), unb64(ct));
  return new TextDecoder().decode(pt);
}

/** Returns the decrypted active key, or null when none/disabled. Never log the result. */
export async function getSamgovApiKey(admin: SupabaseClient): Promise<string | null> {
  const { data } = await admin.from("samgov_api_credentials").select("api_key_encrypted,is_active").eq("provider", "samgov").maybeSingle();
  if (!data || !data.is_active) return null;
  return decryptKey(data.api_key_encrypted);
}
