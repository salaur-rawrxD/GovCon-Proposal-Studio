import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  onPickFiles: (files: FileList | null) => void;
  className?: string;
  id?: string;
  /** `accept` for the file input, e.g. `image/png,image/svg+xml` */
  accept?: string;
  multiple?: boolean;
  /** Shown in the drop zone */
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export function FileUploadDropzone({
  onPickFiles,
  className,
  id: inputId = "file-upload",
  accept,
  multiple = true,
  title = "Upload files",
  subtitle = "PDF, Word, CSV, or Excel",
  children,
}: Props) {
  return (
    <div>
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept={accept}
        className="sr-only"
        onChange={(e) => onPickFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => document.getElementById(inputId)?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPickFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-muted/15 py-12 text-center transition",
          "hover:border-primary/30 hover:bg-muted/25",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <FileUp className="h-9 w-9 text-muted-foreground" aria-hidden />
        <span className="px-2 text-sm font-medium text-foreground">{title}</span>
        {subtitle ? <span className="text-xs text-muted-foreground">{subtitle}</span> : null}
        {children}
      </button>
    </div>
  );
}
