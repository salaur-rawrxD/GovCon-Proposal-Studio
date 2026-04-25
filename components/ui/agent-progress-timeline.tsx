"use client";

import { cn } from "@/lib/utils";

const DEFAULT_STEPS = [
  { key: "analyze", label: "Analyzing RFP" },
  { key: "compliance", label: "Checking compliance" },
  { key: "match", label: "Matching capabilities" },
  { key: "generate", label: "Generating response" },
] as const;

type Step = { key: string; label: string };

type Props = {
  activeIndex: number;
  className?: string;
  steps?: readonly Step[] | Step[];
};

export function AgentProgressTimeline({ activeIndex, className, steps = DEFAULT_STEPS }: Props) {
  return (
    <ol className={cn("space-y-0", className)} aria-label="AI pipeline">
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <li key={step.key} className="relative flex min-h-[3.25rem] gap-3 last:min-h-0">
            {i < steps.length - 1 ? (
              <span
                className="absolute left-[7px] top-3 h-[calc(100%-0.25rem)] w-px bg-border"
                aria-hidden
              />
            ) : null}
            <div className="relative z-[1] flex w-4 shrink-0 flex-col items-center pt-0.5">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full border-2 border-surface shadow-sm",
                  done && "border-success bg-success",
                  current && "animate-command-pulse border-accent bg-accent",
                  !done && !current && "border-muted-foreground/30 bg-background"
                )}
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1 pb-4 last:pb-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  (done || current) && "text-foreground",
                  !done && !current && "text-text-secondary"
                )}
              >
                {step.label}
              </p>
              {current ? <p className="text-xs text-text-secondary">In progress</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
