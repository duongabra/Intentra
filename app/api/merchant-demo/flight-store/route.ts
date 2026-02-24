import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Demo flight store: returns project (travel) + travel_listings (100 chuyến bay).
 * Router /merchant/flight-store gọi API này.
 */
export async function GET() {
  const admin = supabaseAdmin;
  if (!admin) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const { data: project, error: projError } = await admin
    .from("projects")
    .select("id, name, project_type, domain, endpoint, api_key")
    .eq("project_type", "travel")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (projError || !project) {
    return NextResponse.json(
      { error: "Flight store project not found. Run seed-flight-100.sql or seed-travel.sql." },
      { status: 404 }
    );
  }

  const { data: tickets, error: tickError } = await admin
    .from("travel_listings")
    .select("id, name, from_location, to_location, price, departure_at")
    .eq("project_id", project.id)
    .order("departure_at", { ascending: true })
    .limit(100);

  if (tickError) {
    return NextResponse.json({ error: tickError.message }, { status: 500 });
  }

  return NextResponse.json({
    store: { id: project.id, name: project.name, project_type: project.project_type },
    tickets: tickets ?? [],
  });
}
