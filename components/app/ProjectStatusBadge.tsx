import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/mock/types";

const labels: Record<ProjectStatus, string> = {
  drafting: "Drafting",
  reviewing: "In review",
  ready: "Ready to submit",
  submitted: "Submitted",
  archived: "Archived",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="secondary" className="whitespace-nowrap">
      {labels[status]}
    </Badge>
  );
}
