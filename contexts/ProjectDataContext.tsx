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
import { inferFileKind, formatSize } from "@/lib/mock/file-utils";
import type { Project, ProjectFile, ProjectStatus } from "@/lib/mock/types";

type CreateProjectInput = {
  name: string;
  files: File[];
};

type ProjectDataContextValue = {
  projects: Project[];
  createProject: (input: CreateProjectInput) => string;
  getProject: (id: string) => Project | undefined;
  addFilesToProject: (id: string, files: File[]) => void;
  updateProjectMeta: (id: string, patch: Partial<Pick<Project, "name" | "readinessScore" | "nextAction">>) => void;
};

const ProjectDataContext = createContext<ProjectDataContextValue | null>(null);

const STORAGE = "govcon:mock:projects_v1";

function loadInitial(): Project[] {
  if (typeof window === "undefined") return seedProjects;
  try {
    const raw = sessionStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    /* ignore */
  }
  return seedProjects;
}

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadInitial());

  const createProject = useCallback((input: CreateProjectInput) => {
    const id = `proj_${Date.now()}`;
    const now = new Date().toISOString();
    const due = new Date();
    due.setDate(due.getDate() + 28);
    const fileRows: ProjectFile[] = input.files.map((f, i) => ({
      id: `pf_${Date.now()}_${i}`,
      name: f.name,
      kind: inferFileKind(f.name),
      sizeLabel: formatSize(f.size),
      uploadedAt: now,
      status: "ready" as const,
    }));

    const name = input.name.trim() || `RFP response — ${new Date().toLocaleDateString()}`;

    const row: Project = {
      id,
      name,
      agency: "TBD (set in overview)",
      dueDate: due.toISOString().slice(0, 10),
      status: "drafting" as ProjectStatus,
      owner: "You",
      lastUpdated: now,
      progress: 12,
      readinessScore: 24,
      nextAction: "Review compliance matrix and map capabilities to evaluation factors.",
      files: fileRows,
    };
    setProjects((prev) => {
      const next = [row, ...prev];
      try {
        if (typeof window !== "undefined") sessionStorage.setItem(STORAGE, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    return id;
  }, []);

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
            status: "ready" as const,
          }));
          return {
            ...p,
            files: [...p.files, ...more],
            lastUpdated: now,
            progress: Math.min(95, p.progress + 5),
            readinessScore: Math.min(95, p.readinessScore + 4),
          };
        });
        try {
          if (typeof window !== "undefined") sessionStorage.setItem(STORAGE, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    []
  );

  const updateProjectMeta = useCallback(
    (id: string, patch: Partial<Pick<Project, "name" | "readinessScore" | "nextAction">>) => {
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch, lastUpdated: new Date().toISOString() } : p));
        try {
          if (typeof window !== "undefined") sessionStorage.setItem(STORAGE, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    []
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
      updateProjectMeta,
    }),
    [projects, createProject, getProject, addFilesToProject, updateProjectMeta]
  );

  return <ProjectDataContext.Provider value={value}>{children}</ProjectDataContext.Provider>;
}

export function useProjectData() {
  const ctx = useContext(ProjectDataContext);
  if (!ctx) throw new Error("useProjectData must be used within ProjectDataProvider");
  return ctx;
}
