import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/** Public store detail + catalog (products or travel_listings). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Store ID required" }, { status: 400 });
  }
  const admin = supabaseAdmin;
  if (!admin) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }
  const { data: project, error: projError } = await admin
    .from("projects")
    .select("id, name, project_type")
    .eq("id", id)
    .single();
  if (projError || !project) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (project.project_type === "travel") {
    const { data: listings } = await admin
      .from("travel_listings")
      .select("id, name, from_location, to_location, price, departure_at")
      .eq("project_id", id)
      .limit(100);
    return NextResponse.json({ store: project, tickets: listings ?? [] });
  }
  const { data: products } = await admin
    .from("products")
    .select("id, name, price, category")
    .eq("project_id", id)
    .limit(100);
  return NextResponse.json({ store: project, products: products ?? [] });
}
