"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  Package,
  PanelRight,
  Send,
  Shield,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { TopNav } from "@/components/app/TopNav";
import { SidebarNav, type NavItem } from "@/components/app/SidebarNav";
import { ProjectStatusBadge } from "@/components/app/ProjectStatusBadge";
import { FitScoreCard } from "@/components/app/FitScoreCard";
import { AnalysisReport } from "@/components/app/AnalysisReport";
import { ComplianceMatrixTable } from "@/components/app/ComplianceMatrixTable";
import { ProposalSectionList } from "@/components/app/ProposalSectionList";
import { ProposalEditor } from "@/components/app/ProposalEditor";
import { AIChatPanel } from "@/components/app/AIChatPanel";
import { ApprovalChecklist } from "@/components/app/ApprovalChecklist";
import { FinalDocumentPreview } from "@/components/app/FinalDocumentPreview";
import { ExportPanel } from "@/components/app/ExportPanel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjectData } from "@/contexts/ProjectDataContext";
import type { Project, ProposalSectionModel, ProposalChatMessage, ProjectReviewItem } from "@/lib/mock/types";
import { acceptUpload } from "@/lib/mock/file-utils";
import {
  getRfpAnalysis,
  getComplianceMatrix,
  getProposalSectionTemplates,
  getSampleChatForSection,
  getReviewComments,
  getFinalQualityScore,
} from "@/lib/mock/workspace-mock";
import { cn } from "@/lib/utils";

const TABS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "rfp-files", label: "RFP files", icon: FileText },
  { id: "rfp-analysis", label: "RFP analysis", icon: LineChart },
  { id: "compliance", label: "Compliance matrix", icon: Shield },
  { id: "response-draft", label: "Response draft", icon: ClipboardList },
  { id: "review", label: "Review & approval", icon: CheckCircle2 },
  { id: "final", label: "Final document", icon: Package },
  { id: "export", label: "Export", icon: Download },
];

const validTab = (t: string | null) => (TABS.some((x) => x.id === t) ? t! : "overview");

function makeReviewItems(sections: ProposalSectionModel[], matrixOk: boolean, exportReady: boolean): ProjectReviewItem[] {
  const ok = (id: string) => sections.find((s) => s.id === id)?.status === "approved";
  return [
    { id: "executive", label: "Executive Summary approved", done: ok("executive") },
    { id: "technical", label: "Technical approach approved", done: ok("technical") },
    { id: "ux", label: "UX approach approved", done: ok("ux") },
    { id: "project_plan", label: "Project / PM plan approved", done: ok("pm") },
    { id: "past_perf", label: "Past performance approved", done: ok("past_performance") },
    { id: "matrix", label: "Compliance matrix complete", done: matrixOk },
    { id: "export", label: "Export package ready", done: exportReady },
  ];
}

function mockReply(userText: string, sectionId: string): { content: string; revision: string } {
  const t = userText.toLowerCase();
  if (t.includes("executive") || t.includes("shorter") || t.includes("30%")) {
    return {
      content: "Here is a shorter, executive-style revision focused on mission outcome and low-risk delivery.",
      revision:
        "HHS is procuring a partner that can reduce delivery risk in the first year while measurably improving security outcomes. Our plan centers on a bounded transition, a named accountability chain (PM + ISSO), and cATO/cross-program metrics evaluators can score—so the technical factor reads as *managed risk*, not a feature catalog.",
    };
  }
  if (t.includes("accessib") || t.includes("508")) {
    return {
      content: "Added accessibility and Section 508 language consistent with a VPAT + testing cadence per Section L.",
      revision: sectionId
        ? "We commit to WCAG 2.1 AA conformance for deliverable UIs, supported by a VPAT, regression testing on representative workflows, and a prioritized defect backlog. Accessibility is a release gate, not a post-award surprise."
        : "Accessibility commitments appear in the UX section with explicit testing and remediation governance.",
    };
  }
  return {
    content: "I revised the section for a stronger government proposal tone, tied to the evaluation criteria and the PWS language the agency cares about most.",
    revision:
      "The government is buying accountable outcomes, not “best effort” delivery. In this program, the dominant evaluation themes are: (1) a defensible cATO/continuous monitoring story, (2) disciplined change and release control in production, and (3) transparent reporting that supports FISMA and mission continuity. The sections below connect each PWS sub-factor to a named deliverable, a metric, and an owner, so the evaluation team can score compliance without inferring intent.",
  };
}

type Props = { project: Project };

export function ProjectWorkspace({ project: initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addFilesToProject, getProject, updateProject } = useProjectData();
  const project = getProject(initial.id) ?? initial;

  const tab = validTab(searchParams.get("tab"));
  const setTab = useCallback(
    (t: string) => {
      const p = new URLSearchParams(searchParams.toString());
      p.set("tab", t);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const analysis = useMemo(() => getRfpAnalysis(project), [project]);
  const compliance = useMemo(() => getComplianceMatrix(project), [project]);
  const [sections, setSections] = useState<ProposalSectionModel[]>(() => getProposalSectionTemplates(project));
  const [selectedId, setSelectedId] = useState("executive");
  const [chat, setChat] = useState<ProposalChatMessage[]>(() => getSampleChatForSection());
  const [rightOpen, setRightOpen] = useState(true);
  const [exportMarked, setExportMarked] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? sections[0] ?? null,
    [sections, selectedId]
  );

  const matrixOk = useMemo(() => !compliance.some((c) => c.status === "missing_info"), [compliance]);
  const allSectionsApproved = useMemo(
    () => sections.length > 0 && sections.every((s) => s.status === "approved"),
    [sections]
  );
  const exportReady = allSectionsApproved;
  const reviewItems = useMemo(
    () => makeReviewItems(sections, matrixOk, exportReady),
    [sections, matrixOk, exportReady]
  );
  const approvedCount = sections.filter((s) => s.status === "approved").length;
  const needsApproval = sections.filter((s) => s.status !== "approved").length;
  const review = getReviewComments(project);
  const quality = getFinalQualityScore(project);
  const beginDrafting = useCallback(() => setTab("response-draft"), [setTab]);

  const onSectionField = useCallback(
    (id: string, field: "body" | "inlineNotes" | "sourceRefs", value: string) => {
      setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value, lastEdited: new Date().toISOString() } : s)));
    },
    []
  );

  const approveSection = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" as const, lastEdited: new Date().toISOString() } : s))
    );
  }, []);

  const onSaveSection = useCallback(() => {
    if (!selected) return;
    setSections((prev) => prev.map((s) => (s.id === selected.id ? { ...s, lastEdited: new Date().toISOString() } : s)));
  }, [selected]);

  const onSendChat = useCallback(
    (text: string) => {
      if (!selected) return;
      const u: ProposalChatMessage = {
        id: `m_${Date.now()}_u`,
        role: "user",
        content: text,
        sectionId: selected.id,
      };
      setChat((c) => [...c, u]);
      const { content, revision } = mockReply(text, selected.id);
      setTimeout(() => {
        setChat((c) => [
          ...c,
          {
            id: `m_${Date.now()}_a`,
            role: "assistant",
            content,
            sectionId: selected.id,
            suggestedRevision: revision,
          },
        ]);
      }, 500);
    },
    [selected]
  );

  const applyRevision = useCallback(
    (text: string) => {
      if (!selected) return;
      onSectionField(selected.id, "body", text);
    },
    [onSectionField, selected]
  );

  const onAddFiles = (list: FileList | null) => {
    if (!list?.length) return;
    addFilesToProject(project.id, Array.from(list));
  };

  const showAssistant = (tab === "response-draft" || tab === "rfp-analysis") && rightOpen;
  const tabLabel = TABS.find((t) => t.id === tab)?.label ?? "Workspace";

  return (
    <AppShell className="space-y-0">
      <TopNav items={[{ href: "/projects", label: "Projects" }]} trail={project.name}>
        <div className="hidden gap-2 sm:flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setRightOpen((o) => !o)}
            aria-pressed={rightOpen}
          >
            <PanelRight className="h-3.5 w-3.5" />
            Assistant
          </Button>
        </div>
      </TopNav>

      <div className="border-b border-border/50 bg-gradient-to-b from-card/80 to-background px-4 py-4">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">RFP / opportunity</p>
            <h1 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">{project.rfpTitle}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{project.agency}</span>
              <span>·</span>
              <span>Due {project.dueDate}</span>
              <span>·</span>
              <ProjectStatusBadge status={project.status} />
              <span>·</span>
              <span>Fit {project.fitScore}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="text-right text-sm">
              <p className="text-xs text-muted-foreground">Next action</p>
              <p className="line-clamp-2 max-w-xs font-medium text-foreground">{project.nextAction}</p>
            </div>
            <Link href="#workspace-main" className={buttonVariants()}>
              Continue in workspace
            </Link>
          </div>
        </div>
      </div>

      <div id="workspace-main" className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-0 lg:flex-row">
        <aside className="hidden w-56 shrink-0 border-r border-border/50 bg-card/20 lg:block">
          <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Project</p>
          <SidebarNav items={TABS} value={tab} onValueChange={setTab} />
        </aside>

        <div className="border-b border-border/50 p-2 lg:hidden">
          <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">Jump to</label>
          <Select value={tab} onValueChange={(v) => v && setTab(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Tab" />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-1">
          <main className="min-w-0 flex-1 space-y-6 p-4 lg:p-6">
            <p className="text-xs text-muted-foreground">Now viewing: {tabLabel}</p>

            {tab === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FitScoreCard fitScore={project.fitScore} recommendation={project.recommendation} className="md:col-span-1" />
                  <Card className="border-border/60 md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardDescription>Readiness score</CardDescription>
                      <CardTitle className="text-3xl tabular-nums">{project.readinessScore}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={project.readinessScore} className="h-2" />
                    </CardContent>
                  </Card>
                  <Card className="border-border/60">
                    <CardHeader className="pb-2">
                      <CardDescription>Approved sections</CardDescription>
                      <CardTitle className="text-3xl tabular-nums">
                        {approvedCount} / {sections.length}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">All sections require approval before final document generation in this mock workflow.</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Project summary</CardTitle>
                    <CardDescription>High-signal view for capture and proposal leads.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Primary recommendation</p>
                      <p className="mt-1 font-medium capitalize">{project.recommendation.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Owner</p>
                      <p className="mt-1 font-medium">{project.owner}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Next recommended action</p>
                      <p className="mt-1 font-medium text-foreground">{project.nextAction}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Key deadlines</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {project.keyDeadlines.map((d) => (
                          <li key={d.label + d.date}>
                            <span className="text-foreground">{d.label}:</span> {d.date}
                            {d.note ? ` — ${d.note}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Open risks</p>
                      {project.openRisks.length ? (
                        <ul className="mt-1 list-inside list-disc text-muted-foreground">
                          {project.openRisks.map((r) => (
                            <li key={r} className="text-foreground/90">
                              {r}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-muted-foreground">No tracked risks in this project profile.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => setTab("rfp-analysis")}>
                    Review fit assessment
                  </Button>
                  <Button type="button" variant="secondary" onClick={beginDrafting}>
                    Start draft response
                  </Button>
                </div>
              </>
            )}

            {tab === "rfp-files" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">RFP & attachment files</CardTitle>
                  <CardDescription>Processing status is simulated. Add amendments or SOW changes anytime.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInput}
                    type="file"
                    multiple
                    className="sr-only"
                    accept={acceptUpload}
                    onChange={(e) => onAddFiles(e.target.files)}
                  />
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.files.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">{f.name}</TableCell>
                          <TableCell className="capitalize text-muted-foreground">{f.kind}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(f.uploadedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {f.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{f.sourceLabel}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}>
                    Add more files
                  </Button>
                </CardContent>
              </Card>
            )}

            {tab === "rfp-analysis" && <AnalysisReport analysis={analysis} onBeginDrafting={beginDrafting} />}

            {tab === "compliance" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Compliance matrix</CardTitle>
                  <CardDescription>Map requirements to the volume and the evidence you will bring to the evaluation.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ComplianceMatrixTable rows={compliance} />
                </CardContent>
              </Card>
            )}

            {tab === "response-draft" && (
              <div className="space-y-4">
                {selected && (
                  <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px),1fr]">
                    <div>
                      <p className="mb-2 text-sm font-medium">Proposal sections</p>
                      <ProposalSectionList
                        sections={sections}
                        selectedId={selected.id}
                        onSelect={setSelectedId}
                        onApprove={approveSection}
                      />
                    </div>
                    <div className="min-w-0">
                      <ProposalEditor
                        section={selected}
                        onChange={onSectionField}
                        onSave={onSaveSection}
                        onApprove={() => selected && approveSection(selected.id)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "review" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Readiness & approval</CardTitle>
                    <CardDescription>Final quality score (mock): {quality} / 100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ApprovalChecklist
                      items={reviewItems}
                      approvedSectionCount={approvedCount}
                      totalSections={sections.length}
                      warning={
                        needsApproval
                          ? `${needsApproval} section${needsApproval === 1 ? "" : "s"} still need approval before the final document can be generated.`
                          : null
                      }
                      allApproved={allSectionsApproved}
                      onGenerateFinal={() => setTab("final")}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Open risks & compliance gaps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium">Open risks</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {project.openRisks.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Missing inputs</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {review.missing.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Compliance gaps (from review)</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {review.issues.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Review comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {review.comments.map((c) => (
                      <div key={c.id} className="rounded-md border p-2 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {c.who} · {c.when}
                        </p>
                        <p className="mt-1">{c.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2 border-amber-500/25 bg-amber-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      Evaluator read-through flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                      {review.flags.map((f) => (
                        <li key={f} className="text-foreground/90">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === "final" && (
              <div className="space-y-4">
                {allSectionsApproved ? (
                  <FinalDocumentPreview
                    project={project}
                    sections={sections}
                    onRegenerate={() => updateProject(project.id, { lastUpdated: new Date().toISOString() })}
                    onExport={() => setTab("export")}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      Approve all proposal sections in <strong>Response draft</strong> to assemble the final package. {needsApproval} section
                      {needsApproval === 1 ? "" : "s"} remaining.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {tab === "export" && (
              <ExportPanel
                fileNameHint={`HHS_Proposal_${project.name.replace(/\s+/g, "_")}_v1.docx (example)`}
                onMarkSubmitted={() => {
                  setExportMarked(true);
                  updateProject(project.id, { status: "submitted" });
                }}
                showSubmittedCta={allSectionsApproved || exportReady}
              />
            )}
            {exportMarked ? (
              <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                Marked as submitted in this session (mock). See Submitted RFPs for historical tracking.
              </p>
            ) : null}
          </main>

          {showAssistant && (
            <aside className="hidden w-full max-w-md shrink-0 border-l border-border/50 p-3 lg:block lg:w-96">
              {tab === "response-draft" ? (
                <AIChatPanel
                  section={selected}
                  messages={chat}
                  onSend={onSendChat}
                  onApplyRevision={applyRevision}
                  onInsertAsNote={(t) => selected && onSectionField(selected.id, "inlineNotes", (selected.inlineNotes + "\n" + t).trim())}
                  onRegenerate={() => {
                    onSendChat("Regenerate the suggested revision with a stronger government-proposal voice.");
                  }}
                  onReject={() => setChat((c) => c.slice(0, -1))}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Opportunity brief</CardTitle>
                    <CardDescription>Quick prompts while you read the analysis (mock)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "Summarize the top three Section M differentiators in one paragraph.",
                      "List gaps that require a question to the CO before submit.",
                    ].map((q) => (
                      <div key={q} className="flex gap-2 rounded-md border p-2">
                        <Send className="h-3.5 w-3.5 shrink-0" />
                        {q}
                      </div>
                    ))}
                    <p className="text-xs">Full conversational assistant is in Response draft, tied to the selected section.</p>
                  </CardContent>
                </Card>
              )}
            </aside>
          )}
        </div>
      </div>
    </AppShell>
  );
}
