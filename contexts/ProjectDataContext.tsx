"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedProjects } from "@/lib/mock/seed";
import { normalizeProject } from "@/lib/mock/migrate";
import { inferFileKind, formatSize } from "@/lib/mock/file-utils";
import type { Project, ProjectFile, ProjectStatus, FitRecommendation } from "@/lib/mock/types";

const STORAGE = "govcon:mock:projects_v2";
const LEGACY = "govcon:mock:projects_v1";

export type CreateProjectInput = {
  name: string;
  agency?: string;
  dueDate?: string;
  files: File[];
};

type ProjectDataContextValue = {
  projects: Project[];
  createProject: (input: CreateProjectInput) => string;
  getProject: (id: string) => Project | undefined;
  addFilesToProject: (id: string, files: File[]) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  updateProjectMeta: (id: string, patch: Partial<Pick<Project, "name" | "readinessScore" | "nextAction" | "rfpTitle" | "agency">>) => void;
};

const ProjectDataContext = createContext<ProjectDataContextValue | null>(null);

function asProjectArray(x: unknown): Project[] {
  if (!Array.isArray(x)) return [];
  return x.map((row) => normalizeProject(row));
}

function loadInitial(): Project[] {
  if (typeof window === "undefined") {
    return seedProjects.map((p) => normalizeProject(p));
  }
  try {
    const raw = sessionStorage.getItem(STORAGE);
    if (raw) return asProjectArray(JSON.parse(raw));
    const leg = sessionStorage.getItem(LEGACY);
    if (leg) {
      const parsed = asProjectArray(JSON.parse(leg));
      sessionStorage.setItem(STORAGE, JSON.stringify(parsed));
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return seedProjects.map((p) => normalizeProject(p));
}

function recFit(files: number): { fit: number; rec: FitRecommendation; readiness: number; progress: number } {
  const base = 64 + Math.min(18, files * 4);
  const fit = Math.min(94, base + 4);
  let rec: FitRecommendation;
  if (fit >= 79) rec = "go";
  else if (fit < 50) rec = "no_go";
  else rec = "go_with_conditions";
  return {
    fit,
    rec,
    readiness: Math.min(88, 28 + files * 12),
    progress: Math.min(40, 12 + files * 8),
  };
}

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadInitial());

  const persist = useCallback((next: Project[]) => {
    try {
      if (typeof window !== "undefined") sessionStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const createProject = useCallback((input: CreateProjectInput) => {
    const id = `proj_${Date.now()}`;
    const now = new Date().toISOString();
    const { fit, rec, readiness, progress } = recFit(input.files.length);
    const dueFromInput = input.dueDate?.trim();
    const due = dueFromInput
      ? new Date(dueFromInput + "T12:00:00")
      : (() => {
          const d = new Date();
          d.setDate(d.getDate() + 28);
          return d;
        })();
    const agency = (input.agency?.trim() || "TBD (set in project overview)").slice(0, 200);
    const fileRows: ProjectFile[] = input.files.map((f, i) => ({
      id: `pf_${Date.now()}_${i}`,
      name: f.name,
      kind: inferFileKind(f.name),
      sizeLabel: formatSize(f.size),
      uploadedAt: now,
      status: "parsed" as const,
      sourceLabel: "Solicitation / upload",
    }));

    const name = input.name.trim() || `RFP response — ${new Date().toLocaleDateString()}`;

    const row: Project = {
      id,
      name,
      rfpTitle: name,
      agency,
      dueDate: due.toISOString().slice(0, 10),
      status: "drafting" as ProjectStatus,
      owner: "You",
      lastUpdated: now,
      progress,
      readinessScore: readiness,
      fitScore: fit,
      recommendation: rec,
      nextAction: "Review the RFP Analysis, then map requirements in the compliance matrix and begin the draft response.",
      keyDeadlines: [
        { label: "Proposals due", date: due.toISOString().slice(0, 10) },
        { label: "Q&A (typical window)", date: "See SAM.gov" },
      ],
      openRisks: [
        "Post-upload: validate all attachments parsed without OCR gaps before final sign-off.",
        "Confirm key personnel availability against the PWS start date.",
      ],
      files: fileRows,
    };
    setProjects((prev) => {
      const next = [row, ...prev];
      persist(next);
      return next;
    });
    return id;
  }, [persist]);

  const addFilesToProject = useCallback(
    (id: string, files: File[]) => {
      const now = new Date().toISOString();
      setProjects((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          const more: ProjectFile[] = files.map((f, i) => ({
            id: `pf_${Date.now()}_${i}`,
            name: f.name,
            kind: inferFileKind(f.name),
            sizeLabel: formatSize(f.size),
            uploadedAt: now,
            status: "parsed" as const,
            sourceLabel: "Solicitation / upload",
          }));
          return {
            ...p,
            files: [...p.files, ...more],
            lastUpdated: now,
            progress: Math.min(95, p.progress + 5),
            readinessScore: Math.min(95, p.readinessScore + 3),
            fitScore: Math.min(98, p.fitScore + 1),
          };
        });
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      setProjects((prev) => {
        const next = prev.map((p) =>
          p.id === id
            ? normalizeProject({ ...p, ...patch, lastUpdated: new Date().toISOString() })
            : p
        );
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateProjectMeta = useCallback(
    (id: string, patch: Partial<Pick<Project, "name" | "readinessScore" | "nextAction" | "rfpTitle" | "agency">>) => {
      updateProject(id, patch);
    },
    [updateProject]
  );

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const value = useMemo(
    () => ({
      projects,
      createProject,
      getProject,
      addFilesToProject,
      updateProject,
      updateProjectMeta,
    }),
    [projects, createProject, getProject, addFilesToProject, updateProject, updateProjectMeta]
  );

  return <ProjectDataContext.Provider value={value}>{children}</ProjectDataContext.Provider>;
}

export function useProjectData() {
  const ctx = useContext(ProjectDataContext);
  if (!ctx) throw new Error("useProjectData must be used within ProjectDataProvider");
  return ctx;
}
