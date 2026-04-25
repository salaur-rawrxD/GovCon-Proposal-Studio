"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { useProjectData } from "@/contexts/ProjectDataContext";
import type { Project } from "@/lib/mock/types";
import { defaultDraftSections } from "@/lib/mock/draft-sections";
import { acceptUpload, formatSize, inferFileKind } from "@/lib/mock/file-utils";

const complianceMock = [
  { id: "c1", req: "FedRAMP-ready architecture", source: "Section L.4", status: "Mapped", owner: "Tech lead", conf: "High" },
  { id: "c2", req: "Past performance (3 refs, 3 yrs)", source: "Section M.2", status: "Gap", owner: "Capture", conf: "Med" },
  { id: "c3", req: "Small business subcontracting plan", source: "FAR 52.219-9", status: "Met", owner: "Contracts", conf: "High" },
  { id: "c4", req: "CMMC L2 attestation path", source: "PWS", status: "Partial", owner: "Security", conf: "Med" },
  { id: "c5", req: "Agile sprint reporting (bi-weekly)", source: "SOW 3.2", status: "Mapped", owner: "PMO", conf: "High" },
];

const capabilitiesMock = [
  { area: "Cloud & DevSecOps", fit: 92, note: "Strong match to CI/CD and IaC requirements." },
  { area: "Zero trust / identity", fit: 78, note: "Aligns with ICAM language; add one more reference." },
  { area: "Agile at scale", fit: 88, note: "SAFe + federal governance called out in RFP." },
];

type DraftRow = { id: string; title: string; body: string };

const reviewMock = {
  comments: [
    { id: "r1", who: "Legal", when: "Apr 22", text: "Confirm data rights and IP flow-downs in Section C." },
    { id: "r2", who: "Pricing", when: "Apr 21", text: "CLIN 3 hours look light for integration window." },
  ],
  issues: ["Attach signed teaming LOI for Sub A.", "Add CPARS summary for GSA Alliant task order."],
  missing: ["Facility clearance evidence (if required)", "Price volume page count check vs L.3"],
  flags: ["Evaluation indicates past performance is 40% weighting—lift Section M mapping."],
};

export function ProjectWorkspace({ project }: { project: Project }) {
  const { addFilesToProject } = useProjectData();
  const fileInput = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<DraftRow[]>(() =>
    defaultDraftSections.map((s) => ({ id: s.id, title: s.title, body: s.body }))
  );

  const updateDraft = useCallback((id: string, body: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, body } : d)));
  }, []);

  const onAddFiles = (list: FileList | null) => {
    if (!list?.length) return;
    addFilesToProject(project.id, Array.from(list));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Project</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {project.agency} · Due {project.dueDate} · {project.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <FileText className="h-3.5 w-3.5" />
            Add files
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={acceptUpload}
            className="sr-only"
            onChange={(e) => onAddFiles(e.target.files)}
          />
          <Link href="#export" className={buttonVariants({ size: "sm" })}>
            Go to export
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="mb-0 inline-flex h-auto w-max min-w-full flex-wrap justify-start gap-1 bg-transparent p-0 sm:min-w-0">
            {[
              { v: "overview", label: "Overview", i: LayoutDashboard },
              { v: "files", label: "RFP files", i: FileText },
              { v: "compliance", label: "Compliance", i: Shield },
              { v: "capabilities", label: "Capabilities", i: Sparkles },
              { v: "draft", label: "Draft", i: ClipboardList },
              { v: "review", label: "Review", i: MessageSquare },
              { v: "export", label: "Export", i: Download },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs data-[state=active]:border-border data-[state=active]:bg-muted sm:text-sm"
              >
                <t.i className="h-3.5 w-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="overview" className="m-0 space-y-4 focus:outline-none">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Readiness score</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{project.readinessScore}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={project.readinessScore} className="h-2" />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardDescription>Next recommended action</CardDescription>
                <CardTitle className="text-base font-medium leading-normal">{project.nextAction}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Agency / client</p>
                <p className="font-medium">{project.agency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due date</p>
                <p className="font-medium">{project.dueDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className="capitalize">{project.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p className="font-medium">{project.owner}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={project.progress} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">Overall {project.progress}%</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="m-0 space-y-4 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Files in this project</CardTitle>
              <CardDescription>Processing status is simulated. Add more RFP or attachment files anytime.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.files.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileTypeIcon kind={f.kind} />
                          <span className="font-medium">{f.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">{f.kind}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(f.uploadedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {f.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => fileInput.current?.click()}>
                  Add more files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="m-0 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance matrix</CardTitle>
              <CardDescription>Mock data — your production system will link rows to RFP text and evidence.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceMock.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-xs font-medium">{r.req}</TableCell>
                      <TableCell className="text-muted-foreground">{r.source}</TableCell>
                      <TableCell>
                        <Badge
                          variant={r.status === "Gap" ? "destructive" : r.status === "Partial" ? "secondary" : "outline"}
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.owner}</TableCell>
                      <TableCell>{r.conf}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="m-0 focus:outline-none">
          <div className="grid gap-4 md:grid-cols-1">
            {capabilitiesMock.map((c) => (
              <Card key={c.area}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{c.area}</CardTitle>
                    <span className="text-sm font-semibold text-primary tabular-nums">{c.fit}% fit</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={c.fit} className="mb-2 h-2" />
                  <p className="text-sm text-muted-foreground">{c.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="m-0 space-y-6 focus:outline-none">
          {drafts.map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <CardTitle className="text-lg">{d.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={d.body}
                  onChange={(e) => updateDraft(d.id, e.target.value)}
                  className="min-h-[160px] text-base leading-relaxed"
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="review" className="m-0 space-y-4 focus:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reviewer comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviewMock.comments.map((c) => (
                <div key={c.id} className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    {c.who} · {c.when}
                  </p>
                  <p className="mt-1 text-sm">{c.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open issues</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {reviewMock.issues.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Missing items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {reviewMock.missing.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200/90">
                <AlertTriangle className="h-4 w-4" />
                Red flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {reviewMock.flags.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="m-0 space-y-4 focus:outline-none" id="export">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export</CardTitle>
              <CardDescription>UI only — connect document generation in production.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="secondary">Export to Word</Button>
              <Button variant="secondary">Export to PDF</Button>
              <Button variant="secondary">Export to Google Docs</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Submission package checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {["Technical volume signed", "Price signed", "Representations", "Subcontractor plan"].map((x) => (
                <label key={x} className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-input" readOnly tabIndex={-1} />
                  {x} <span className="text-xs">(mock)</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
