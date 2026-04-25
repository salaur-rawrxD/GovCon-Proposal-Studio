import { withAiMode, completeJsonString } from "@/lib/ai/client";
import { complianceSynthesis } from "@/lib/ai/prompts";
import type { ComplianceRequirement } from "@/lib/types";

export type ComplianceRowInput = {
  category: string;
  requirement: string;
  sourceHint: string | null;
  status: ComplianceRequirement["status"];
};

function mockCompliance(): ComplianceRowInput[] {
  return [
    {
      category: "Submission",
      requirement: "Submit separate technical and cost volumes; bind technical per Section L.3.",
      sourceHint: "Section L / Instructions",
      status: "partial",
    },
    {
      category: "Formatting",
      requirement: "Use 11-pt font minimum, 1-inch margins, and page count limits in Section L.",
      sourceHint: "Section L.4",
      status: "met",
    },
    {
      category: "Security",
      requirement: "FIPS 140-2 validated crypto for all data in transit and at rest.",
      sourceHint: "PWS / Security",
      status: "partial",
    },
    {
      category: "Residency",
      requirement: "CUI processed only in U.S. persons approved facilities per clause mapping.",
      sourceHint: "DFARS / FAR flow-downs",
      status: "gap",
    },
  ];
}

export async function runComplianceAgent(aggregateText: string): Promise<ComplianceRowInput[]> {
  return withAiMode({
    mock: () => (aggregateText.length > 50 ? mockCompliance() : mockCompliance().slice(0, 2)),
    real: async () => {
      const raw = await completeJsonString({
        system: complianceSynthesis.system,
        user: JSON.stringify({
          task: "Return JSON { items: [{ category, requirement, sourceHint, status: met|partial|gap }] }.",
          rfp: aggregateText.slice(0, 120_000),
        }),
      });
      const parsed = JSON.parse(raw) as { items: ComplianceRowInput[] };
      return parsed.items;
    },
  });
}
