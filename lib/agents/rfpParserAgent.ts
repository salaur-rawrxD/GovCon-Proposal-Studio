import { withAiMode, completeJsonString } from "@/lib/ai/client";
import { rfpSynthesis } from "@/lib/ai/prompts";

export type RfpSynthesis = {
  opportunitySummary: string;
  eligibilityNotes: string;
  submissionItems: string[];
  evaluationCriteria: { factor: string; details: string }[];
};

function mockRfpSynthesis(aggregateText: string): RfpSynthesis {
  const hasContent = aggregateText.trim().length > 80;
  return {
    opportunitySummary: hasContent
      ? "Solicitation requests agile software development, DevSecOps, and cloud hosting with security controls aligned to NIST 800-53. Deliverables include working software each sprint, documentation, and transition support."
      : "The uploaded documents are short. Please upload complete sections L/M and the statement of work for a full summary.",
    eligibilityNotes: hasContent
      ? "Vendors must be registered in SAM.gov, demonstrate relevant past performance, and may require Secret facility clearance for portions of the work."
      : "Eligibility could not be fully verified from the extracted text; confirm SAM registration, size standard, and any clearance requirements in the full RFP.",
    submissionItems: hasContent
      ? [
          "Volume I — Technical (page limits per Section L)",
          "Volume II — Price (authorized pricing format)",
          "Cover sheet & representations",
        ]
      : ["Full proposal per Section L", "Price schedule", "Signed representations"],
    evaluationCriteria: hasContent
      ? [
          { factor: "Technical", details: "Understanding of requirements and proposed technical solution." },
          { factor: "Past Performance", details: "Relevant recent performance of similar scope and complexity." },
          { factor: "Price", details: "Fair and reasonable; best value tradeoff with technical and performance." },
        ]
      : [{ factor: "TBD", details: "Upload evaluation criteria from Section M for precise mapping." }],
  };
}

export async function runRfpParserAgent(aggregateText: string): Promise<RfpSynthesis> {
  return withAiMode({
    mock: () => mockRfpSynthesis(aggregateText),
    real: async () => {
      const raw = await completeJsonString({
        system: rfpSynthesis.system,
        user: JSON.stringify({
          task: "Return JSON with opportunitySummary, eligibilityNotes, submissionItems[], evaluationCriteria[{factor, details}].",
          rfpExcerpt: aggregateText.slice(0, 120_000),
        }),
      });
      return JSON.parse(raw) as RfpSynthesis;
    },
  });
}
