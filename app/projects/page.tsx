"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, Filter, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer } from "@/components/shell/PageContainer";
import { useProjectData } from "@/contexts/ProjectDataContext";
import type { ProjectStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "drafting", label: "Drafting" },
  { value: "reviewing", label: "Reviewing" },
  { value: "ready", label: "Ready to submit" },
  { value: "submitted", label: "Submitted" },
  { value: "archived", label: "Archived" },
];

export default function ProjectsPage() {
  const { projects } = useProjectData();
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");

  const list = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.status === filter);
  }, [projects, filter]);

  return (
    <PageContainer className="max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every RFP response lives in its own project—one workspace per opportunity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Select value={filter} onValueChange={(v) => v && setFilter(v as ProjectStatus | "all")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/start" className={cn(buttonVariants(), "gap-1")}>
            Start New Response
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No projects match this filter.{" "}
            <Link href="/start" className="font-medium text-primary underline-offset-4 hover:underline">
              Start a new response
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`}>
                <Card className="h-full border-border/60 transition hover:border-primary/20 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-sm text-muted-foreground">{p.agency}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {p.status}
                      </Badge>
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
                    <p className="mt-3 text-xs text-muted-foreground">
                      Updated {new Date(p.lastUpdated).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
