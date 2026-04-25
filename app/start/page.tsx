"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/shell/PageContainer";
import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { acceptUpload, inferFileKind, formatSize } from "@/lib/mock/file-utils";
import type { FileKind } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type Staged = {
  id: string;
  file: File;
  status: "uploading" | "ready";
};

export default function StartNewResponsePage() {
  const router = useRouter();
  const { createProject } = useProjectData();
  const [name, setName] = useState("");
  const [staged, setStaged] = useState<Staged[]>([]);
  const [creating, setCreating] = useState(false);
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

  return (
    <PageContainer className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Start New Response</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a dedicated project workspace for one RFP. Add your solicitation files first—everything else lives
          inside the project.
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Project name (optional)</CardTitle>
          <CardDescription>Defaults to a dated label if you leave this blank.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="pn" className="sr-only">
            Project name
          </Label>
          <Input
            id="pn"
            placeholder="e.g. HHS Cloud DevSecOps BPA"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card className="mt-6 border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">RFP files</CardTitle>
          <CardDescription>
            Accepted: PDF, Word (.doc, .docx), CSV, Excel (.xls, .xlsx). Uploading is simulated in this preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptUpload}
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 py-14 text-center transition",
              "hover:border-primary/25 hover:bg-muted/30"
            )}
          >
            <FileUp className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Drop files here or click to browse</span>
            <span className="text-xs text-muted-foreground">PDF · Word · CSV · Excel</span>
          </button>

          {staged.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 py-6 text-center text-sm text-muted-foreground">
              No files yet. Your project will be created once you add at least one RFP document.
            </div>
          ) : (
            <ul className="space-y-2" aria-live="polite">
              {staged.map((s) => {
                const kind: FileKind = inferFileKind(s.file.name);
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileTypeIcon kind={kind} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{s.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(s.file.size)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {s.status === "uploading" ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Uploading…
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">Ready</span>
                      )}
                      <button
                        type="button"
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        onClick={() => remove(s.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          disabled={!canCreate || creating}
          onClick={() => {
            if (!canCreate) return;
            setCreating(true);
            const id = createProject({
              name: name.trim(),
              files: staged.map((s) => s.file),
            });
            router.push(`/projects/${id}`);
          }}
        >
          {creating ? "Creating…" : "Create project"}
        </Button>
        <p className="text-sm text-muted-foreground">Opens your new project workspace.</p>
      </div>
    </PageContainer>
  );
}
