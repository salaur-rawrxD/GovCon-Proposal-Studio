"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ComplianceMatrixRow, ComplianceRowStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<ComplianceRowStatus, string> = {
  not_started: "Not started",
  drafted: "Drafted",
  needs_review: "Needs review",
  approved: "Approved",
  missing_info: "Missing info",
};

const statusToBadge: Record<ComplianceRowStatus, "success" | "warning" | "error" | "neutral"> = {
  approved: "success",
  needs_review: "warning",
  drafted: "neutral",
  not_started: "neutral",
  missing_info: "error",
};

type Filter = "all" | "high" | "missing" | "review" | "approved";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "high", label: "High priority" },
  { id: "missing", label: "Missing info" },
  { id: "review", label: "Needs review" },
  { id: "approved", label: "Approved" },
];

function matches(row: ComplianceMatrixRow, f: Filter): boolean {
  if (f === "all") return true;
  if (f === "missing") return row.status === "missing_info" || row.status === "not_started";
  if (f === "review") return row.status === "needs_review" || row.status === "drafted";
  if (f === "approved") return row.status === "approved";
  if (f === "high") return row.confidence === "high" && row.status !== "approved";
  return true;
}

export function ComplianceMatrixTable({ rows, className }: { rows: ComplianceMatrixRow[]; className?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const view = useMemo(() => rows.filter((r) => matches(r, filter)), [rows, filter]);

  const summary = useMemo(() => {
    const approved = rows.filter((r) => r.status === "approved").length;
    const missing = rows.filter((r) => r.status === "missing_info" || r.status === "not_started").length;
    const review = rows.filter((r) => r.status === "needs_review" || r.status === "drafted").length;
    return { total: rows.length, approved, missing, review };
  }, [rows]);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Total", v: summary.total, tone: "text-foreground" },
          { k: "Approved", v: summary.approved, tone: "text-success" },
          { k: "Needs work", v: summary.missing, tone: "text-destructive" },
          { k: "In review", v: summary.review, tone: "text-warning" },
        ].map((s) => (
          <div
            key={s.k}
            className="rounded-lg border-2 border-border/45 bg-surface/90 px-3 py-3 sm:px-4 sm:py-3.5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">{s.k}</p>
            <p className={cn("mt-1 text-2xl font-semibold tabular-nums", s.tone)}>{s.v}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Filter by status</p>
        <div className="flex flex-wrap gap-2">
          {filters.map((x) => (
            <Button
              key={x.id}
              type="button"
              size="sm"
              variant={filter === x.id ? "default" : "outline"}
              className="h-8 text-xs"
              onClick={() => setFilter(x.id)}
            >
              {x.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border-2 border-border/40 bg-surface/50 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="min-w-[220px] py-3 text-xs font-bold uppercase text-text-secondary">
                Requirement
              </TableHead>
              <TableHead className="py-3 text-xs font-bold uppercase text-text-secondary">Source</TableHead>
              <TableHead className="min-w-[100px] py-3 text-xs font-bold uppercase text-text-secondary">Section</TableHead>
              <TableHead className="py-3 text-xs font-bold uppercase text-text-secondary">Status</TableHead>
              <TableHead className="py-3 text-xs font-bold uppercase text-text-secondary">Conf.</TableHead>
              <TableHead className="min-w-[140px] py-3 text-xs font-bold uppercase text-text-secondary">Notes</TableHead>
              <TableHead className="py-3 text-xs font-bold uppercase text-text-secondary">Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.map((r) => (
              <TableRow
                key={r.id}
                className="border-border/40 transition-colors hover:bg-muted/25"
              >
                <TableCell className="align-top py-4 text-sm font-medium leading-relaxed text-foreground">
                  {r.requirement}
                </TableCell>
                <TableCell className="align-top py-4 text-xs leading-relaxed text-text-secondary">{r.source}</TableCell>
                <TableCell className="align-top py-4 font-mono text-xs text-foreground/90">{r.responseSection}</TableCell>
                <TableCell className="align-top py-4">
                  <StatusBadge variant={statusToBadge[r.status]} className="whitespace-nowrap">
                    {statusLabel[r.status]}
                  </StatusBadge>
                </TableCell>
                <TableCell className={cn("align-top py-4 text-sm capitalize", r.confidence === "high" && "font-semibold text-foreground")}>
                  {r.confidence}
                </TableCell>
                <TableCell className="align-top py-4 text-sm leading-relaxed text-text-secondary max-w-[200px]">
                  {r.notes}
                </TableCell>
                <TableCell className="align-top py-4 text-sm text-foreground/90">{r.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
