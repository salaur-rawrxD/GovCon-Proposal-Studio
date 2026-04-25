import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ComplianceTableRow = {
  id: string;
  requirement: string;
  status: "compliant" | "gap" | "tbd" | "review";
  risk: "low" | "med" | "high";
  responseSection: string;
};

const riskVariant: Record<ComplianceTableRow["risk"], "success" | "warning" | "error" | "neutral"> = {
  low: "success",
  med: "warning",
  high: "error",
};

const statusLabel: Record<ComplianceTableRow["status"], { label: string; variant: "success" | "warning" | "neutral" }> = {
  compliant: { label: "Compliant", variant: "success" },
  gap: { label: "Gap", variant: "warning" },
  tbd: { label: "TBD", variant: "neutral" },
  review: { label: "Review", variant: "warning" },
};

type Props = {
  rows: ComplianceTableRow[];
  className?: string;
};

export function ComplianceMatrixTable({ rows, className }: Props) {
  return (
    <div className={cn("overflow-x-auto rounded-md border border-border bg-surface", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead className="min-w-[200px] font-semibold text-foreground">Requirement</TableHead>
            <TableHead className="w-28 font-semibold text-foreground">Status</TableHead>
            <TableHead className="w-24 font-semibold text-foreground">Risk</TableHead>
            <TableHead className="min-w-[120px] font-semibold text-foreground">Response section</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow
              key={r.id}
              className="border-border/50 transition-colors hover:bg-muted/30"
            >
              <TableCell className="align-top text-sm font-medium text-foreground">{r.requirement}</TableCell>
              <TableCell className="align-top">
                <StatusBadge variant={statusLabel[r.status].variant}>{statusLabel[r.status].label}</StatusBadge>
              </TableCell>
              <TableCell className="align-top">
                <StatusBadge variant={riskVariant[r.risk]}>
                  {r.risk === "med" ? "Med" : r.risk === "low" ? "Low" : "High"}
                </StatusBadge>
              </TableCell>
              <TableCell className="align-top font-mono text-xs text-text-secondary">{r.responseSection}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
