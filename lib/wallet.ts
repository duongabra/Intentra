import { supabaseAdmin } from "./supabase";

const db = () => {
  if (!supabaseAdmin) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return supabaseAdmin;
};

/** Get user balance (VND). Returns 0 if no wallet row. */
export async function getBalance(userId: string): Promise<number> {
  const { data } = await db()
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();
  return data?.balance ?? 0;
}

/**
 * Deduct amount from user wallet. Returns new balance if success, null if insufficient.
 * Simple: one update, no extra wallet logic.
 */
export async function deduct(userId: string, amount: number): Promise<number | null> {
  if (amount <= 0) return null;
  const { data: row } = await db()
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();
  if (!row || row.balance < amount) return null;
  const newBalance = row.balance - amount;
  const { error } = await db()
    .from("wallets")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) return null;
  return newBalance;
}
