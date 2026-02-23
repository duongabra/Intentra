"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const API_ENDPOINT = "http://localhost:3000/api/agent/chat";

interface Project {
  id: string;
  name: string;
  domain: string | null;
  endpoint: string | null;
  api_key: string | null;
  project_type: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<"food" | "travel">("food");
  const [copyDone, setCopyDone] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      if (!profile || profile.role !== "merchant") {
        router.replace("/login");
        return;
      }
      await fetchProjects(session.access_token);
      setLoading(false);
    })();
  }, [router]);

  async function fetchProjects(token: string) {
    const res = await fetch("/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    setProjects(data.projects ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedKey(null);
    setFormLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Session expired");
      setFormLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim() || "My Project",
          domain: domain.trim() || null,
          description: description.trim() || null,
          project_type: projectType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to create project");
        setFormLoading(false);
        return;
      }
      setCreatedKey(data.apiKey ?? null);
      setName("");
      setDomain("");
      setDescription("");
      await fetchProjects(session.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
    setFormLoading(false);
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return iso;
    }
  }

  async function handleDelete(projectId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setError(null);
        await fetchProjects(session.access_token);
      } else {
        setError((await res.json().catch(() => ({}))).error ?? "Delete failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Merchant Dashboard</h1>

        <section className="bg-white rounded-lg border p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create Website</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="My Food Store"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="localhost"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
              <input
                type="text"
                value={API_ENDPOINT}
                readOnly
                className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as "food" | "travel")}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="food">Đồ ăn</option>
                <option value="travel">Vé máy bay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Mô tả ngắn..."
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={formLoading}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {formLoading ? "Creating…" : "Create Project"}
            </button>
          </form>

          {createdKey && (
            <div className="mt-4 p-4 rounded bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-1">Your API Key:</p>
              <code className="block text-sm text-green-900 break-all mb-2">{createdKey}</code>
              <button
                type="button"
                onClick={() => copyKey(createdKey)}
                className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
              >
                {copyDone ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Project List</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có project. Tạo project ở trên.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Domain</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">API Key</th>
                    <th className="pb-2 pr-4">Created At</th>
                    <th className="pb-2 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 pr-4 font-medium">{p.name}</td>
                      <td className="py-2 pr-4 text-gray-600">{p.domain || "—"}</td>
                      <td className="py-2 pr-4">{p.project_type === "travel" ? "Vé máy bay" : "Đồ ăn"}</td>
                      <td className="py-2 pr-4">
                        <code className="text-xs break-all">{p.api_key ?? "—"}</code>
                        {p.api_key && (
                          <button
                            type="button"
                            onClick={() => copyKey(p.api_key!)}
                            className="ml-1 text-blue-600 hover:underline text-xs"
                          >
                            Copy
                          </button>
                        )}
                      </td>
                      <td className="py-2 text-gray-600">{formatDate(p.created_at)}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="text-red-600 hover:underline text-xs disabled:opacity-50"
                        >
                          {deletingId === p.id ? "…" : "Xóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
