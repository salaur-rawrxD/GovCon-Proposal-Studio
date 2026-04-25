export type BidRecommendation = "bid" | "no_bid" | "review";

export type PublicProgressLabel =
  | "Analyzing RFP documents"
  | "Checking compliance"
  | "Matching capabilities"
  | "Generating draft sections"
  | "Ready for review";

export const PROGRESS_PHASES: { label: PublicProgressLabel; key: string }[] = [
  { key: "analyzing", label: "Analyzing RFP documents" },
  { key: "compliance", label: "Checking compliance" },
  { key: "matching", label: "Matching capabilities" },
  { key: "generating", label: "Generating draft sections" },
  { key: "ready", label: "Ready for review" },
];

export type AgentJobStatus = "pending" | "running" | "complete" | "failed";

export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface CapabilityProfile {
  id: string;
  company_id: string;
  title: string;
  narrative: string;
  differentiators: string[];
  past_performance_summary: string;
  key_personnel_summary: string;
  certifications: string[];
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RfpDocument {
  id: string;
  opportunity_id: string;
  company_id: string;
  storage_path: string;
  file_name: string;
  content_type: string;
  file_size: number;
  created_at: string;
}

export interface ExtractedDocumentChunk {
  id: string;
  rfp_document_id: string;
  opportunity_id: string;
  company_id: string;
  chunk_index: number;
  text: string;
  created_at: string;
}

export interface CompatibilityReport {
  id: string;
  opportunity_id: string;
  company_id: string;
  compatibility_score: number;
  bid_recommendation: BidRecommendation;
  recommendation_rationale: string;
  key_risks: string[];
  fit_summary: string;
  opportunity_summary: string;
  created_at: string;
}

export interface ComplianceRequirement {
  id: string;
  opportunity_id: string;
  company_id: string;
  category: string;
  requirement: string;
  source_hint: string | null;
  status: "met" | "partial" | "gap";
  created_at: string;
}

export interface ProposalSection {
  id: string;
  opportunity_id: string;
  company_id: string;
  section_key: string;
  title: string;
  content: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AgentJob {
  id: string;
  opportunity_id: string;
  company_id: string;
  job_type: "analyze" | "generate_proposal" | "chat_edit";
  status: AgentJobStatus;
  /** Index into PROGRESS_PHASES; -1 = not started */
  phase_index: number;
  public_message: string | null;
  error_message: string | null;
  result_payload: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunityRfpContext {
  opportunity: Opportunity;
  fullText: string;
  profile: CapabilityProfile | null;
}
