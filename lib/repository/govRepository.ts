import type { AgentJobStatus, CapabilityProfile, Opportunity, PublicProgressLabel } from "@/lib/types";
import type { ComplianceRowInput } from "@/lib/agents/complianceAgent";
import type { RfpSynthesis } from "@/lib/agents/rfpParserAgent";

export type PersistedCompatibility = {
  compatibilityScore: number;
  fitSummary: string;
  keyRisks: string[];
  opportunitySummary: string;
  bid_recommendation: "bid" | "no_bid" | "review";
  recommendation_rationale: string;
};

export interface GovRepository {
  getDefaultCompanyId(): Promise<string>;
  getOpportunity(id: string): Promise<Opportunity | null>;
  listOpportunities(): Promise<Opportunity[]>;
  createOpportunity(title: string, description: string | null): Promise<Opportunity>;
  updateOpportunityStatus(id: string, status: string): Promise<void>;
  getCapabilityProfile(companyId: string): Promise<CapabilityProfile | null>;
  getCapabilityProfileForOpportunity(opp: Opportunity): Promise<CapabilityProfile | null>;
  upsertCapabilityProfile(
    companyId: string,
    data: Partial<
      Pick<
        CapabilityProfile,
        | "title"
        | "narrative"
        | "differentiators"
        | "past_performance_summary"
        | "key_personnel_summary"
        | "certifications"
      >
    >
  ): Promise<CapabilityProfile>;
  addRfpDocument(opp: Opportunity, file: { buffer: Buffer; fileName: string; contentType: string }): Promise<void>;
  listRfpDocuments(oppId: string): Promise<
    { id: string; file_name: string; content_type: string; file_size: number; created_at: string }[]
  >;
  extractAndStoreAllChunks(opp: Opportunity): Promise<void>;
  getAggregateRfpText(oppId: string): Promise<string>;
  createAgentJob(opp: Opportunity, type: "analyze" | "generate_proposal" | "chat_edit"): Promise<{ id: string }>;
  getAgentJob(id: string): Promise<{
    id: string;
    status: import("@/lib/types").AgentJobStatus;
    public_message: string | null;
    phase_index: number;
    result_payload: unknown;
    error_message: string | null;
  } | null>;
  setJobProgress(
    jobId: string,
    phaseIndex: number,
    status: AgentJobStatus,
    publicMessage: PublicProgressLabel | string
  ): Promise<void>;
  failJob(jobId: string, error: string): Promise<void>;
  persistAnalysisResults(
    opportunity: Opportunity,
    payload: {
      rfp: RfpSynthesis;
      compatibility: PersistedCompatibility;
      compliance: ComplianceRowInput[];
    }
  ): Promise<void>;
  getAnalysisState(opportunityId: string): Promise<{
    compatibility: import("@/lib/types").CompatibilityReport | null;
    compliance: import("@/lib/types").ComplianceRequirement[];
  }>;
  saveProposalSection(opp: Opportunity, key: string, title: string, content: string): Promise<void>;
  getProposalSection(opp: Opportunity, key: string): Promise<import("@/lib/types").ProposalSection | null>;
  completeJob(jobId: string, result: unknown): Promise<void>;
}
