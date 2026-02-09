"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupSchoolPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#16a34a");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, slug, primaryColor }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data?.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/app/dashboard");
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-semibold">Create your School</h1>
      <p className="text-sm opacity-70 mt-1">
        This will create your first organization (tenant).
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 border rounded-xl p-5"
      >
        <div className="space-y-2">
          <label className="text-sm">School Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. ABC Public School"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Slug (unique)</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. abc-public-school"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="text-xs opacity-60">
            Tip: leave empty, we’ll auto-generate from name.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Primary Color</label>
          <input
            className="h-10 w-20 border rounded-lg px-2 py-1"
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
        </div>

        <button
          className="w-full border rounded-lg px-3 py-2"
          disabled={loading}
          type="submit"
        >
          {loading ? "Creating..." : "Create School"}
        </button>

        {msg && <p className="text-sm">{msg}</p>}
      </form>
    </div>
  );
}
