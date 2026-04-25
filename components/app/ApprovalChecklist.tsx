import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectReviewItem } from "@/lib/mock/types";

type Props = {
  items: ProjectReviewItem[];
  approvedSectionCount: number;
  totalSections: number;
  warning: string | null;
  allApproved: boolean;
  onGenerateFinal: () => void;
  className?: string;
};

export function ApprovalChecklist({
  items,
  approvedSectionCount,
  totalSections,
  warning,
  allApproved,
  onGenerateFinal,
  className,
}: Props) {
  const done = items.filter((i) => i.done).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">Gates complete</span>
          <span className="tabular-nums text-muted-foreground">
            {done} / {items.length}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <p className="mt-2 text-xs text-muted-foreground">
          Volumes approved: {approvedSectionCount} / {totalSections}
        </p>
      </div>
      <ul className="space-y-3">
        {items.map((i) => (
          <li
            key={i.id}
            className="flex items-start gap-3 rounded-xl border-2 border-border/45 bg-surface/40 px-4 py-3.5 text-sm leading-relaxed"
          >
            {i.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={cn(i.done && "text-muted-foreground line-through")}>{i.label}</span>
          </li>
        ))}
      </ul>
      {warning ? (
        <div className="flex gap-3 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-950 dark:text-amber-100">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>{warning}</p>
        </div>
      ) : null}
      {allApproved ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border-2 border-primary/25 bg-primary/[0.06] p-5 ring-1 ring-primary/10">
          <p className="text-sm text-muted-foreground">All required approvals are in place. You may assemble the final response package.</p>
          <Button type="button" onClick={onGenerateFinal} className="shrink-0">
            Build final response
          </Button>
        </div>
      ) : null}
    </div>
  );
}
