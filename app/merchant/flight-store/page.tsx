"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Ticket {
  id: string;
  name: string;
  from_location: string;
  to_location: string;
  price: number;
  departure_at: string | null;
}

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default function MerchantFlightStorePage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [storeName, setStoreName] = useState<string>("Demo Vé máy bay");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const res = await fetch("/api/merchant-demo/flight-store", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStoreName(data.store?.name ?? "Demo Vé máy bay");
        setTickets(data.tickets ?? []);
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/home" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Về trang chủ
        </Link>
        <h1 className="text-2xl font-bold mb-2">{storeName}</h1>
        <p className="text-gray-600 mb-6">
          Vé máy bay – Xem danh sách chuyến bên dưới (random tháng 3, địa điểm VN). Đặt vé qua chat.
        </p>

        <ul className="space-y-3 mb-8">
          {tickets.map((t) => (
            <li key={t.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="font-medium text-gray-900">{t.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {t.from_location} → {t.to_location}
                {t.departure_at && <span className="text-gray-500"> · {t.departure_at}</span>}
              </p>
              <p className="text-green-700 font-semibold mt-2">{formatVnd(t.price)}</p>
            </li>
          ))}
          {tickets.length === 0 && (
            <p className="text-gray-500 text-sm">Chưa có chuyến bay. Chạy seed-flight-100.sql trong Supabase.</p>
          )}
        </ul>

        <Link
          href="/chat"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
        >
          Đặt vé qua chat
        </Link>
      </div>
    </main>
  );
}
