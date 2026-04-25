"use client";

import Link from "next/link";
import { PageContainer } from "@/components/shell/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { seedSubmitted } from "@/lib/mock/seed";
import { useProjectData } from "@/contexts/ProjectDataContext";
import type { SubmittedRfpStatus } from "@/lib/mock/types";

const statusVariant = (s: SubmittedRfpStatus): "default" | "secondary" | "outline" | "destructive" => {
  if (s === "won") return "default";
  if (s === "lost" || s === "no_bid") return "destructive";
  if (s === "submitted" || s === "shortlisted" || s === "pending") return "secondary";
  return "outline";
};

export default function SubmittedRfpsPage() {
  const { getProject } = useProjectData();
  const rows = seedSubmitted;
  const total = rows.length;
  const wins = rows.filter((r) => r.status === "won").length;
  const pending = rows.filter((r) => r.status === "pending" || r.status === "shortlisted").length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;
  const pipeline = rows
    .filter((r) => r.contractValue && r.contractValue !== "—" && r.status !== "lost")
    .length;

  return (
    <PageContainer className="max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Submitted RFPs</h1>
      <p className="mt-1 text-sm text-muted-foreground">Historical submissions and decision tracking (mock data).</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total submitted</p>
            <CardTitle className="text-2xl tabular-nums">{total}</CardTitle>
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
            <p className="text-xs text-muted-foreground">Pending decisions</p>
            <CardTitle className="text-2xl tabular-nums">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Active pipeline (mock count)</p>
            <CardTitle className="text-2xl tabular-nums">{pipeline}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-8 border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFP title</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const proj = getProject(r.projectId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-[200px] font-medium">{r.title}</TableCell>
                      <TableCell>{r.agency}</TableCell>
                      <TableCell className="text-muted-foreground">{r.submittedAt}</TableCell>
                      <TableCell className="text-muted-foreground">{r.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status)} className="capitalize">
                          {r.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.contractValue}</TableCell>
                      <TableCell>
                        {proj ? (
                          <Link href={`/projects/${r.projectId}`} className="text-sm font-medium text-primary hover:underline">
                            Open
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">Archived</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground" title={r.notes}>
                        {r.notes}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
