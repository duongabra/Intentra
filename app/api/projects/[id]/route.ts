import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";

async function getProjectAndCheckOwner(
  admin: NonNullable<ReturnType<typeof import("@/lib/supabase").supabaseAdmin>>,
  projectId: string,
  userId: string
) {
  const { data: project, error } = await admin
    .from("projects")
    .select("merchant_id")
    .eq("id", projectId)
    .single();
  if (error || !project) return null;
  if (project.merchant_id !== userId) return null;
  return project;
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }
    const token = _req.headers.get("authorization");
    const user = await getServerAuthUser(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }
    const project = await getProjectAndCheckOwner(admin, projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const { error: updateError } = await admin
      .from("projects")
      .update({ is_hidden: false })
      .eq("id", projectId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const token = _req.headers.get("authorization");
    const user = await getServerAuthUser(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const project = await getProjectAndCheckOwner(admin, projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { error: updateError } = await admin
      .from("projects")
      .update({ is_hidden: true })
      .eq("id", projectId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
