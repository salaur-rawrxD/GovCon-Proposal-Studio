"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/shell/PageContainer";
import { FileUploadDropzone } from "@/components/app/FileUploadDropzone";
import { FileListStaged } from "@/components/app/FileList";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { acceptUpload } from "@/lib/mock/file-utils";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

type Staged = {
  id: string;
  file: File;
  status: "uploading" | "ready";
};

const STEPS = [
  "Ingesting documents",
  "Structuring content",
  "Extracting requirements",
  "Scoring opportunity fit",
] as const;

export default function StartNewResponsePage() {
  const router = useRouter();
  const { createProject } = useProjectData();
  const [name, setName] = useState("");
  const [agency, setAgency] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [staged, setStaged] = useState<Staged[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [progressOpen, setProgressOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return;
    const next: Staged[] = [];
    for (const f of Array.from(list)) {
      const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      next.push({ id, file: f, status: "uploading" });
    }
    setStaged((prev) => [...prev, ...next]);
    for (const item of next) {
      setTimeout(() => {
        setStaged((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, status: "ready" as const } : s))
        );
      }, 600 + Math.random() * 400);
    }
  }, []);

  const remove = (id: string) => setStaged((s) => s.filter((x) => x.id !== id));

  const canCreate = staged.length > 0 && staged.every((s) => s.status === "ready");
  const [creating, setCreating] = useState(false);

  const runAnalysis = (projectId: string) => {
    setProgressOpen(true);
    setStepIndex(0);
    const stepMs = 800;
    STEPS.forEach((_, i) => {
      setTimeout(() => setStepIndex(i), i * stepMs);
    });
    setTimeout(() => {
      setProgressOpen(false);
      setCreating(false);
      router.push(`/projects/${projectId}?tab=rfp-analysis`);
    }, STEPS.length * stepMs + 400);
  };

  return (
    <PageContainer className="max-w-3xl">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">New response</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Upload the solicitation and attachments. A dedicated project workspace is created, documents are ingested, and
          the opportunity analysis opens next so your team can align on fit before drafting.
        </p>
      </div>

      <FileUploadDropzone
        onPickFiles={addFiles}
        id="start-upload"
        title="Upload solicitation files"
        subtitle="PDF, Word, CSV, or Excel"
      />

      {staged.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border/50 bg-muted/20 py-10 text-center text-sm leading-relaxed text-muted-foreground">
          Drag and drop at least one solicitation file, or use the area above. Supported formats: PDF, Word, CSV, and
          Excel.
        </div>
      ) : (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Files in queue</p>
          <FileListStaged
            items={staged.map((s) => ({
              id: s.id,
              name: s.file.name,
              size: s.file.size,
              status: s.status,
            }))}
            onRemove={remove}
          />
        </div>
      )}

      <Card className="mt-10 border-border/50 bg-card/50 shadow-sm ring-1 ring-border/5">
        <CardHeader>
          <CardTitle className="text-lg">Opportunity record (optional)</CardTitle>
          <CardDescription>Add metadata now, or update it from the project workspace at any time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pn">Opportunity or project name</Label>
            <Input
              id="pn"
              placeholder="e.g. HHS Cloud DevSecOps BPA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 max-w-lg"
            />
          </div>
          <div>
            <Label htmlFor="ag">Agency or customer</Label>
            <Input
              id="ag"
              placeholder="e.g. Department of Health and Human Services"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="mt-1 max-w-lg"
            />
          </div>
          <div>
            <Label htmlFor="dd">Response due date</Label>
            <Input
              id="dd"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {progressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md">
          <Card className="w-full max-w-md border-border/50 shadow-2xl ring-1 ring-border/10">
            <CardHeader>
              <CardTitle className="text-base">Preparing your workspace</CardTitle>
              <CardDescription>
                Demonstration flow. In production, ingestion and analysis run asynchronously with status in the
                workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={((stepIndex + 1) / STEPS.length) * 100} className="h-1.5" />
              <ol className="space-y-2 text-sm text-foreground/90">
                {STEPS.map((s, i) => (
                  <li
                    key={s}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md border px-3 py-2",
                      i < stepIndex && "border-emerald-500/25 bg-emerald-500/[0.06]",
                      i === stepIndex && "border-primary/30 bg-primary/[0.06]"
                    )}
                  >
                    {i < stepIndex ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : i === stepIndex ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-border" />
                    )}
                    {s}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" multiple accept={acceptUpload} className="sr-only" onChange={(e) => addFiles(e.target.files)} />
        <Button
          size="lg"
          disabled={!canCreate || creating || progressOpen}
          onClick={() => {
            if (!canCreate) return;
            setCreating(true);
            const id = createProject({
              name: name.trim(),
              agency: agency.trim() || undefined,
              dueDate: dueDate.trim() || undefined,
              files: staged.map((s) => s.file),
            });
            runAnalysis(id);
          }}
        >
          {progressOpen || creating ? "Processing…" : "Create project and run analysis"}
        </Button>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          When this completes, you will be taken to the <strong className="font-medium text-foreground">Analysis</strong>{" "}
          section of the new project.
        </p>
      </div>
    </PageContainer>
  );
}
