import { NextRequest, NextResponse } from "next/server";
import { getServerAuthUser } from "@/lib/supabase";
import { getBalance } from "@/lib/wallet";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    const user = await getServerAuthUser(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const balance = await getBalance(user.id);
    return NextResponse.json({ balance });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
