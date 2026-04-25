import type { BidRecommendation, CompatibilityReport } from "@/lib/types";

const recStyle: Record<BidRecommendation, string> = {
  bid: "bg-emerald-100 text-emerald-900",
  no_bid: "bg-amber-100 text-amber-900",
  review: "bg-cyan-100 text-cyan-900",
};

type Props = {
  report: CompatibilityReport | null;
};

export function CompatibilityScoreCard({ report }: Props) {
  if (!report) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
        Run analysis to see compatibility, bid direction, and fit summary.
      </div>
    );
  }
  return (
    <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Compatibility score</p>
        <p className="mt-1 text-4xl font-semibold text-zinc-900">{report.compatibility_score}</p>
        <p className="text-sm text-zinc-600">0–100 fit vs. company profile</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Bid / no-bid</p>
        <p
          className={`mt-2 inline-block rounded-md px-3 py-1 text-sm font-medium capitalize ${
            recStyle[report.bid_recommendation]
          }`}
        >
          {report.bid_recommendation.replace("_", " ")}
        </p>
        <p className="mt-2 text-sm text-zinc-700">{report.recommendation_rationale}</p>
      </div>
      <div className="md:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Opportunity (summary)</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-800">{report.opportunity_summary}</p>
      </div>
      <div className="md:col-span-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Fit</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-800">{report.fit_summary}</p>
      </div>
    </div>
  );
}
