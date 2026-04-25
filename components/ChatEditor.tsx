"use client";

import { useState } from "react";

type Props = {
  opportunityId: string;
  sectionKey: string;
  sectionContent: string;
  onApplied: (next: string) => void;
};

export function ChatEditor({ opportunityId, sectionKey, sectionContent, onApplied }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proposal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          sectionKey,
          message: message.trim(),
          currentContent: sectionContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? data.error ?? "Request failed");
      onApplied(data.content as string);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm font-medium text-zinc-900">Chat editor</p>
      <p className="text-xs text-zinc-500">Ask for tone, emphasis, or structural changes. No internal agent details.</p>
      <form onSubmit={submit} className="mt-3 flex flex-1 flex-col gap-2">
        <textarea
          className="min-h-[80px] flex-1 rounded-lg border border-zinc-200 bg-white p-2 text-sm"
          placeholder="e.g. Shorten the second paragraph and stress agile governance."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-800 disabled:opacity-50"
        >
          {loading ? "Applying…" : "Apply to section"}
        </button>
      </form>
    </div>
  );
}
