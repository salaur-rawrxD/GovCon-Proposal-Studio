import { withAiMode, completeJsonString } from "@/lib/ai/client";
import { bidStrategy } from "@/lib/ai/prompts";
import type { BidRecommendation } from "@/lib/types";
import type { CompatibilityResult } from "./compatibilityAgent";
import type { RfpSynthesis } from "./rfpParserAgent";

export type StrategyInput = {
  rfp: RfpSynthesis;
  compatibility: CompatibilityResult;
};

export type StrategyResult = {
  bid_recommendation: BidRecommendation;
  recommendation_rationale: string;
};

function mockStrategy(c: CompatibilityResult): StrategyResult {
  if (c.compatibilityScore >= 72) {
    return {
      bid_recommendation: "bid",
      recommendation_rationale:
        "Fit is strong and compliance gaps are addressable in the proposal and teaming plan. Recommend proceeding with a disciplined capture plan.",
    };
  }
  if (c.compatibilityScore >= 55) {
    return {
      bid_recommendation: "review",
      recommendation_rationale:
        "Opportunity is winnable with clarifications; confirm pricing assumptions and subpartner roles before a final go.",
    };
  }
  return {
    bid_recommendation: "no_bid",
    recommendation_rationale:
      "Gaps in scope alignment outweigh near-term differentiators. Consider passing unless a teaming arrangement closes a material gap.",
  };
}

export async function runStrategyAgent(input: StrategyInput): Promise<StrategyResult> {
  return withAiMode({
    mock: () => mockStrategy(input.compatibility),
    real: async () => {
      const raw = await completeJsonString({
        system: bidStrategy.system,
        user: JSON.stringify({
          task: "Return JSON: bid_recommendation (bid|no_bid|review), recommendation_rationale.",
          rfp: input.rfp,
          fit: input.compatibility,
        }),
      });
      return JSON.parse(raw) as StrategyResult;
    },
  });
}
