import { Loader2 } from "lucide-react";
import { FileTypeIcon } from "@/components/files/FileTypeIcon";
import { inferFileKind, formatSize } from "@/lib/mock/file-utils";
import type { FileKind, ProjectFile } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

type Staged = { id: string; name: string; size: number; status: "uploading" | "ready" };

const fileStatusLabel: Record<ProjectFile["status"], string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  parsed: "Parsed",
  error: "Error",
};

export function FileListStaged({ items, onRemove }: { items: Staged[]; onRemove: (id: string) => void }) {
  return (
    <ul className="space-y-2" aria-live="polite">
      {items.map((s) => {
        const kind: FileKind = inferFileKind(s.name);
        return (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileTypeIcon kind={kind} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(s.size)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {s.status === "uploading" ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Ready</span>
              )}
              <button
                type="button"
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={() => onRemove(s.id)}
              >
                Remove
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function FileListProject({ files }: { files: ProjectFile[] }) {
  return (
    <ul className="space-y-1.5">
      {files.map((f) => (
        <li
          key={f.id}
          className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-muted/5 px-2 py-1.5 text-sm"
        >
          <div className="flex min-w-0 items-center gap-2">
            <FileTypeIcon kind={f.kind} className="shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-medium leading-tight">{f.name}</p>
              <p className="text-xs text-muted-foreground">
                {f.sourceLabel} · {f.sizeLabel}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-xs",
              f.status === "error" && "bg-destructive/10 text-destructive",
              f.status === "processing" && "bg-amber-500/10 text-amber-800 dark:text-amber-200",
              (f.status === "parsed" || f.status === "uploaded") && "bg-muted text-muted-foreground"
            )}
          >
            {fileStatusLabel[f.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
