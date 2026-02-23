import { supabaseAdmin } from "@/lib/supabase";
import type { Product } from "@/types";

/** Get products for a project (multi-merchant: each project has its own catalog). */
export async function getFoodProducts(
  projectId: string,
  limit = 100
): Promise<Product[]> {
  const admin = supabaseAdmin;
  if (!admin) return [];
  const { data, error } = await admin
    .from("products")
    .select("id, project_id, name, price, category, created_at")
    .eq("project_id", projectId)
    .limit(limit);
  if (error || !data) return [];
  return data as Product[];
}
