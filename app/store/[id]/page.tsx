"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Store {
  id: string;
  name: string;
  project_type: string;
}
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}
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

export default function StorePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const res = await fetch(`/api/stores/${id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStore(data.store ?? null);
      setProducts(data.products ?? []);
      setTickets(data.tickets ?? []);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }
  if (!store) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-gray-500">Không tìm thấy cửa hàng.</p>
        <Link href="/home" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Về trang chủ
        </Link>
      </main>
    );
  }

  const isTravel = store.project_type === "travel";

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/home" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Về trang chủ
        </Link>
        <h1 className="text-2xl font-bold mb-2">{store.name}</h1>
        <p className="text-gray-600 mb-6">
          {isTravel ? "Vé máy bay" : "Đồ ăn"} – Xem catalog bên dưới. Đặt hàng qua chat.
        </p>

        {isTravel ? (
          <ul className="space-y-3 mb-8">
            {tickets.map((t) => (
              <li key={t.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-gray-600">
                  {t.from_location} → {t.to_location}
                  {t.departure_at && ` · ${t.departure_at}`}
                </p>
                <p className="text-green-700 font-semibold mt-1">{formatVnd(t.price)}</p>
              </li>
            ))}
            {tickets.length === 0 && (
              <p className="text-gray-500 text-sm">Chưa có chuyến bay.</p>
            )}
          </ul>
        ) : (
          <ul className="space-y-3 mb-8">
            {products.map((p) => (
              <li key={p.id} className="rounded-lg border bg-white p-4 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.category}</p>
                </div>
                <p className="text-green-700 font-semibold">{formatVnd(p.price)}</p>
              </li>
            ))}
            {products.length === 0 && (
              <p className="text-gray-500 text-sm">Chưa có sản phẩm.</p>
            )}
          </ul>
        )}

        <Link
          href="/food-demo"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
        >
          Đặt hàng qua chat
        </Link>
      </div>
    </main>
  );
}
