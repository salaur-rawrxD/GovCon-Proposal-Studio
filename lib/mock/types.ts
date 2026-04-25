export type FileKind = "pdf" | "word" | "csv" | "excel" | "other";

export type UploadStatus = "pending" | "uploading" | "processing" | "ready" | "error";

export type ProjectFile = {
  id: string;
  name: string;
  kind: FileKind;
  sizeLabel: string;
  uploadedAt: string;
  status: UploadStatus;
};

export type ProjectStatus =
  | "drafting"
  | "reviewing"
  | "ready"
  | "submitted"
  | "archived";

export type Project = {
  id: string;
  name: string;
  agency: string;
  dueDate: string; // ISO date string
  status: ProjectStatus;
  owner: string;
  lastUpdated: string;
  progress: number; // 0-100
  readinessScore: number; // 0-100
  nextAction: string;
  files: ProjectFile[];
};

export type SubmittedRfpStatus =
  | "submitted"
  | "shortlisted"
  | "won"
  | "lost"
  | "no_bid"
  | "pending";

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
};
