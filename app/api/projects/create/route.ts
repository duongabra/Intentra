import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const domain = typeof body.domain === "string" ? body.domain.trim() : null;
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const project_type = body.project_type === "travel" ? "travel" : "food";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const apiKey = "sk_demo_" + crypto.randomBytes(16).toString("hex");
    const endpoint = "http://localhost:3000/api/agent/chat";

    const { data: project, error } = await admin
      .from("projects")
      .insert({
        merchant_id: user.id,
        project_type,
        name,
        domain: domain || null,
        endpoint,
        api_key: apiKey,
      })
      .select("id, api_key")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (project?.id) {
      if (project_type === "food") {
        const { data: templateProducts } = await admin
          .from("products")
          .select("name, price, category")
          .limit(100);
        if (templateProducts?.length) {
          await admin.from("products").insert(
            templateProducts.map((p) => ({
              project_id: project.id,
              name: p.name,
              price: p.price,
              category: p.category,
            }))
          );
        }
      } else if (project_type === "travel") {
        const { data: templateListings } = await admin
          .from("travel_listings")
          .select("name, from_location, to_location, price, departure_at")
          .limit(100);
        if (templateListings?.length) {
          await admin.from("travel_listings").insert(
            templateListings.map((l) => ({
              project_id: project.id,
              name: l.name,
              from_location: l.from_location,
              to_location: l.to_location,
              price: l.price,
              departure_at: l.departure_at,
            }))
          );
        }
      }
    }

    return NextResponse.json({ apiKey: project?.api_key ?? apiKey });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
