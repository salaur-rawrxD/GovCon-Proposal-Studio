"use client";

import Link from "next/link";
import { ArrowLeft, FileCheck, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";
import { ComplianceMatrixTable, type ComplianceTableRow } from "@/components/ui/compliance-matrix-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";

const MOCK_MATRIX: ComplianceTableRow[] = [
  {
    id: "1",
    requirement: "FedRAMP-aligned cloud hosting and continuous monitoring evidence",
    status: "review",
    risk: "med",
    responseSection: "Tech §3.2",
  },
  {
    id: "2",
    requirement: "Three relevant federal past performances within 36 months (Section M)",
    status: "compliant",
    risk: "low",
    responseSection: "PP §2",
  },
  {
    id: "3",
    requirement: "Cross-domain SIEM / log integration with agency SOC",
    status: "gap",
    risk: "high",
    responseSection: "Tech §3.4",
  },
  {
    id: "4",
    requirement: "Personnel clearances and CONUS support model (PWS 4.1)",
    status: "tbd",
    risk: "low",
    responseSection: "Mgmt §1",
  },
];

export default function OpportunityPreviewDetailPage() {
  return (
    <PageContainer className="max-w-5xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Sample view</p>
        <h1 className="heading-1">HHS-OCIO — Cloud &amp; DevSecOps (illustrative)</h1>
        <p className="body max-w-3xl text-text-secondary">
          Opportunity detail: fit score, risk posture, and compliance matrix. Connect to a live workspace from{" "}
          <strong className="font-medium text-foreground">Opportunities</strong> after ingestion.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" aria-hidden />
              <CardDescription>Compatibility</CardDescription>
            </div>
            <CardTitle className="text-3xl font-semibold tabular-nums text-foreground">86 / 100</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={86} className="h-1.5" />
            <p className="text-xs text-text-secondary">Strong technical alignment; close gaps in compliance packaging.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-primary">
              <FileCheck className="h-4 w-4" aria-hidden />
              <CardDescription>Risk summary</CardDescription>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <StatusBadge variant="warning">CMMC evidence</StatusBadge>
              <StatusBadge variant="neutral">Staffing</StatusBadge>
              <StatusBadge variant="success">Security IA</StatusBadge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-text-secondary">
              Two medium risks tracked; no blockers to proceed with mitigations in the response draft.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="heading-3 mb-2">Compliance matrix</h2>
        <p className="body mb-3 max-w-2xl">Mapped requirements, status, risk, and where they land in the proposal.</p>
        <ComplianceMatrixTable rows={MOCK_MATRIX} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/start" className={buttonVariants({ size: "default" })}>
          Start real opportunity
        </Link>
        <Link href="/projects" className={buttonVariants({ variant: "secondary", size: "default" })}>
          Open opportunities list
        </Link>
      </div>
    </PageContainer>
  );
}
