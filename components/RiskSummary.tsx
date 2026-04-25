import type { CompatibilityReport } from "@/lib/types";

type Props = {
  report: CompatibilityReport | null;
};

export function RiskSummary({ report }: Props) {
  const risks = report?.key_risks ?? [];
  if (risks.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        {report ? "No key risks were flagged in this pass." : "Risks appear after analysis completes."}
      </div>
    );
  }
  return (
    <ul className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      {risks.map((r) => (
        <li key={r} className="flex gap-2 text-sm text-zinc-800">
          <span className="text-amber-500">▸</span>
          {r}
        </li>
      ))}
    </ul>
  );
}
