"use client";

import { useMemo, useState } from "react";
import { Search, LayoutGrid, Table2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shell/PageContainer";
import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { FileUploadDropzone } from "@/components/app/FileUploadDropzone";
import { KnowledgeBaseTable } from "@/components/app/KnowledgeBaseTable";
import { seedKnowledge, categoryLabels } from "@/lib/mock/seed";
import type { KnowledgeCategory, KnowledgeFile } from "@/lib/mock/types";
import { formatSize, inferFileKind } from "@/lib/mock/file-utils";
import { Button } from "@/components/ui/button";
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
  const [view, setView] = useState<"table" | "card">("table");
  const [rows, setRows] = useState<KnowledgeFile[]>(seedKnowledge);

  const filtered = useMemo(() => {
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
      usedInProjects: 0,
    }));
    setRows((prev) => [...add, ...prev]);
  };

  return (
    <PageContainer className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Knowledge base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reusable company materials used across projects—proposals, pricing, and compliance (mock data + session uploads).
        </p>
      </div>

      <Card className="mb-6 border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Add materials</CardTitle>
          <CardDescription>Accepted file types: PDF, Word, CSV, Excel. Upload is simulated; files remain for this session.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadDropzone onPickFiles={onUpload} id="kb-up" title="Drop files or click to add" />
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border/70 bg-muted/10 py-16 text-center text-sm text-muted-foreground">
          Upload reusable company materials so the platform can draft stronger, more accurate responses.
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full max-w-sm space-y-1.5">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Filter by name…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-56">
            <Label>Category</Label>
            <Select value={cat} onValueChange={(v) => v && setCat(v as (typeof cats)[number])}>
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
        <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5">
          <Button
            type="button"
            size="sm"
            variant={view === "table" ? "default" : "ghost"}
            className="h-8 gap-1"
            onClick={() => setView("table")}
          >
            <Table2 className="h-3.5 w-3.5" />
            Table
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "card" ? "default" : "ghost"}
            className="h-8 gap-1"
            onClick={() => setView("card")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Cards
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <KnowledgeBaseTable rows={filtered} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((f) => (
            <li key={f.id}>
              <Card className="border-border/60">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileTypeIcon kind={f.kind} className="h-5 w-5" />
                    <div>
                      <p className="font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoryLabels[f.category]} · {f.sizeLabel} · Used in {f.usedInProjects} project
                        {f.usedInProjects === 1 ? "" : "s"} · Updated {f.updatedAt}
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
      )}

      {rows.length > 0 && filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No files match. Adjust search or filter.</p>
      ) : null}
    </PageContainer>
  );
}
