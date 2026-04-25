import { withAiMode, completeJsonString } from "@/lib/ai/client";
import { capabilityFit } from "@/lib/ai/prompts";

export type CompatibilityResult = {
  compatibilityScore: number;
  fitSummary: string;
  keyRisks: string[];
  /** Internal labels only; not shown to the user in raw form */
  gapThemes: string[];
};

function mockFit(rfpText: string, profileNarrative: string): CompatibilityResult {
  const depth = rfpText.length + profileNarrative.length;
  const score = Math.min(95, 58 + Math.floor((depth % 37) * 0.5));
  return {
    compatibilityScore: score,
    fitSummary:
      "The opportunity aligns with our cloud and agile delivery strengths; some advanced cyber testing scope is lighter in current past performance, which is manageable with a teaming strategy.",
    keyRisks: [
      "Page limits are tight; requires disciplined scope in technical approach.",
      "Past performance recency for classified-adjacent work may need a subcontractor to strengthen.",
    ],
    gapThemes: ["ICD-503 documentation depth", "Load testing at production scale"],
  };
}

export async function runCompatibilityAgent(input: {
  rfpSynthesis: string;
  fullRfpExcerpt: string;
  profileNarrative: string;
}): Promise<CompatibilityResult> {
  return withAiMode({
    mock: () => mockFit(input.fullRfpExcerpt, input.profileNarrative),
    real: async () => {
      const raw = await completeJsonString({
        system: capabilityFit.system,
        user: JSON.stringify({
          task: "Return JSON: compatibilityScore (0-100), fitSummary, keyRisks[], gapThemes[].",
          profile: input.profileNarrative,
          rfp: input.rfpSynthesis,
          rfpExcerpt: input.fullRfpExcerpt.slice(0, 60_000),
        }),
      });
      return JSON.parse(raw) as CompatibilityResult;
    },
  });
}
