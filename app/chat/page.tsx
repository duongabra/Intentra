"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { AgentChatResponse } from "@/types";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  order?: AgentChatResponse;
}

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default function ChatPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (!profile || profile.role !== "user") {
        router.replace("/login");
        return;
      }
      const res = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance ?? 0);
      }
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.replace("/login");
      return;
    }

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId: session.user.id,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.message || data.error || "Có lỗi xảy ra.",
          },
        ]);
        setError(data.error || data.message);
        setSending(false);
        return;
      }

      const order = data as AgentChatResponse;
      if (order.remaining_balance != null) setBalance(order.remaining_balance);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: order.message,
          order,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err instanceof Error ? err.message : "Lỗi kết nối.",
        },
      ]);
      setError("Request failed");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <h2 className="font-semibold text-gray-800 mb-2">Ví của tôi</h2>
        <p className="text-2xl font-bold text-green-700">
          {balance != null ? formatVnd(balance) : "—"}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Chat mua đồ ăn hoặc vé máy bay. Hệ thống tự chọn nơi phù hợp.
        </p>
      </aside>

      <section className="flex-1 flex flex-col max-w-2xl mx-auto w-full bg-white shadow">
        <header className="p-4 border-b">
          <h1 className="text-lg font-bold">Intentra Chat</h1>
          <p className="text-sm text-gray-500">Ví dụ: &quot;Tôi cần nguyên liệu nấu mâm cơm cúng gia tiên&quot; hoặc &quot;Mua vé máy bay đi HCM&quot;</p>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm">Nhập tin nhắn bên dưới để bắt đầu.</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="text-sm">{m.text}</p>
                {m.order && (m.order.items?.length || m.order.tickets?.length) ? (
                  <div className="mt-2 pt-2 border-t border-gray-300 text-sm">
                    {m.order.items?.map((it, j) => (
                      <div key={j} className="flex justify-between gap-4">
                        <span>{it.name ?? it.product_id}</span>
                        <span>×{it.quantity}</span>
                        <span>{it.price != null ? formatVnd(it.price * it.quantity) : ""}</span>
                      </div>
                    ))}
                    {m.order.tickets?.map((t, j) => (
                      <div key={j} className="flex justify-between gap-4">
                        <span>{t.name ?? t.listing_id}</span>
                        <span>×{t.quantity}</span>
                        <span>{t.price != null ? formatVnd(t.price * t.quantity) : ""}</span>
                      </div>
                    ))}
                    <p className="font-semibold mt-1">Tổng: {formatVnd(m.order.total)}</p>
                    <p className="text-green-700">Số dư còn lại: {formatVnd(m.order.remaining_balance)}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="px-4 py-1 text-sm text-red-600 bg-red-50">{error}</p>
        )}

        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "…" : "Gửi"}
          </button>
        </form>
      </section>
    </main>
  );
}
