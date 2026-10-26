import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * Authorizes a SAM.gov admin request. Accepts a signed-in admin user, or an internal call from
 * the samgov-pipeline function that presents the service-role key (never available to browsers).
 * Returns the service-role client, or the HTTP status to reject with.
 */
export async function authorizeSamgovAdmin(req: Request): Promise<{ db: SupabaseClient } | { status: number }> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return { status: 401 };
  const db = createClient(url, service);
  if (authHeader === `Bearer ${service}`) return { db };
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return { status: 401 };
  const { data: isAdmin } = await db.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  return isAdmin ? { db } : { status: 403 };
}
