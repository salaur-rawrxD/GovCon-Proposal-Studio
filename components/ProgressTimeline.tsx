"use client";

import { PROGRESS_PHASES } from "@/lib/types";

type Props = {
  /** 0..4 maps to the five public phases */
  activeIndex: number;
  isComplete: boolean;
  isFailed: boolean;
  publicMessage: string | null;
};

export function ProgressTimeline({ activeIndex, isComplete, isFailed, publicMessage }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-zinc-900">Progress</p>
      <p className="text-xs text-zinc-500">High-level status only</p>
      <ol className="mt-4 space-y-3">
        {PROGRESS_PHASES.map((step, i) => {
          const done = isComplete || i < activeIndex;
          const current = i === activeIndex && !isComplete;
          return (
            <li key={step.key} className="flex items-start gap-3">
              <span
                className={[
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isFailed && i === activeIndex
                    ? "bg-red-100 text-red-800"
                    : done
                      ? "bg-emerald-100 text-emerald-800"
                      : current
                        ? "bg-cyan-100 text-cyan-800"
                        : "bg-zinc-100 text-zinc-500",
                ].join(" ")}
              >
                {isFailed && i === activeIndex ? "!" : done ? "✓" : i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-800">{step.label}</p>
                {current && publicMessage && <p className="text-xs text-cyan-700">{publicMessage}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
