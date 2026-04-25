"use client";

import { useMemo, useState } from "react";
import { Search, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shell/PageContainer";
import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { seedKnowledge, categoryLabels } from "@/lib/mock/seed";
import type { KnowledgeCategory, KnowledgeFile } from "@/lib/mock/types";
import { acceptUpload, formatSize, inferFileKind } from "@/lib/mock/file-utils";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const cats: (KnowledgeCategory | "all")[] = [
  "all",
  "company",
  "capabilities",
  "past_performance",
  "team",
  "case_studies",
  "certifications",
  "pricing",
  "boilerplate",
  "compliance",
];

export default function KnowledgeBasePage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<typeof cats[number]>("all");
  const [rows, setRows] = useState<KnowledgeFile[]>(seedKnowledge);

  const view = useMemo(() => {
    let o = cat === "all" ? rows : rows.filter((f) => f.category === cat);
    const qq = q.trim().toLowerCase();
    if (qq) o = o.filter((f) => f.name.toLowerCase().includes(qq));
    return o;
  }, [rows, q, cat]);

  const onUpload = (list: FileList | null) => {
    if (!list?.length) return;
    const add: KnowledgeFile[] = Array.from(list).map((f, i) => ({
      id: `k_${Date.now()}_${i}`,
      name: f.name,
      category: "boilerplate",
      kind: inferFileKind(f.name),
      sizeLabel: formatSize(f.size),
      status: "ready",
      updatedAt: new Date().toISOString().slice(0, 10),
    }));
    setRows((prev) => [...add, ...prev]);
  };

  return (
    <PageContainer className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Knowledge base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reusable company materials: overview, past performance, bios, rate cards, and boilerplate—used across
          proposals. Upload is simulated; search and filter work client-side.
        </p>
      </div>

      <Card className="mb-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Add materials</CardTitle>
          <CardDescription>PDF, Word, CSV, Excel. Files appear in the list for this session (mock).</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            multiple
            accept={acceptUpload}
            className="sr-only"
            id="kb-up"
            onChange={(e) => onUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => document.getElementById("kb-up")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onUpload(e.dataTransfer.files);
            }}
            className={cn(
              "flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border/80 py-8 text-center transition hover:border-primary/25 hover:bg-muted/20"
            )}
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Drop files or click to add</span>
            <span className="text-xs text-muted-foreground">PDF, Word, CSV, Excel</span>
          </button>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Filter by name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full space-y-1.5 sm:w-56">
          <Label>Category</Label>
          <Select
            value={cat}
            onValueChange={(v) => v && setCat(v as (typeof cats)[number])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cats.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All" : categoryLabels[c as KnowledgeCategory]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="space-y-2">
        {view.map((f) => (
          <li key={f.id}>
            <Card className="border-border/60">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <FileTypeIcon kind={f.kind} className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryLabels[f.category]} · {f.sizeLabel} · Updated {f.updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={f.status === "stale" ? "secondary" : f.status === "review" ? "outline" : "default"}
                    className="capitalize"
                  >
                    {f.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {view.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No files match. Adjust search or filter.</p>
      )}
    </PageContainer>
  );
}
