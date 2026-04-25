"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";

export default function DashboardPage() {
  const [rows, setRows] = useState<Opportunity[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/opportunities");
      const j = (await res.json()) as { opportunities: Opportunity[]; error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Load failed");
        return;
      }
      setRows(j.opportunities);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-600">Opportunities and draft status at a glance.</p>
        </div>
        <Link
          href="/opportunities/new"
          className="rounded-lg bg-cyan-800 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-900"
        >
          New opportunity
        </Link>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        {rows.length === 0 && !err && <li className="px-4 py-6 text-sm text-zinc-600">No opportunities yet. Create one to begin.</li>}
        {rows.map((o) => (
          <li key={o.id}>
            <Link href={`/opportunities/${o.id}`} className="block px-4 py-3 hover:bg-zinc-50">
              <p className="font-medium text-zinc-900">{o.title}</p>
              <p className="text-xs text-zinc-500">Status: {o.status} · {new Date(o.created_at).toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
