"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, FileText, ListTodo, Plus, AlertCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/shell/PageContainer";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { seedSubmitted } from "@/lib/mock/seed";
import { isIsoDateString } from "@/lib/schedule/milestones";
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

  type UrgentRow = { id: string; name: string; dateLabel: string; days: number; href: string; sub: string };
  const upcomingRows: UrgentRow[] = [];
  for (const p of active) {
    const d = daysUntil(p.dueDate);
    if (d >= 0) {
      upcomingRows.push({
        id: p.id,
        name: p.name,
        days: d,
        dateLabel: `Proposal / package due ${p.dueDate}`,
        href: `/projects/${p.id}`,
        sub: p.agency,
      });
    }
    for (const m of p.keyDeadlines) {
      if (!isIsoDateString(m.date)) continue;
      const md = daysUntil(m.date);
      if (md < 0) continue;
      upcomingRows.push({
        id: `${p.id}-${m.id}`,
        name: p.name,
        days: md,
        dateLabel: `${m.label} · ${m.date}${m.note ? ` (${m.note})` : ""}`,
        href: `/projects/${p.id}`,
        sub: p.agency,
      });
    }
  }
  upcomingRows.sort((a, b) => a.days - b.days);
  const seen = new Set<string>();
  const upcomingUnique: UrgentRow[] = [];
  for (const r of upcomingRows) {
    const k = `${r.name}|${r.dateLabel}`;
    if (seen.has(k)) continue;
    seen.add(k);
    upcomingUnique.push(r);
    if (upcomingUnique.length >= 8) break;
  }

  const openTasks: { id: string; title: string; project: string; href: string; urgent: boolean }[] = [];
  for (const p of active) {
    if (p.nextAction) {
      openTasks.push({
        id: `next-${p.id}`,
        title: p.nextAction.length > 90 ? p.nextAction.slice(0, 90) + "…" : p.nextAction,
        project: p.name,
        href: `/projects/${p.id}`,
        urgent: p.readinessScore < 50 || daysUntil(p.dueDate) <= 7,
      });
    }
    const r0 = p.openRisks[0];
    if (r0) {
      openTasks.push({
        id: `risk-${p.id}`,
        title: r0,
        project: p.name,
        href: `${`/projects/${p.id}`}?tab=overview`,
        urgent: true,
      });
    }
  }
  const openTasksDedup = openTasks.slice(0, 8);

  return (
    <PageContainer>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Command</p>
          <h1 className="heading-1 mt-1">Home</h1>
          <p className="body mt-2">
            Active response projects, upcoming due dates, and recent submission outcomes in one view.
          </p>
          <p className="mt-3 text-xs text-text-secondary">
            Sample:{" "}
            <Link className="font-semibold text-primary underline-offset-2 hover:underline" href="/opportunities/preview/detail">
              Opportunity detail (preview)
            </Link>
          </p>
        </div>
        <Link href="/start" className={cn(buttonVariants(), "h-9 shrink-0 gap-1.5 self-start px-3 sm:self-auto")}>
          <Plus className="h-4 w-4" />
          New response
        </Link>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-border/60 bg-surface shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Submissions (all time)</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">{totalSub}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/60 bg-surface shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Win rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">{winRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/60 bg-surface shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Awaiting decision</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-border/60 bg-surface shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>In evaluation</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">{pipeline}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">Upcoming &amp; critical dates</h2>
        </div>
        {upcomingUnique.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-muted/15">
            <CardContent className="py-8 text-center text-sm text-text-secondary">No scheduled milestones on file.</CardContent>
          </Card>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {upcomingUnique.map((u) => {
              const hot = u.days <= 3;
              const warm = u.days > 3 && u.days <= 14;
              return (
                <li key={u.id}>
                  <Link
                    href={u.href}
                    className={cn(
                      "block rounded-md border-2 p-4 shadow-sm transition hover:opacity-95",
                      hot && "border-destructive/60 bg-destructive/10",
                      !hot && warm && "border-warning/60 bg-warning/10",
                      !hot && !warm && "border-primary/30 bg-surface"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-bold text-foreground">{u.name}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                          hot && "bg-destructive/20 text-destructive",
                          warm && "bg-warning/20 text-warning",
                          !hot && !warm && "bg-primary/10 text-primary"
                        )}
                      >
                        {u.days === 0 ? "Today" : u.days === 1 ? "1d" : `${u.days}d`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-foreground/90">{u.dateLabel}</p>
                    <p className="mt-0.5 text-[11px] text-text-secondary">{u.sub}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">Open tasks</h2>
        </div>
        {openTasksDedup.length === 0 ? (
          <Card className="border-dashed border-border/70 bg-muted/15">
            <CardContent className="py-6 text-sm text-text-secondary">No open actions from your active pursuits.</CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {openTasksDedup.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.href}
                  className={cn(
                    "flex gap-3 rounded-md border-2 p-3 shadow-sm transition",
                    t.urgent
                      ? "border-warning/50 bg-warning/5 hover:bg-warning/10"
                      : "border-border/60 bg-surface hover:bg-muted/20"
                  )}
                >
                  {t.urgent ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs font-semibold text-primary">{t.project}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">Active responses</h2>
          {active.length === 0 ? (
            <Card className="border-2 border-dashed border-border/60 bg-muted/15">
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
                    className="block rounded-md border-2 border-border/50 bg-surface p-4 shadow-sm transition hover:border-primary/20 hover:bg-background"
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
          <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-foreground">Next proposal deadlines (summary)</h2>
          <Card className="border-2 border-border/50 bg-surface shadow-sm">
            <CardContent className="p-0">
              {upcoming.length === 0 ? (
                <p className="p-4 text-sm text-text-secondary">No active pursuits with a future due date.</p>
              ) : (
                <ul className="divide-y divide-border/50">
                  {upcoming.map((p) => {
                    const d = daysUntil(p.dueDate);
                    return (
                      <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                          <p className="text-xs font-medium text-text-secondary">
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

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-foreground">Recently updated</h2>
          <Card className="border-2 border-border/50 bg-surface shadow-sm">
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
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-foreground">Submissions activity</h2>
          <Card className="border-2 border-border/50 bg-surface shadow-sm">
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
