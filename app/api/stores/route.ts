import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Public list of stores (projects) for home page. Always reads from DB, no cache. */
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
  const res = NextResponse.json({ stores: data ?? [] });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return res;
}
