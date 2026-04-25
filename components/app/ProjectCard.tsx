import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Project } from "@/lib/mock/types";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

export function ProjectCard({ project: p, href }: { project: Project; href: string }) {
  return (
    <Link href={href}>
      <Card className="h-full border-border/60 transition hover:border-primary/20 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.agency}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <ProjectStatusBadge status={p.status} />
              <Badge variant="outline" className="font-mono text-[10px] tabular-nums">
                Fit {p.fitScore}
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Due {p.dueDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {p.owner}
            </span>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{p.progress}%</span>
            </div>
            <Progress value={p.progress} className="h-1.5" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Updated {new Date(p.lastUpdated).toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
