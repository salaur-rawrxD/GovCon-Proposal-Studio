import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SubmittedRfp, SubmittedRfpStatus } from "@/lib/mock/types";

const statusVariant = (s: SubmittedRfpStatus): "default" | "secondary" | "outline" | "destructive" => {
  if (s === "won") return "default";
  if (s === "lost" || s === "no_bid") return "destructive";
  if (s === "archived") return "outline";
  if (s === "submitted" || s === "shortlisted" || s === "pending") return "secondary";
  return "outline";
};

type Props = {
  rows: SubmittedRfp[];
  getProjectPath: (projectId: string) => string | null;
  className?: string;
};

export function SubmittedRFPTable({ rows, getProjectPath, className }: Props) {
  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agency</TableHead>
              <TableHead>RFP title</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contract value</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const path = getProjectPath(r.projectId);
              return (
                <TableRow key={r.id}>
                  <TableCell>{r.agency}</TableCell>
                  <TableCell className="max-w-[200px] font-medium">{r.title}</TableCell>
                  <TableCell className="text-muted-foreground">{r.submittedAt}</TableCell>
                  <TableCell className="text-muted-foreground">{r.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(r.status)} className="capitalize">
                      {r.status.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.contractValue}</TableCell>
                  <TableCell>
                    {path ? (
                      <Link href={path} className="text-sm font-medium text-primary hover:underline">
                        Open
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
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
    </div>
  );
}
