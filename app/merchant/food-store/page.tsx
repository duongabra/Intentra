"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default function MerchantFoodStorePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState<string>("Demo Food Store");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const res = await fetch("/api/merchant-demo/food-store", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStoreName(data.store?.name ?? "Demo Food Store");
        setProducts(data.products ?? []);
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
          Đồ ăn – Xem catalog bên dưới. Đặt hàng qua chat.
        </p>

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

        <Link
          href="/chat"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
        >
          Đặt hàng qua chat
        </Link>
      </div>
    </main>
  );
}
