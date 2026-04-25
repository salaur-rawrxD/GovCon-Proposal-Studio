"use client";

import { useCallback, useState } from "react";

type Props = {
  disabled?: boolean;
  onFiles: (files: FileList | File[]) => void;
  accept?: string;
};

export function FileDropzone({ disabled, onFiles, accept = ".pdf,.txt,.md" }: Props) {
  const [over, setOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setOver(false);
      if (disabled) return;
      if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
    },
    [disabled, onFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={[
        "rounded-lg border-2 border-dashed px-6 py-10 text-center transition",
        over ? "border-cyan-500 bg-cyan-50" : "border-zinc-300 bg-zinc-50",
        disabled ? "pointer-events-none opacity-60" : "cursor-pointer",
      ].join(" ")}
    >
      <p className="text-sm text-zinc-600">
        Drop RFP files here, or{" "}
        <label className="font-medium text-cyan-700 hover:underline">
          browse
          <input
            className="sr-only"
            type="file"
            multiple
            accept={accept}
            disabled={disabled}
            onChange={(e) => e.target.files && onFiles(e.target.files)}
          />
        </label>
      </p>
      <p className="mt-1 text-xs text-zinc-500">PDF and plain text in this MVP</p>
    </div>
  );
}
