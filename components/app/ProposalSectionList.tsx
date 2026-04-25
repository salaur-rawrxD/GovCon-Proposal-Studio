import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProposalSectionModel, ProposalSectionStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const statusClass: Record<ProposalSectionStatus, string> = {
  not_started: "border-muted-foreground/20 text-muted-foreground",
  drafting: "border-blue-500/30 bg-blue-500/5 text-blue-800 dark:text-blue-200",
  needs_review: "border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200",
  revised: "border-violet-500/30 bg-violet-500/5 text-violet-900 dark:text-violet-200",
  approved: "border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200",
};

const statusText: Record<ProposalSectionStatus, string> = {
  not_started: "Not started",
  drafting: "Drafting",
  needs_review: "Needs review",
  revised: "Revised",
  approved: "Approved",
};

type Props = {
  sections: ProposalSectionModel[];
  selectedId: string;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  className?: string;
};

export function ProposalSectionList({ sections, selectedId, onSelect, onApprove, className }: Props) {
  return (
    <ScrollArea className={cn("h-[min(70vh,640px)]", className)}>
      <ul className="space-y-1 pr-2">
        {sections.map((s) => {
          const active = s.id === selectedId;
          return (
            <li key={s.id}>
              <div
                className={cn(
                  "flex flex-col gap-1.5 rounded-lg border p-2.5 text-left transition",
                  active ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card hover:bg-muted/30"
                )}
              >
                <button type="button" onClick={() => onSelect(s.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium leading-tight text-foreground">{s.title}</p>
                    {s.status === "approved" ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.shortDescription}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium",
                        statusClass[s.status]
                      )}
                    >
                      {statusText[s.status]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(s.lastEdited).toLocaleString()}
                    </span>
                  </div>
                </button>
                {s.status !== "approved" && s.status !== "not_started" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(s.id);
                    }}
                  >
                    Approve
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </ScrollArea>
  );
}
