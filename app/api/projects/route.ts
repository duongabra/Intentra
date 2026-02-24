import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    const user = await getServerAuthUser(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "merchant") {
      return NextResponse.json({ error: "Merchant role required" }, { status: 403 });
    }

    const { data: projects, error } = await admin
      .from("projects")
      .select("id, name, domain, endpoint, api_key, project_type, created_at")
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const withHidden = (projects ?? []).map((p) => ({
      ...p,
      is_hidden: (p as { is_hidden?: boolean }).is_hidden ?? false,
    }));
    return NextResponse.json({ projects: withHidden });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
