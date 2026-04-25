"use client";

import Link from "next/link";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shell/PageContainer";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { seedSubmitted } from "@/lib/mock/seed";
import { cn } from "@/lib/utils";

function daysUntil(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (86400 * 1000));
}

export default function DashboardPage() {
  const { projects } = useProjectData();
  const active = projects.filter((p) => p.status !== "archived" && p.status !== "submitted");
  const upcoming = [...active]
    .filter((p) => daysUntil(p.dueDate) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);
  const recent = [...projects].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5);

  const submitted = seedSubmitted;
  const totalSub = submitted.length;
  const wins = submitted.filter((s) => s.status === "won").length;
  const pending = submitted.filter((s) => s.status === "pending" || s.status === "shortlisted").length;
  const winRate = totalSub ? Math.round((wins / totalSub) * 100) : 0;
  const pipeline = submitted
    .filter((s) => s.status === "pending" || s.status === "submitted" || s.status === "shortlisted")
    .length;

  return (
    <PageContainer>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Home</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Active response projects, upcoming due dates, and recent submission outcomes in one view.
          </p>
        </div>
        <Link href="/start" className={cn(buttonVariants(), "shrink-0 gap-1.5 self-start sm:self-auto")}>
          <Plus className="h-4 w-4" />
          New response
        </Link>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 bg-card/50 shadow-sm ring-1 ring-border/5">
          <CardHeader className="pb-2">
            <CardDescription>Submissions (all time)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{totalSub}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-sm ring-1 ring-border/5">
          <CardHeader className="pb-2">
            <CardDescription>Win rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{winRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-sm ring-1 ring-border/5">
          <CardHeader className="pb-2">
            <CardDescription>Awaiting decision</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/50 shadow-sm ring-1 ring-border/5">
          <CardHeader className="pb-2">
            <CardDescription>In evaluation</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">{pipeline}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Active responses</h2>
          {active.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-muted/20">
              <CardContent className="py-10 text-center text-sm leading-relaxed text-muted-foreground">
                No active response projects.{" "}
                <Link href="/start" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Create a new response
                </Link>{" "}
                to open a workspace.
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-2">
              {active.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="block rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm ring-1 ring-transparent transition hover:border-border hover:ring-border/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.agency}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 capitalize">
                        {p.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Due {p.dueDate}</span>
                      <span>·</span>
                      <span>Readiness {p.readinessScore}%</span>
                    </div>
                    <Progress value={p.progress} className="mt-2 h-1.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Upcoming due dates</h2>
          <Card className="border-border/50 shadow-sm ring-1 ring-border/5">
            <CardContent className="p-0">
              {upcoming.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No upcoming due dates among active projects.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {upcoming.map((p) => {
                    const d = daysUntil(p.dueDate);
                    return (
                      <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {d < 0 ? "Overdue" : d === 0 ? "Due today" : `In ${d} day${d === 1 ? "" : "s"}`} · {p.dueDate}
                          </p>
                        </div>
                        <Link
                          href={`/projects/${p.id}`}
                          className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
                          aria-label="Open project"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Recently updated</h2>
          <Card className="border-border/50 ring-1 ring-border/5">
            <CardContent className="p-0">
              <ul className="divide-y divide-border/60">
                {recent.map((p) => (
                  <li key={p.id}>
                    <Link href={`/projects/${p.id}`} className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-muted/30">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(p.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Submissions activity</h2>
          <Card className="border-border/50 ring-1 ring-border/5">
            <CardContent className="p-0">
              <ul className="max-h-64 divide-y divide-border/60 overflow-y-auto">
                {submitted.slice(0, 6).map((s) => (
                  <li key={s.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <Badge variant="outline" className="capitalize">
                        {s.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.agency} · Submitted {s.submittedAt}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t p-2">
                <Link href="/submitted-rfps" className="inline-block px-2 py-1.5 text-sm font-medium text-foreground hover:underline">
                  View all submissions
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}
