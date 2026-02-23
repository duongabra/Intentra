import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client (browser): only NEXT_PUBLIC_* are available in the browser. Add to .env.local:
// NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
const clientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const clientAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function createSupabaseClient(): SupabaseClient {
  if (!clientUrl || !clientAnonKey) {
    throw new Error(
      "Missing Supabase env. Add to .env.local: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (same as Project URL and anon key in Supabase → Settings → API)."
    );
  }
  return createClient(clientUrl, clientAnonKey);
}

export const supabase = createSupabaseClient();

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Admin: use in API routes only. Bypasses RLS, full DB access. Never expose to client.
export const supabaseAdmin =
  url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;

/** API routes: get user from Bearer token. Returns null if invalid. */
export async function getServerAuthUser(
  token: string | null
): Promise<{ id: string; email: string } | null> {
  if (!token?.startsWith("Bearer ")) return null;
  const jwt = token.slice(7).trim();
  if (!jwt || !url || !anonKey) return null;
  const authClient = createClient(url, anonKey);
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(jwt);
  if (error || !user) return null;
  return { id: user.id, email: user.email ?? "" };
}
