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
import { OpportunitySchedulePanel } from "@/components/projects/OpportunitySchedulePanel";
import type { Project, ProposalSectionModel, ProposalChatMessage, ProjectReviewItem, FitRecommendation } from "@/lib/mock/types";
import { acceptUpload } from "@/lib/mock/file-utils";
import {
  getRfpAnalysis,
  getComplianceMatrix,
  getProposalSectionTemplates,
  getSampleChatForSection,
  getSampleAnalysisChat,
  getReviewComments,
  getFinalQualityScore,
} from "@/lib/mock/workspace-mock";
import { cn } from "@/lib/utils";

const TABS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "rfp-files", label: "RFP files", icon: FileText },
  { id: "rfp-analysis", label: "Analysis", icon: LineChart },
  { id: "compliance", label: "Compliance", icon: Shield },
  { id: "response-draft", label: "Response draft", icon: ClipboardList },
  { id: "review", label: "Review", icon: CheckCircle2 },
  { id: "final", label: "Final document", icon: Package },
  { id: "export", label: "Export", icon: Download },
];

const PURSUIT_REC: Record<FitRecommendation, string> = {
  go: "Go",
  no_go: "No-Go",
  go_with_conditions: "Go with conditions",
};

const validTab = (t: string | null) => (TABS.some((x) => x.id === t) ? t! : "overview");

function makeReviewItems(sections: ProposalSectionModel[], matrixOk: boolean, exportReady: boolean): ProjectReviewItem[] {
  const ok = (id: string) => sections.find((s) => s.id === id)?.status === "approved";
  return [
    { id: "executive", label: "Executive summary approved", done: ok("executive") },
    { id: "technical", label: "Technical volume approved", done: ok("technical") },
    { id: "ux", label: "User experience / design approved", done: ok("ux") },
    { id: "project_plan", label: "Program management plan approved", done: ok("pm") },
    { id: "past_perf", label: "Past performance approved", done: ok("past_performance") },
    { id: "matrix", label: "Compliance matrix complete", done: matrixOk },
    { id: "export", label: "Export package reviewed", done: exportReady },
  ];
}

function mockReply(userText: string, sectionId: string): { content: string; revision: string } {
  const t = userText.toLowerCase();
  if (t.includes("executive") || t.includes("shorter") || t.includes("30%")) {
    return {
      content:
        "Below is a concise, executive-style opening that leads with mission impact and risk posture before technical detail.",
      revision:
        "HHS is procuring a partner that can reduce delivery risk in the first year while measurably improving security outcomes. Our plan centers on a bounded transition, a named accountability chain (PM + ISSO), and cATO/cross-program metrics evaluators can score—so the technical factor reads as *managed risk*, not a feature catalog.",
    };
  }
  if (t.includes("accessib") || t.includes("508")) {
    return {
      content:
        "Incorporated Section 508 and accessibility commitments aligned to WCAG 2.1 AA, VPAT, and your stated testing cadence per Section L.",
      revision: sectionId
        ? "We commit to WCAG 2.1 AA conformance for deliverable UIs, supported by a VPAT, regression testing on representative workflows, and a prioritized defect backlog. Accessibility is a release gate, not a post-award surprise."
        : "Accessibility commitments appear in the UX section with explicit testing and remediation governance.",
    };
  }
  return {
    content:
      "Revised for federal proposal tone: explicit ties to the evaluation factors and PWS language the agency will score, with outcomes stated before process.",
    revision:
      "The government is buying accountable outcomes, not “best effort” delivery. In this program, the dominant evaluation themes are: (1) a defensible cATO/continuous monitoring story, (2) disciplined change and release control in production, and (3) transparent reporting that supports FISMA and mission continuity. The sections below connect each PWS sub-factor to a named deliverable, a metric, and an owner, so the evaluation team can score compliance without inferring intent.",
  };
}

function analysisMockReply(userText: string, p: Project): { content: string; suggestedRevision: string } {
  const t = userText.toLowerCase();
  const rec = PURSUIT_REC[p.recommendation];
  if (t.includes("risk") || t.includes("gap") || t.includes("mitigat")) {
    return {
      content:
        "The report’s gaps and risks section is the right anchor. For gate review, stress owners, dates, and traceability to PWS or Section M language.",
      suggestedRevision: `Risks to track from this read:\n• **CMMC / 800-171** — close artifact gaps; align POA&M narrative with the proposed start and ISSO sign-off path.\n• **Past performance** — strengthen a civil-agency reference with quantified outcomes in the expected TCV band.\n• **SIEM / logging** — prove connector and retention design against the PWS security paragraphs before you freeze the architecture diagram.\n\nCopy into your capture log and assign owners.`,
    };
  }
  if (t.includes("section m") || t.includes("evaluat") || t.includes("factor")) {
    return {
      content:
        "Mirror the RFP: technical approach (incl. security and transition) and past performance typically drive the non-price score, then cost. Your summary should follow that order.",
      suggestedRevision: `**Section M alignment (short talk track)**\n1. **Technical** — For each major PWS theme, one proof: deliverable, metric, owner. Lead with cATO, production operability, and change control.\n2. **Past performance** — Three references, each tied to the relevance tests in the solicitation; cite CPARS themes where you have them.\n3. **Price** — CLINs and BOE match the schedule; state assumptions and options clearly.\n4. **L compliance** — Representations, 508, and data rights as required by Section L.\n\nUse the solicitation’s factor titles verbatim in slide or volume headings where allowed.`,
    };
  }
  if (t.includes("question") || t.includes("q&a") || t.includes("clarif")) {
    return {
      content:
        "Target questions that remove scoring ambiguity: ATO scope, required tooling, and evaluation logistics (orals, demos, submission media).",
      suggestedRevision: `**Candidate questions (if the Q&A or industry day allows)**\n• What is the defined authorization boundary for year one, and is tenant-level cATO in scope for the awardee?\n• Are specific SIEM or logging stacks mandated or merely referenced?\n• If oral interviews are used, are environment and data restrictions specified for demonstrators?\n\nRecord answers in the compliance matrix and adjust win themes accordingly.`,
    };
  }
  return {
    content: `I am using your **opportunity fit (${p.fitScore}/100)** and **${rec}** recommendation. Ask about risks, Section M, win themes, or questions for the government to go deeper.`,
    suggestedRevision: `**Executive one-liner for capture / gate review**\nThis opportunity scores **${p.fitScore}/100** on fit with a **${rec}** read: we align on core DevSecOps and federal operations proof; the main mitigations are compliance packaging depth and, where needed, an additional on-point performance reference. **Next:** lock the top three win themes and Section M call-outs before the team drafts in earnest.\n\n— Copilot (preview)`,
  };
}

type Props = { project: Project };

export function ProjectWorkspace({ project: initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addFilesToProject, getProject, updateProject: patchProject } = useProjectData();
  const project = getProject(initial.id) ?? initial;

  const applyProjectPatch = useCallback(
    (patch: Partial<Project>) => {
      patchProject(project.id, patch);
    },
    [patchProject, project.id]
  );

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
  const [analysisChat, setAnalysisChat] = useState<ProposalChatMessage[]>(() => getSampleAnalysisChat());
  const [analysisNotes, setAnalysisNotes] = useState("");
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

  const onSendAnalysisChat = useCallback(
    (text: string) => {
      const u: ProposalChatMessage = {
        id: `a_${Date.now()}_u`,
        role: "user",
        content: text,
        sectionId: "analysis",
      };
      setAnalysisChat((c) => [...c, u]);
      const { content, suggestedRevision } = analysisMockReply(text, project);
      setTimeout(() => {
        setAnalysisChat((c) => [
          ...c,
          {
            id: `a_${Date.now()}_a`,
            role: "assistant",
            content,
            sectionId: "analysis",
            suggestedRevision,
          },
        ]);
      }, 500);
    },
    [project]
  );

  const appendAnalysisNote = useCallback((t: string) => {
    setAnalysisNotes((prev) => (prev ? `${prev}\n\n${t}` : t));
  }, []);

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
            Copilot
          </Button>
        </div>
      </TopNav>

      <div className="border-b border-border/40 bg-muted/25 px-4 py-5 shadow-sm shadow-black/[0.02] dark:shadow-none">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Opportunity</p>
            <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{project.rfpTitle}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>{project.agency}</span>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span>Proposal due {project.dueDate}</span>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <ProjectStatusBadge status={project.status} />
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span className="tabular-nums">Opportunity fit {project.fitScore}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-md">
            <div className="text-sm sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recommended action</p>
              <p className="mt-0.5 line-clamp-3 text-foreground">{project.nextAction}</p>
            </div>
            <Link href="#workspace-main" className={cn(buttonVariants(), "shrink-0")}>
              Go to workspace
            </Link>
          </div>
        </div>
      </div>

      <div id="workspace-main" className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-0 lg:flex-row">
        <aside className="hidden w-56 shrink-0 border-r border-border/40 bg-card/30 lg:block">
          <p className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workspace</p>
          <SidebarNav items={TABS} value={tab} onValueChange={setTab} />
        </aside>

        <div className="border-b border-border/40 bg-muted/10 p-3 lg:hidden">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Section
          </label>
          <Select value={tab} onValueChange={(v) => v && setTab(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose section" />
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
          <main className="min-w-0 flex-1 space-y-6 p-4 lg:px-8 lg:py-6">
            <div className="flex items-baseline gap-2 border-b border-border/30 pb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Workspace</span>
              <span className="text-muted-foreground/50" aria-hidden>
                /
              </span>
              <span className="text-sm font-medium text-foreground">{tabLabel}</span>
            </div>

            {tab === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <FitScoreCard fitScore={project.fitScore} recommendation={project.recommendation} className="md:col-span-1" />
                  <Card className="border-border/50 bg-card/50 ring-1 ring-border/5 md:col-span-1">
                    <CardHeader className="pb-2">
                      <CardDescription>Readiness</CardDescription>
                      <CardTitle className="text-3xl tabular-nums">{project.readinessScore}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={project.readinessScore} className="h-1.5" />
                      <p className="mt-2 text-xs text-muted-foreground">Composite of draft progress, compliance coverage, and review status.</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50 ring-1 ring-border/5">
                    <CardHeader className="pb-2">
                      <CardDescription>Approved volumes</CardDescription>
                      <CardTitle className="text-3xl tabular-nums">
                        {approvedCount} / {sections.length}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Each section must be approved before the compiled response can be generated.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <OpportunitySchedulePanel project={project} onUpdate={applyProjectPatch} />
                <Card className="border-border/50 ring-1 ring-border/5">
                  <CardHeader>
                    <CardTitle className="text-base">Opportunity summary</CardTitle>
                    <CardDescription>For capture managers, solution architects, and proposal leads.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Pursuit recommendation</p>
                      <p className="mt-1 font-medium">{PURSUIT_REC[project.recommendation]}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Owner</p>
                      <p className="mt-1 font-medium">{project.owner}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">Recommended next step</p>
                      <p className="mt-1 font-medium text-foreground">{project.nextAction}</p>
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
                        <p className="mt-1 text-muted-foreground">No risks recorded for this opportunity.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => setTab("rfp-analysis")}>
                    View analysis
                  </Button>
                  <Button type="button" variant="secondary" onClick={beginDrafting}>
                    Open response draft
                  </Button>
                </div>
              </>
            )}

            {tab === "rfp-files" && (
              <Card className="border-border/50 ring-1 ring-border/5">
                <CardHeader>
                  <CardTitle className="text-base">Solicitation files</CardTitle>
                  <CardDescription>
                    Source documents and amendments. Processing states shown here reflect this preview environment.
                  </CardDescription>
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
                    Add files
                  </Button>
                </CardContent>
              </Card>
            )}

            {tab === "rfp-analysis" && (
              <div className="space-y-6">
                {analysisNotes ? (
                  <Card className="border-border/50 ring-1 ring-border/5">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Session notes (copilot)</CardTitle>
                      <CardDescription>Text you add from the analysis copilot. Not saved to the server in this preview.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-border/50 bg-muted/20 p-3 text-sm leading-relaxed text-foreground">
                        {analysisNotes}
                      </pre>
                    </CardContent>
                  </Card>
                ) : null}
                <AnalysisReport analysis={analysis} onBeginDrafting={beginDrafting} />
              </div>
            )}

            {tab === "compliance" && (
              <Card className="border-border/50 ring-1 ring-border/5">
                <CardHeader>
                  <CardTitle className="text-base">Compliance matrix</CardTitle>
                  <CardDescription>
                    Map each requirement to your response location, owner, and substantiating evidence for evaluators.
                  </CardDescription>
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
                      <p className="mb-2 text-sm font-medium text-foreground">Volumes and sections</p>
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
                <Card className="border-border/50 ring-1 ring-border/5">
                  <CardHeader>
                    <CardTitle className="text-base">Readiness and approval</CardTitle>
                    <CardDescription>Quality index (illustrative): {quality} of 100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ApprovalChecklist
                      items={reviewItems}
                      approvedSectionCount={approvedCount}
                      totalSections={sections.length}
                      warning={
                        needsApproval
                          ? `${needsApproval} section${needsApproval === 1 ? "" : "s"} must be approved before the final response volume can be generated.`
                          : null
                      }
                      allApproved={allSectionsApproved}
                      onGenerateFinal={() => setTab("final")}
                    />
                  </CardContent>
                </Card>
                <Card className="border-border/50 ring-1 ring-border/5">
                  <CardHeader>
                    <CardTitle className="text-base">Gaps and inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium">Program risks</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {project.openRisks.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Outstanding inputs</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {review.missing.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Compliance findings</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        {review.issues.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2 border-border/50 ring-1 ring-border/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Reviewer notes
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
                <Card className="lg:col-span-2 border-amber-500/20 bg-amber-500/[0.04]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-amber-950 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      Evaluation risk flags
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
                    onRegenerate={() => patchProject(project.id, { lastUpdated: new Date().toISOString() })}
                    onExport={() => setTab("export")}
                  />
                ) : (
                  <Card className="border-dashed border-border/60">
                    <CardContent className="py-10 text-center text-sm leading-relaxed text-muted-foreground">
                      Approve all sections in <strong className="font-medium text-foreground">Response draft</strong> before
                      the compiled final volume is available. {needsApproval} section{needsApproval === 1 ? "" : "s"}{" "}
                      remaining.
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
                  patchProject(project.id, { status: "submitted" });
                }}
                showSubmittedCta={allSectionsApproved || exportReady}
              />
            )}
            {exportMarked ? (
              <p className="text-center text-sm text-emerald-700 dark:text-emerald-400/90">
                Submission recorded for this session. Use <span className="font-medium">Submissions</span> in the
                application header to review outcomes and value.
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
                    onSendChat(
                      "Regenerate the suggested text in federal proposal tone, explicitly tied to the evaluation criteria and PWS."
                    );
                  }}
                  onReject={() => setChat((c) => c.slice(0, -1))}
                />
              ) : (
                <AIChatPanel
                  title="Analysis copilot"
                  section={null}
                  allowSendWithoutSection
                  contextCaption="Ask about fit, risks, evaluation factors, and win strategy against this report. Output can be added to your session notes."
                  messages={analysisChat}
                  onSend={onSendAnalysisChat}
                  applyButtonLabel="Add to session notes"
                  noteButtonLabel="Add with separator"
                  onApplyRevision={appendAnalysisNote}
                  onInsertAsNote={(t) => appendAnalysisNote(`---\n${t}`)}
                  onRegenerate={() => {
                    onSendAnalysisChat("Give a shorter bullet summary of risks and mitigations I can use in a gate review.");
                  }}
                  onReject={() => setAnalysisChat((c) => c.slice(0, -1))}
                  inputPlaceholder="Ask about this opportunity analysis…"
                  promptExamples="Examples: “Top three win themes for Section M” · “Risks to track” · “Questions for the CO”"
                />
              )}
            </aside>
          )}
        </div>
      </div>
    </AppShell>
  );
}
