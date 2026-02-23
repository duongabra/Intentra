import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/** Public list of stores (projects) for home page. */
export async function GET() {
  const admin = supabaseAdmin;
  if (!admin) {
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }
  const { data, error } = await admin
    .from("projects")
    .select("id, name, project_type")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ stores: data ?? [] });
}
