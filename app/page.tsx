import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Intentra Demo</h1>
      <p className="text-gray-600 mb-6">AI Agent Commerce Platform</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
