"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComplianceMatrixRow, ComplianceRowStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<ComplianceRowStatus, string> = {
  not_started: "Not started",
  drafted: "Drafted",
  needs_review: "Needs review",
  approved: "Approved",
  missing_info: "Missing info",
};

const statusVariant = (s: ComplianceRowStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "missing_info" || s === "not_started") return "outline";
  if (s === "approved") return "default";
  if (s === "needs_review") return "secondary";
  return "outline";
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

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {filters.map((x) => (
          <Button
            key={x.id}
            type="button"
            size="sm"
            variant={filter === x.id ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setFilter(x.id)}
          >
            {x.label}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Requirement</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Response section</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="align-top text-sm font-medium leading-snug">{r.requirement}</TableCell>
                <TableCell className="align-top text-xs text-muted-foreground">{r.source}</TableCell>
                <TableCell className="align-top text-xs">{r.responseSection}</TableCell>
                <TableCell className="align-top">
                  <Badge variant={statusVariant(r.status)} className="whitespace-nowrap text-[10px]">
                    {statusLabel[r.status]}
                  </Badge>
                </TableCell>
                <TableCell className={cn("align-top capitalize", r.confidence === "high" && "font-medium")}>
                  {r.confidence}
                </TableCell>
                <TableCell className="align-top text-xs text-muted-foreground max-w-[180px]">{r.notes}</TableCell>
                <TableCell className="align-top text-xs">{r.owner}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
