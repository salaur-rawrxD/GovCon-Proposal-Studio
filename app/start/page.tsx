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
  "Uploading files",
  "Reading documents",
  "Extracting requirements",
  "Building fit assessment",
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Start New Response</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a project from your solicitation, then we’ll open the analysis and response workspace in one place.
        </p>
      </div>

      <FileUploadDropzone
        onPickFiles={addFiles}
        id="start-upload"
        title="Drop your RFP documents here"
        subtitle="Accepted: PDF, Word, CSV, Excel"
      />

      {staged.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border/60 bg-muted/10 py-8 text-center text-sm text-muted-foreground">
          Drop your RFP documents here. We’ll create a project, analyze the opportunity, and prepare a structured
          response workspace.
        </div>
      ) : (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Queued files</p>
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

      <Card className="mt-8 border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Project details (optional)</CardTitle>
          <CardDescription>These fields can be set now or edited later in the project workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pn">Project / opportunity name</Label>
            <Input
              id="pn"
              placeholder="e.g. HHS Cloud DevSecOps BPA"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 max-w-lg"
            />
          </div>
          <div>
            <Label htmlFor="ag">Agency or client</Label>
            <Input
              id="ag"
              placeholder="e.g. Department of Health and Human Services"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="mt-1 max-w-lg"
            />
          </div>
          <div>
            <Label htmlFor="dd">Due date</Label>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Preparing your workspace</CardTitle>
              <CardDescription>Simulated steps — in production, your RFP is parsed in the background.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={((stepIndex + 1) / STEPS.length) * 100} className="h-2" />
              <ol className="space-y-2 text-sm">
                {STEPS.map((s, i) => (
                  <li
                    key={s}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5",
                      i < stepIndex && "border-emerald-500/30 bg-emerald-500/5",
                      i === stepIndex && "border-primary/40 bg-primary/5"
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
          {progressOpen || creating ? "Working…" : "Create Project & Analyze RFP"}
        </Button>
        <p className="text-sm text-muted-foreground">Opens the project on the RFP analysis tab when processing completes.</p>
      </div>
    </PageContainer>
  );
}
