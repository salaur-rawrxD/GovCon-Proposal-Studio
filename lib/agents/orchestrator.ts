import type { PublicProgressLabel } from "@/lib/types";
import { PROGRESS_PHASES } from "@/lib/types";
import { runRfpParserAgent } from "./rfpParserAgent";
import { runCompatibilityAgent } from "./compatibilityAgent";
import { runComplianceAgent } from "./complianceAgent";
import { runStrategyAgent } from "./strategyAgent";
import { runExecutiveSummaryDraft } from "./sectionDraftAgent";
import type { GovRepository } from "@/lib/repository/govRepository";
import type { Opportunity } from "@/lib/types";

export type AnalysisSnapshot = {
  rfp: Awaited<ReturnType<typeof runRfpParserAgent>>;
  compatibility: Awaited<ReturnType<typeof runCompatibilityAgent>>;
  strategy: Awaited<ReturnType<typeof runStrategyAgent>>;
  compliance: Awaited<ReturnType<typeof runComplianceAgent>>;
};

const phase = (i: number): PublicProgressLabel => {
  return PROGRESS_PHASES[Math.max(0, Math.min(i, PROGRESS_PHASES.length - 1))]!.label;
};

/**
 * Coordinates all analysis agents. Updates only the repository’s public job messages — never user-facing raw logs.
 */
export async function runOpportunityAnalysis(
  repo: GovRepository,
  jobId: string,
  opportunity: Opportunity
): Promise<AnalysisSnapshot> {
  const fullText = await repo.getAggregateRfpText(opportunity.id);
  if (!fullText.trim()) {
    throw new Error("No extracted text. Upload documents and wait for extraction.");
  }
  await repo.setJobProgress(jobId, 0, "running", phase(0));
  const profile = await repo.getCapabilityProfileForOpportunity(opportunity);

  const profileNarrative = [
    profile?.narrative ?? "",
    ...(profile?.differentiators ?? []),
    profile?.past_performance_summary ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const rfp = await runRfpParserAgent(fullText);
  const rfpNarrative = [rfp.opportunitySummary, rfp.eligibilityNotes, rfp.submissionItems.join(" ")].join("\n");

  await repo.setJobProgress(jobId, 1, "running", phase(1));
  const compliance = await runComplianceAgent(fullText);

  await repo.setJobProgress(jobId, 2, "running", phase(2));
  const compatibility = await runCompatibilityAgent({
    rfpSynthesis: rfpNarrative,
    fullRfpExcerpt: fullText,
    profileNarrative: profileNarrative || "Capabilities not yet captured in the profile; using generic win themes.",
  });

  const strategy = await runStrategyAgent({ rfp, compatibility });

  await repo.persistAnalysisResults(opportunity, {
    rfp,
    compliance,
    compatibility: {
      compatibilityScore: compatibility.compatibilityScore,
      fitSummary: compatibility.fitSummary,
      keyRisks: compatibility.keyRisks,
      opportunitySummary: rfp.opportunitySummary,
      bid_recommendation: strategy.bid_recommendation,
      recommendation_rationale: strategy.recommendation_rationale,
    },
  });

  const snapshot: AnalysisSnapshot = { rfp, compatibility, strategy, compliance };
  await repo.completeJob(jobId, { phase: "analysis", snapshot });
  return snapshot;
}

export async function runProposalGeneration(
  repo: GovRepository,
  jobId: string,
  opportunity: Opportunity
): Promise<void> {
  await repo.setJobProgress(jobId, 3, "running", phase(3));
  const fullText = await repo.getAggregateRfpText(opportunity.id);
  const profile = await repo.getCapabilityProfileForOpportunity(opportunity);
  const rfp = await runRfpParserAgent(fullText);
  const compatibility = await runCompatibilityAgent({
    rfpSynthesis: [rfp.opportunitySummary, rfp.eligibilityNotes].join("\n"),
    fullRfpExcerpt: fullText,
    profileNarrative: profile?.narrative ?? "",
  });
  const summaryText = await runExecutiveSummaryDraft({ rfp, compatibility, profile });
  await repo.saveProposalSection(opportunity, "executive_summary", "Executive Summary", summaryText);
  await repo.completeJob(jobId, { phase: "proposal", sectionKey: "executive_summary" });
}
