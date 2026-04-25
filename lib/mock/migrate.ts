import type { FitRecommendation, Project, ProjectFile, ProjectFileStatus, ProjectStatus } from "./types";

function mapFileStatus(s: string): ProjectFileStatus {
  switch (s) {
    case "ready":
    case "parsed":
      return "parsed";
    case "uploading":
    case "pending":
      return "uploaded";
    case "processing":
      return "processing";
    case "error":
      return "error";
    case "uploaded":
      return "uploaded";
    default:
      return "parsed";
  }
}

function mapFit(v: string | undefined): FitRecommendation {
  if (v === "go" || v === "no_go" || v === "go_with_conditions") return v;
  return "go";
}

function mapStatus(s: string | undefined): ProjectStatus {
  const ok: ProjectStatus[] = ["drafting", "reviewing", "ready", "submitted", "archived"];
  if (s && (ok as string[]).includes(s)) return s as ProjectStatus;
  return "drafting";
}

export function normalizeProject(input: unknown): Project {
  const p = input as Record<string, unknown> & { files: ProjectFile[]; name: string };
  const files = (p.files ?? []).map((f) => {
    const raw = f as ProjectFile;
    return {
      ...raw,
      sourceLabel: raw.sourceLabel ?? "RFP / Attachment",
      status: mapFileStatus(String(raw.status ?? "parsed")),
    };
  });
  return {
    id: String(p.id),
    name: String(p.name),
    rfpTitle: typeof p.rfpTitle === "string" ? p.rfpTitle : String(p.name),
    agency: String(p.agency ?? "Agency TBD"),
    dueDate: String(p.dueDate ?? new Date().toISOString().slice(0, 10)),
    status: mapStatus(p.status as string | undefined),
    owner: String(p.owner ?? "You"),
    lastUpdated: String(p.lastUpdated ?? new Date().toISOString()),
    progress: Number(p.progress ?? 0),
    readinessScore: Number(p.readinessScore ?? 0),
    fitScore: typeof p.fitScore === "number" ? p.fitScore : 70,
    recommendation: mapFit(p.recommendation as string | undefined),
    nextAction: String(p.nextAction ?? "Review the RFP analysis and start drafting."),
    keyDeadlines: Array.isArray(p.keyDeadlines) ? (p.keyDeadlines as Project["keyDeadlines"]) : [],
    openRisks: Array.isArray(p.openRisks) ? (p.openRisks as string[]) : [],
    files,
  };
}
