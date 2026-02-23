import { supabaseAdmin } from "@/lib/supabase";
import type { TravelListing } from "@/types";

export async function getTravelListings(
  projectId: string,
  limit = 100
): Promise<TravelListing[]> {
  const admin = supabaseAdmin;
  if (!admin) return [];
  const { data, error } = await admin
    .from("travel_listings")
    .select("id, project_id, name, from_location, to_location, price, departure_at, created_at")
    .eq("project_id", projectId)
    .limit(limit);
  if (error || !data) return [];
  return data as TravelListing[];
}
