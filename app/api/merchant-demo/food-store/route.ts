import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Demo food store: returns project (food) + products (project_type = 'food').
 * Router /merchant/food-store gọi API này, không phụ thuộc project_id.
 */
export async function GET() {
  const admin = supabaseAdmin;
  if (!admin) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  const { data: project, error: projError } = await admin
    .from("projects")
    .select("id, name, project_type, domain, endpoint, api_key")
    .eq("project_type", "food")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (projError || !project) {
    return NextResponse.json(
      { error: "Food store project not found. Run reset-food-and-seed-100.sql." },
      { status: 404 }
    );
  }

  const { data: products, error: prodError } = await admin
    .from("products")
    .select("id, name, price, category, project_type")
    .eq("project_type", "food")
    .order("name")
    .limit(100);

  if (prodError) {
    return NextResponse.json({ error: prodError.message }, { status: 500 });
  }

  return NextResponse.json({
    store: { id: project.id, name: project.name, project_type: project.project_type },
    products: products ?? [],
  });
}
