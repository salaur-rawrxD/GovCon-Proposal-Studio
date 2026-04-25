"use client";

import { useEffect, useState } from "react";
import type { CapabilityProfile } from "@/lib/types";

export default function KnowledgeBasePage() {
  const [profile, setProfile] = useState<CapabilityProfile | null>(null);
  const [narrative, setNarrative] = useState("");
  const [diff, setDiff] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/capability-profile");
      const j = (await res.json()) as { profile: CapabilityProfile | null };
      if (j.profile) {
        setProfile(j.profile);
        setNarrative(j.profile.narrative);
        setDiff(j.profile.differentiators.join("\n"));
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading profile…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Company capability profile</h1>
      <p className="text-sm text-zinc-600">
        This profile is used when matching opportunities. It is never replaced by raw RFP text without your review.
      </p>
      <div>
        <label className="text-sm font-medium">Narrative</label>
        <textarea
          className="mt-1 w-full rounded border border-zinc-300 p-2 text-sm"
          rows={6}
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Differentiators (one per line)</label>
        <textarea
          className="mt-1 w-full rounded border border-zinc-300 p-2 text-sm"
          rows={4}
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
        />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-emerald-700">Saved.</p>}
      <button
        type="button"
        disabled={saving}
        className="rounded-lg bg-cyan-800 px-4 py-2 text-sm text-white"
        onClick={async () => {
          setSaving(true);
          setErr(null);
          setOk(false);
          const res = await fetch("/api/capability-profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: profile?.title ?? "Capability profile",
              narrative,
              differentiators: diff
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            }),
          });
          setSaving(false);
          if (!res.ok) {
            const j = await res.json();
            setErr(j.error ? JSON.stringify(j.error) : "Failed");
            return;
          }
          setOk(true);
        }}
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}
