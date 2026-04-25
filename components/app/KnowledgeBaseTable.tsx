import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { KnowledgeFile } from "@/lib/mock/types";
import { categoryLabels } from "@/lib/mock/seed";

const statusClass = (s: KnowledgeFile["status"]) =>
  s === "ready" ? "default" : s === "stale" ? "secondary" : "outline";

type Props = {
  rows: KnowledgeFile[];
  className?: string;
};

export function KnowledgeBaseTable({ rows, className }: Props) {
  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead>Used in projects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2">
                    <FileTypeIcon kind={f.kind} />
                    <span className="truncate font-medium">{f.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{categoryLabels[f.category]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.sizeLabel}</TableCell>
                <TableCell>
                  <Badge variant={statusClass(f.status)} className="capitalize">
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.updatedAt}</TableCell>
                <TableCell className="text-sm font-medium tabular-nums">{f.usedInProjects}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

