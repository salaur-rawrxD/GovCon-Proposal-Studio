import type { KeyDeadline } from "@/lib/mock/types";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateString(s: string): boolean {
  if (!s || !ISO.test(s.trim())) return false;
  const t = Date.parse(s.trim() + "T12:00:00");
  return !Number.isNaN(t);
}

export function parseMilestoneSortKey(dateStr: string): number {
  const t = isIsoDateString(dateStr) ? Date.parse(dateStr.trim() + "T12:00:00") : Number.NaN;
  if (!Number.isNaN(t)) return t;
  return Number.POSITIVE_INFINITY;
}

function slugId(label: string, i: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return `m_${i}_${base || "milestone"}`;
}

/** Normalize RFP / analysis snapshot items into storable project milestones. */
export function keyDeadlinesFromSimpleSnapshot(
  items: { label: string; date: string }[],
  source: KeyDeadline["source"] = "solicitation"
): KeyDeadline[] {
  return items.map((d, i) => ({
    id: slugId(d.label, i),
    label: d.label,
    date: d.date,
    source,
  }));
}

export function projectMilestonesToSnapshotRows(deadlines: KeyDeadline[]): { label: string; date: string }[] {
  return deadlines.map((k) => ({
    label: k.label,
    date: k.note ? `${k.date} — ${k.note}` : k.date,
  }));
}

/** Standard milestone labels aligned with how solicitations are usually structured (dates filled from RFP or TBD). */
export function baseAnalysisMilestoneDefaults(dueDate: string): { label: string; date: string }[] {
  return [
    { label: "Pre-proposal / industry day (if any)", date: "TBD — see agency portal" },
    { label: "Questions (Q&A) due", date: "TBD — see agency portal" },
    { label: "Proposals / bids due", date: dueDate },
    { label: "Oral presentation / site visit (if any)", date: "TBD per Section L" },
  ];
}

export function defaultMilestonesForNewProject(dueDate: string): KeyDeadline[] {
  return keyDeadlinesFromSimpleSnapshot(
    baseAnalysisMilestoneDefaults(dueDate).map((d) => ({ label: d.label, date: d.date })),
    "solicitation"
  );
}

/**
 * The analysis tab should show the same schedule as the workspace when the user has a saved schedule;
 * otherwise show template defaults.
 */
export function buildAnalysisSnapshotMilestones(p: {
  keyDeadlines: KeyDeadline[];
  dueDate: string;
}): { label: string; date: string }[] {
  if (p.keyDeadlines.length > 0) {
    return projectMilestonesToSnapshotRows(p.keyDeadlines);
  }
  return baseAnalysisMilestoneDefaults(p.dueDate);
}
