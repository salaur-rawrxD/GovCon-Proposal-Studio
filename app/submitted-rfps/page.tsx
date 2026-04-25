"use client";

import { PageContainer } from "@/components/shell/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seedSubmitted } from "@/lib/mock/seed";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { SubmittedRFPTable } from "@/components/app/SubmittedRFPTable";

function parseToNumber(s: string): number | null {
  const t = s.replace(/[^0-9.]+/g, "");
  if (!t) return null;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

export default function SubmittedRfpsPage() {
  const { getProject } = useProjectData();
  const rows = seedSubmitted;
  const total = rows.length;
  const wins = rows.filter((r) => r.status === "won").length;
  const pending = rows.filter((r) => r.status === "pending" || r.status === "shortlisted").length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;
  const wonDollars = rows
    .filter((r) => r.status === "won")
    .map((r) => parseToNumber(r.contractValue))
    .filter((n): n is number => n !== null);
  const wonValue = wonDollars.length ? `~$${(wonDollars.reduce((a, b) => a + b, 0)).toFixed(1)}M` : "—";
  const pipelineDollars = rows
    .map((r) => parseToNumber(r.contractValue))
    .filter((n): n is number => n !== null);
  const pipelineValue = pipelineDollars.length
    ? `~$${(pipelineDollars.reduce((a, b) => a + b, 0)).toFixed(1)}M (mock)`
    : "—";

  return (
    <PageContainer className="max-w-6xl">
      <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Submissions</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Historical proposals, decision status, and contract value. Use this view for capture retrospectives and pipeline
        reporting (sample data in this environment).
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total submitted</p>
            <CardTitle className="text-2xl tabular-nums">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Pending decisions</p>
            <CardTitle className="text-2xl tabular-nums">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Win rate</p>
            <CardTitle className="text-2xl tabular-nums">{winRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Pipeline value (illustrative)</p>
            <CardTitle className="text-xl tabular-nums">{pipelineValue}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Won value (illustrative)</p>
            <CardTitle className="text-2xl tabular-nums">{wonValue}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-8 border-border/60">
        <CardContent className="p-0">
          <SubmittedRFPTable rows={rows} getProjectPath={(id) => (getProject(id) ? `/projects/${id}` : null)} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
