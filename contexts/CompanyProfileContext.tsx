"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CompanyProfile, StagedFile } from "@/lib/company/types";
import { defaultProfile } from "@/lib/company/types";
import { formatSize } from "@/lib/mock/file-utils";

const STORAGE_KEY = "govcon:company_profile_v1";

type Ctx = {
  profile: CompanyProfile;
  setProfile: (p: CompanyProfile) => void;
  updateProfile: (patch: Partial<CompanyProfile>) => void;
  addFiles: (files: File[], kind: StagedFile["kind"], linkToId?: { insuranceId?: string }) => void;
  removeFile: (id: string) => void;
  reset: () => void;
};

const CompanyProfileContext = createContext<Ctx | null>(null);

function load(): CompanyProfile {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as CompanyProfile;
      if (p && typeof p === "object" && p.headquarters) return migrate(p);
    }
  } catch {
    /* ignore */
  }
  return defaultProfile();
}

function migrate(p: CompanyProfile): CompanyProfile {
  const d = defaultProfile();
  return {
    ...d,
    ...p,
    headquarters: { ...d.headquarters, ...p.headquarters },
    remitTo: { ...d.remitTo, ...p.remitTo },
    proposalPoc: { ...d.proposalPoc, ...p.proposalPoc },
    contractsPoc: { ...d.contractsPoc, ...p.contractsPoc },
    apRemitPoc: { ...d.apRemitPoc, ...p.apRemitPoc },
    insuranceLines:
      p.insuranceLines?.length === 3
        ? p.insuranceLines.map((x, i) => ({ ...d.insuranceLines[i], ...x }))
        : d.insuranceLines,
    notaryTemplates: p.notaryTemplates?.length ? p.notaryTemplates : d.notaryTemplates,
    files: Array.isArray(p.files) ? p.files : [],
  };
}

function persist(p: CompanyProfile) {
  try {
    if (typeof window !== "undefined") sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function CompanyProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<CompanyProfile>(() => load());

  const setProfile = useCallback((p: CompanyProfile) => {
    setProfileState(p);
    persist(p);
  }, []);

  const updateProfile = useCallback((patch: Partial<CompanyProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const addFiles = useCallback(
    (fileList: File[], kind: StagedFile["kind"], linkToId?: { insuranceId?: string }) => {
      if (!fileList.length) return;
      const now = new Date().toISOString();
      setProfileState((prev) => {
        const newFiles: StagedFile[] = fileList.map((f, i) => ({
          id: `cf_${Date.now()}_${i}`,
          name: f.name,
          sizeLabel: formatSize(f.size),
          uploadedAt: now,
          kind,
        }));
        const strip = (f: (typeof prev.files)[0]) => {
          if (kind === "w9") return f.kind !== "w9";
          if (kind === "logo_primary") return f.kind !== "logo_primary";
          if (kind === "logo_wordmark") return f.kind !== "logo_wordmark";
          if (kind === "logo_secondary") return f.kind !== "logo_secondary";
          return true;
        };
        const files = [...prev.files.filter(strip), ...newFiles];
        let w9FileId = prev.w9FileId;
        let w9FileName = prev.w9FileName;
        let w9AsOf = prev.w9AsOf;
        if (kind === "w9" && newFiles[0]) {
          w9FileId = newFiles[0].id;
          w9FileName = newFiles[0].name;
          w9AsOf = now.slice(0, 10);
        }
        let logoPrimaryFileId = prev.logoPrimaryFileId;
        let logoWordmarkFileId = prev.logoWordmarkFileId;
        let logoSecondaryFileId = prev.logoSecondaryFileId;
        if (kind === "logo_primary" && newFiles[0]) logoPrimaryFileId = newFiles[0].id;
        if (kind === "logo_wordmark" && newFiles[0]) logoWordmarkFileId = newFiles[0].id;
        if (kind === "logo_secondary" && newFiles[0]) logoSecondaryFileId = newFiles[0].id;
        let insuranceLines = prev.insuranceLines;
        if (linkToId?.insuranceId) {
          const fileId = newFiles[0]?.id ?? null;
          insuranceLines = insuranceLines.map((L) =>
            L.id === linkToId.insuranceId ? { ...L, fileId } : L
          );
        }
        const next = {
          ...prev,
          files,
          w9FileId,
          w9FileName,
          w9AsOf,
          logoPrimaryFileId,
          logoWordmarkFileId,
          logoSecondaryFileId,
          insuranceLines,
        };
        persist(next);
        return next;
      });
    },
    []
  );

  const removeFile = useCallback((id: string) => {
    setProfileState((prev) => {
      const files = prev.files.filter((f) => f.id !== id);
      let w9FileId = prev.w9FileId;
      if (w9FileId === id) w9FileId = null;
      let logoPrimaryFileId = prev.logoPrimaryFileId;
      if (logoPrimaryFileId === id) logoPrimaryFileId = null;
      let logoWordmarkFileId = prev.logoWordmarkFileId;
      if (logoWordmarkFileId === id) logoWordmarkFileId = null;
      let logoSecondaryFileId = prev.logoSecondaryFileId;
      if (logoSecondaryFileId === id) logoSecondaryFileId = null;
      const insuranceLines = prev.insuranceLines.map((L) => (L.fileId === id ? { ...L, fileId: null } : L));
      const next = {
        ...prev,
        files,
        w9FileId,
        w9FileName: w9FileId ? prev.w9FileName : "",
        w9AsOf: w9FileId ? prev.w9AsOf : "",
        logoPrimaryFileId,
        logoWordmarkFileId,
        logoSecondaryFileId,
        insuranceLines,
      };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const d = defaultProfile();
    setProfileState(d);
    persist(d);
  }, []);

  const value = useMemo(
    () => ({ profile, setProfile, updateProfile, addFiles, removeFile, reset }),
    [profile, setProfile, updateProfile, addFiles, removeFile, reset]
  );

  return <CompanyProfileContext.Provider value={value}>{children}</CompanyProfileContext.Provider>;
}

export function useCompanyProfile() {
  const ctx = useContext(CompanyProfileContext);
  if (!ctx) throw new Error("useCompanyProfile must be used within CompanyProfileProvider");
  return ctx;
}
