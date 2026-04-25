"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Filter, Search, LayoutGrid, Table2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageContainer } from "@/components/shell/PageContainer";
import { useProjectData } from "@/contexts/ProjectDataContext";
import type { ProjectStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/app/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "drafting", label: "Drafting" },
  { value: "reviewing", label: "Reviewing" },
  { value: "ready", label: "Ready to submit" },
  { value: "submitted", label: "Submitted" },
  { value: "archived", label: "Archived" },
];

type Sort = "due" | "updated" | "fit";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects } = useProjectData();
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [sort, setSort] = useState<Sort>("due");

  const list = useMemo(() => {
    let p = filter === "all" ? projects : projects.filter((x) => x.status === filter);
    const qq = q.trim().toLowerCase();
    if (qq) p = p.filter((x) => x.name.toLowerCase().includes(qq) || x.agency.toLowerCase().includes(qq));
    const sorted = [...p];
    if (sort === "due") sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (sort === "updated") sorted.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    if (sort === "fit") sorted.sort((a, b) => b.fitScore - a.fitScore);
    return sorted;
  }, [projects, filter, q, sort]);

  return (
    <PageContainer className="max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One workspace per opportunity. Search, filter by status, and open the project record.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/start" className={cn(buttonVariants(), "gap-1")}>
            New response
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full max-w-2xl flex-1 flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <span className="text-xs text-muted-foreground">Search</span>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or agency…" />
            </div>
          </div>
          <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto">
            <div className="w-full min-w-[160px] space-y-1.5 sm:w-44">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Status
              </span>
              <Select value={filter} onValueChange={(v) => v && setFilter(v as ProjectStatus | "all")}>
                <SelectTrigger>
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
            </div>
            <div className="w-full min-w-[160px] space-y-1.5 sm:w-44">
              <span className="text-xs text-muted-foreground">Sort</span>
              <Select value={sort} onValueChange={(v) => v && setSort(v as Sort)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due">Due date</SelectItem>
                  <SelectItem value="updated">Last updated</SelectItem>
                  <SelectItem value="fit">Fit score (high → low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border/60 p-0.5">
          <Button
            type="button"
            size="sm"
            variant={view === "card" ? "default" : "ghost"}
            className="h-8 gap-1"
            onClick={() => setView("card")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Cards
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "table" ? "default" : "ghost"}
            className="h-8 gap-1"
            onClick={() => setView("table")}
          >
            <Table2 className="h-3.5 w-3.5" />
            Table
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No projects match.{" "}
            <Link href="/start" className="font-medium text-primary underline-offset-4 hover:underline">
              Start a new response
            </Link>
            .
          </CardContent>
        </Card>
      ) : view === "card" ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} href={`/projects/${p.id}`} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Fit</TableHead>
                <TableHead>Last updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/projects/${p.id}`)}
                >
                  <TableCell className="max-w-[200px] font-medium">
                    <Link href={`/projects/${p.id}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.agency}</TableCell>
                  <TableCell className="text-sm">{p.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.owner}</TableCell>
                  <TableCell>
                    <div className="flex w-28 items-center gap-1">
                      <Progress value={p.progress} className="h-1.5" />
                      <span className="text-xs text-muted-foreground">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">{p.fitScore}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.lastUpdated).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  );
}
