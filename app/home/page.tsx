"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Store {
  id: string;
  name: string;
  project_type: string;
}

export default function HomePage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch("/api/stores");
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores ?? []);
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Chào bạn</h1>
        <p className="text-gray-600 mb-8">Chọn cửa hàng để xem hoặc chat để đặt hàng.</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Hệ sinh thái của chúng tôi bao gồm các cửa hàng sau</h2>
          {stores.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có cửa hàng nào.</p>
          ) : (
            <ul className="space-y-2">
              {stores.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/store/${s.id}`}
                    className="block rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 transition"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {s.project_type === "travel" ? "Vé máy bay" : "Đồ ăn"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="border-t pt-6">
          <Link
            href="/food-demo"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition"
          >
            Let&apos;s chat now
          </Link>
        </div>
      </div>
    </main>
  );
}
