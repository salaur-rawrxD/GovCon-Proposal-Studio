import { FileSpreadsheet, FileText, FileType2, Table2 } from "lucide-react";
import type { FileKind } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const map: Record<FileKind, { icon: typeof FileText; className: string }> = {
  pdf: { icon: FileType2, className: "text-red-600" },
  word: { icon: FileText, className: "text-blue-600" },
  csv: { icon: Table2, className: "text-emerald-600" },
  excel: { icon: FileSpreadsheet, className: "text-emerald-700" },
  other: { icon: FileText, className: "text-muted-foreground" },
};

export function FileTypeIcon({ kind, className }: { kind: FileKind; className?: string }) {
  const { icon: I, className: c } = map[kind] ?? map.other;
  return <I className={cn("h-4 w-4 shrink-0", c, className)} aria-hidden />;
}
