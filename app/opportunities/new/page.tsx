"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">New opportunity</h1>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) {
            setErr("Title is required");
            return;
          }
          setLoading(true);
          setErr(null);
          const res = await fetch("/api/opportunities/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title.trim(), description: description.trim() || null }),
          });
          const j = (await res.json()) as { opportunity?: { id: string }; error?: unknown };
          setLoading(false);
          if (!res.ok) {
            setErr(j.error ? String(j.error) : "Failed to create");
            return;
          }
          if (j.opportunity) router.push(`/opportunities/${j.opportunity.id}`);
        }}
      >
        <div>
          <label className="text-sm font-medium text-zinc-800">Title</label>
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Solicitation or internal name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-800">Description (optional)</label>
          <textarea
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Short notes (internal)"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-800 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create and continue"}
        </button>
      </form>
    </div>
  );
}
