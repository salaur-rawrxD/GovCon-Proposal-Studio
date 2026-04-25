import type { ComplianceRequirement } from "@/lib/types";

const statusClass: Record<ComplianceRequirement["status"], string> = {
  met: "text-emerald-800 bg-emerald-50",
  partial: "text-amber-800 bg-amber-50",
  gap: "text-red-800 bg-red-50",
};

type Props = {
  items: ComplianceRequirement[];
};

export function ComplianceMatrix({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 p-4 text-sm text-zinc-600">
        Compliance items populate after you run analysis.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600">
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Requirement</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Source</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2 text-zinc-800">{row.category}</td>
              <td className="px-4 py-2 text-zinc-800">{row.requirement}</td>
              <td className="px-4 py-2">
                <span className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${statusClass[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-2 text-xs text-zinc-500">{row.source_hint ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
