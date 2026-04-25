export type FileKind = "pdf" | "word" | "csv" | "excel" | "other";

export type ProjectFileStatus = "uploaded" | "processing" | "parsed" | "error";

export type ProjectFile = {
  id: string;
  name: string;
  kind: FileKind;
  sizeLabel: string;
  uploadedAt: string;
  status: ProjectFileStatus;
  /** e.g. Solicitation, SOW, Amendment */
  sourceLabel: string;
};

export type ProjectStatus =
  | "drafting"
  | "reviewing"
  | "ready"
  | "submitted"
  | "archived";

export type FitRecommendation = "go" | "no_go" | "go_with_conditions";

export type ScheduleMilestoneSource = "solicitation" | "amendment" | "user";

export type KeyDeadline = {
  id: string;
  label: string;
  /** ISO date (YYYY-MM-DD) or free text such as `TBD (see agency portal)` */
  date: string;
  note?: string;
  source: ScheduleMilestoneSource;
};

export type AgencyPoc = {
  name: string;
  title: string;
  email: string;
  phone: string;
  /** e.g. contracting office or program office */
  organization: string;
};

export type Project = {
  id: string;
  name: string;
  /** RFP / opportunity title in header; often same as name */
  rfpTitle: string;
  agency: string;
  dueDate: string;
  status: ProjectStatus;
  owner: string;
  lastUpdated: string;
  progress: number;
  readinessScore: number;
  fitScore: number;
  recommendation: FitRecommendation;
  nextAction: string;
  keyDeadlines: KeyDeadline[];
  /** Agency opportunity / submission portal (SAM.gov, agency e-offer, etc.) */
  agencyPortalUrl: string;
  /** Government point of contact as stated in Section L or the cover letter */
  agencyPoc: AgencyPoc;
  openRisks: string[];
  files: ProjectFile[];
};

export type SubmittedRfpStatus =
  | "submitted"
  | "pending"
  | "shortlisted"
  | "won"
  | "lost"
  | "no_bid"
  | "archived";

export type SubmittedRfp = {
  id: string;
  projectId: string;
  agency: string;
  title: string;
  submittedAt: string;
  dueDate: string;
  status: SubmittedRfpStatus;
  contractValue: string;
  notes: string;
};

export type KnowledgeCategory =
  | "company"
  | "capabilities"
  | "past_performance"
  | "team"
  | "case_studies"
  | "certifications"
  | "pricing"
  | "boilerplate"
  | "compliance";

export type KnowledgeFile = {
  id: string;
  name: string;
  category: KnowledgeCategory;
  kind: FileKind;
  sizeLabel: string;
  status: "ready" | "stale" | "review";
  updatedAt: string;
  usedInProjects: number;
};

/* --- RFP analysis (display model) --- */

export type CotsLikelihood = "low" | "medium" | "high";

export type RfpSnapshot = {
  agency: string;
  projectName: string;
  keyDeadlines: { label: string; date: string }[];
  /** Primary link for amendments, Q&A, and instructions */
  solicitationUrl: string;
  agencyContact: AgencyPoc;
  submissionMethod: string;
  contractType: string;
  evaluationSummary: string;
};

export type FitAssessmentBlock = {
  score: number;
  recommendation: FitRecommendation;
  topReasons: string[];
  cotsLikelihood: CotsLikelihood;
  evidenceQuotes: string[];
};

export type OpportunitySummary = {
  problem: string;
  whyItMatters: string;
  whatProposalMustProve: string;
};

export type AlignmentRow = {
  whereWeFit: string;
  whereWeMayNot: string;
  knowledgeMatches: string[];
  missingProof: string[];
};

export type GapRisk = {
  gap: string;
  impact: string;
  mitigation: string;
  owner: string;
};

export type StrategicQuestion = {
  question: string;
  whyItMatters: string;
};

export type WinStrategy = {
  positioning: string;
  differentiators: string[];
  hotButtons: string[];
};

export type RfpFullAnalysis = {
  snapshot: RfpSnapshot;
  fit: FitAssessmentBlock;
  opportunity: OpportunitySummary;
  alignment: AlignmentRow;
  gaps: GapRisk[];
  questions: StrategicQuestion[];
  winStrategy: WinStrategy;
  recommendedNextStep: "proceed_draft" | "pursue_conditions" | "no_bid";
};

/* --- Compliance matrix --- */

export type ComplianceRowStatus =
  | "not_started"
  | "drafted"
  | "needs_review"
  | "approved"
  | "missing_info";

export type ComplianceMatrixRow = {
  id: string;
  requirement: string;
  source: string;
  responseSection: string;
  status: ComplianceRowStatus;
  confidence: "low" | "medium" | "high";
  notes: string;
  owner: string;
};

/* --- Proposal sections --- */

export type ProposalSectionStatus =
  | "not_started"
  | "drafting"
  | "needs_review"
  | "revised"
  | "approved";

export type ProposalSectionModel = {
  id: string;
  title: string;
  shortDescription: string;
  status: ProposalSectionStatus;
  lastEdited: string;
  sectionGoal: string;
  body: string;
  inlineNotes: string;
  sourceRefs: string;
};

export type ChatRole = "user" | "assistant";

export type ProposalChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sectionId?: string;
  suggestedRevision?: string;
};

export type ReviewChecklistId =
  | "executive"
  | "technical"
  | "ux"
  | "project_plan"
  | "past_perf"
  | "matrix"
  | "export";

export type ProjectReviewItem = { id: ReviewChecklistId; label: string; done: boolean };
