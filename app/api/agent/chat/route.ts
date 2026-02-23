import { NextRequest, NextResponse } from "next/server";
import { chatWithGroq } from "@/lib/groq";
import { deduct } from "@/lib/wallet";
import { supabaseAdmin } from "@/lib/supabase";
import { getFoodProducts } from "@/lib/agent/catalog/getFoodProducts";
import { getTravelListings } from "@/lib/agent/catalog/getTravelListings";
import { buildFoodPrompt, parseFoodResponse } from "@/lib/agent/prompts/food";
import { buildTravelPrompt, parseTravelResponse } from "@/lib/agent/prompts/travel";
import type { Product } from "@/types";
import type { TravelListing } from "@/types";
import type { AgentChatResponse } from "@/types";

/** Detect intent from message: "food" or "travel". Used when chat from our platform (no x-api-key). */
async function detectIntent(message: string): Promise<"food" | "travel"> {
  const raw = await chatWithGroq([
    {
      role: "system",
      content:
        "You are an intent classifier. Reply with ONLY one word: food or travel. food = user wants to buy food, ingredients, groceries. travel = user wants to buy flight tickets, book flights. No other text.",
    },
    { role: "user", content: message },
  ]);
  const t = raw.trim().toLowerCase();
  if (t.includes("travel")) return "travel";
  return "food";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!message || !userId) {
      return NextResponse.json(
        { error: "message and userId are required" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    const apiKey = req.headers.get("x-api-key")?.trim();
    let project: { id: string; project_type: string } | null = null;

    if (apiKey) {
      const { data, error } = await admin
        .from("projects")
        .select("id, project_type")
        .eq("api_key", apiKey)
        .limit(1)
        .single();
      if (!error && data) project = data;
    }

    if (!project) {
      const intent = await detectIntent(message);
      const { data } = await admin
        .from("projects")
        .select("id, project_type")
        .eq("project_type", intent)
        .limit(1)
        .single();
      project = data;
    }

    if (!project) {
      return NextResponse.json(
        { error: apiKey ? "Invalid API key" : "No project found for this request. Add a project (food or travel) in Dashboard." },
        { status: 401 }
      );
    }

    if (project.project_type === "travel") {
      return handleTravel(admin, project.id, userId, message);
    }
    return handleFood(admin, project.id, userId, message);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handleFood(
  admin: NonNullable<typeof supabaseAdmin>,
  projectId: string,
  userId: string,
  message: string
) {
  const products = await getFoodProducts(projectId, 100);
  if (products.length === 0) {
    return NextResponse.json(
      { error: "No products available" },
      { status: 500 }
    );
  }

  const prompt = buildFoodPrompt(message, products);
  const raw = await chatWithGroq([{ role: "user", content: prompt }]);
  const selected = parseFoodResponse(raw);
  if (selected.length === 0) {
    return NextResponse.json({
      items: [],
      total: 0,
      remaining_balance: 0,
      message: "Không chọn được sản phẩm phù hợp. Vui lòng thử lại.",
    } satisfies AgentChatResponse);
  }

  const byId = new Map<string, Product>(products.map((p) => [p.id, p]));
  let total = 0;
  const items: Array<{ product_id: string; quantity: number; name?: string; price?: number }> = [];
  for (const { product_id, quantity } of selected) {
    const p = byId.get(product_id);
    if (!p || quantity <= 0) continue;
    const subtotal = p.price * quantity;
    total += subtotal;
    items.push({ product_id: p.id, quantity, name: p.name, price: p.price });
  }
  if (total === 0) {
    return NextResponse.json({
      items: [],
      total: 0,
      remaining_balance: 0,
      message: "Không có sản phẩm hợp lệ.",
    } satisfies AgentChatResponse);
  }

  const remaining = await deduct(userId, total);
  if (remaining === null) {
    return NextResponse.json(
      { error: "Insufficient balance", message: "Số dư ví không đủ. Vui lòng nạp thêm." },
      { status: 402 }
    );
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      project_id: projectId,
      total_amount: total,
      status: "completed",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  for (const it of items) {
    await admin.from("order_items").insert({
      order_id: order.id,
      product_id: it.product_id,
      quantity: it.quantity,
      price: it.price ?? 0,
    });
  }

  return NextResponse.json({
    items,
    total,
    remaining_balance: remaining,
    message: "Đã tạo đơn thành công",
  } satisfies AgentChatResponse);
}

async function handleTravel(
  admin: NonNullable<typeof supabaseAdmin>,
  projectId: string,
  userId: string,
  message: string
) {
  const listings = await getTravelListings(projectId, 100);
  if (listings.length === 0) {
    return NextResponse.json(
      { error: "No flights available" },
      { status: 500 }
    );
  }

  const prompt = buildTravelPrompt(message, listings);
  const raw = await chatWithGroq([{ role: "user", content: prompt }]);
  const selected = parseTravelResponse(raw);
  if (selected.length === 0) {
    return NextResponse.json({
      tickets: [],
      total: 0,
      remaining_balance: 0,
      message: "Không chọn được chuyến bay phù hợp. Vui lòng thử lại.",
    } satisfies AgentChatResponse);
  }

  const byId = new Map<string, TravelListing>(listings.map((l) => [l.id, l]));
  let total = 0;
  const tickets: Array<{ listing_id: string; quantity: number; name?: string; price?: number }> = [];
  for (const { listing_id, quantity } of selected) {
    const l = byId.get(listing_id);
    if (!l || quantity <= 0) continue;
    const subtotal = l.price * quantity;
    total += subtotal;
    tickets.push({ listing_id: l.id, quantity, name: l.name, price: l.price });
  }
  if (total === 0) {
    return NextResponse.json({
      tickets: [],
      total: 0,
      remaining_balance: 0,
      message: "Không có vé hợp lệ.",
    } satisfies AgentChatResponse);
  }

  const remaining = await deduct(userId, total);
  if (remaining === null) {
    return NextResponse.json(
      { error: "Insufficient balance", message: "Số dư ví không đủ. Vui lòng nạp thêm." },
      { status: 402 }
    );
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      project_id: projectId,
      total_amount: total,
      status: "completed",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order" },
      { status: 500 }
    );
  }

  for (const t of tickets) {
    await admin.from("order_ticket_items").insert({
      order_id: order.id,
      listing_id: t.listing_id,
      quantity: t.quantity,
      price: t.price ?? 0,
    });
  }

  return NextResponse.json({
    tickets,
    total,
    remaining_balance: remaining,
    message: "Đã đặt vé thành công",
  } satisfies AgentChatResponse);
}
