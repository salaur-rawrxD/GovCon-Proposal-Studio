"use client";

import { useId, useMemo } from "react";
import { CalendarClock, ExternalLink, Link2, MapPin, Pencil, Plus, RotateCcw, Trash2, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgencyPoc, KeyDeadline, Project } from "@/lib/mock/types";
import { defaultMilestonesForNewProject, isIsoDateString, parseMilestoneSortKey } from "@/lib/schedule/milestones";
import { cn } from "@/lib/utils";

const SOURCE_BADGE: Record<KeyDeadline["source"], { label: string; className: string }> = {
  solicitation: { label: "RFP", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200" },
  amendment: { label: "Amendment", className: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200" },
  user: { label: "Custom", className: "border-slate-500/30 bg-slate-500/10 text-slate-800 dark:text-slate-200" },
};

type Props = {
  project: Project;
  onUpdate: (patch: Partial<Project>) => void;
  className?: string;
};

function nextMilestoneId(): string {
  return `m_${Date.now()}`;
}

function isLikelyUrl(s: string) {
  return /^https?:\/\//i.test(s.trim());
}

function whenUserEditsSolicitationRow(row: KeyDeadline, next: KeyDeadline): KeyDeadline {
  if (row.source !== "solicitation") return next;
  if (
    row.label === next.label &&
    row.date === next.date &&
    (row.note ?? "") === (next.note ?? "")
  ) {
    return next;
  }
  return { ...next, source: "amendment" };
}

export function OpportunitySchedulePanel({ project, onUpdate, className }: Props) {
  const baseId = useId();

  const sortedForTimeline = useMemo(() => {
    return [...project.keyDeadlines].sort(
      (a, b) => parseMilestoneSortKey(a.date) - parseMilestoneSortKey(b.date)
    );
  }, [project.keyDeadlines]);

  const hasIso = sortedForTimeline.some((m) => isIsoDateString(m.date));
  const minDate = useMemo(() => {
    const iso = project.keyDeadlines
      .filter((m) => isIsoDateString(m.date))
      .map((m) => parseMilestoneSortKey(m.date));
    if (!iso.length) return null;
    return Math.min(...iso);
  }, [project.keyDeadlines]);
  const maxDate = useMemo(() => {
    const iso = project.keyDeadlines
      .filter((m) => isIsoDateString(m.date))
      .map((m) => parseMilestoneSortKey(m.date));
    if (!iso.length) return null;
    return Math.max(...iso);
  }, [project.keyDeadlines]);

  const setPoc = (patch: Partial<AgencyPoc>) => {
    onUpdate({ agencyPoc: { ...project.agencyPoc, ...patch } });
  };

  const setMilestones = (keyDeadlines: KeyDeadline[]) => onUpdate({ keyDeadlines });

  const updateMilestone = (id: string, next: KeyDeadline) => {
    setMilestones(
      project.keyDeadlines.map((row) => {
        if (row.id !== id) return row;
        return whenUserEditsSolicitationRow(row, next);
      })
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones(project.keyDeadlines.filter((m) => m.id !== id));
  };

  const addMilestone = () => {
    setMilestones([
      ...project.keyDeadlines,
      {
        id: nextMilestoneId(),
        label: "Milestone",
        date: new Date().toISOString().slice(0, 10),
        source: "user",
      },
    ]);
  };

  const restoreDefaults = () => {
    if (typeof window !== "undefined" && !window.confirm("Replace the milestone list with the standard RFP-based template? Your current rows will be removed.")) {
      return;
    }
    onUpdate({ keyDeadlines: defaultMilestonesForNewProject(project.dueDate) });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="border-border/50 ring-1 ring-border/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" aria-hidden />
            <CardTitle className="text-base">Solicitation source</CardTitle>
          </div>
          <CardDescription>Official portal for downloads, Q&amp;A, and amendments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor={`${baseId}-portal`}>Agency / opportunity link</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id={`${baseId}-portal`}
              className="font-mono text-sm"
              value={project.agencyPortalUrl}
              onChange={(e) => onUpdate({ agencyPortalUrl: e.target.value })}
              placeholder="https://sam.gov/… or agency e-offer URL"
            />
            {isLikelyUrl(project.agencyPortalUrl) ? (
              <a
                href={project.agencyPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border/60 bg-background px-3 text-sm font-medium text-foreground",
                  "hover:bg-muted/50"
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 ring-1 ring-border/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" aria-hidden />
            <CardTitle className="text-base">Agency point of contact</CardTitle>
          </div>
          <CardDescription>As published in the solicitation (Section L, cover, or RFI).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${baseId}-poc-name`}>Name</Label>
            <Input id={`${baseId}-poc-name`} value={project.agencyPoc.name} onChange={(e) => setPoc({ name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${baseId}-poc-title`}>Title / role</Label>
            <Input id={`${baseId}-poc-title`} value={project.agencyPoc.title} onChange={(e) => setPoc({ title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${baseId}-poc-org`}>Office / org</Label>
            <Input
              id={`${baseId}-poc-org`}
              value={project.agencyPoc.organization}
              onChange={(e) => setPoc({ organization: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${baseId}-poc-email`}>Email</Label>
            <Input
              id={`${baseId}-poc-email`}
              type="email"
              value={project.agencyPoc.email}
              onChange={(e) => setPoc({ email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor={`${baseId}-poc-phone`}>Phone</Label>
            <Input id={`${baseId}-poc-phone`} value={project.agencyPoc.phone} onChange={(e) => setPoc({ phone: e.target.value })} autoComplete="tel" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 ring-1 ring-border/5">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden />
                <CardTitle className="text-base">Milestone schedule</CardTitle>
              </div>
              <CardDescription className="mt-1.5">
                Pulled with the RFP response analysis; update dates and sources when amendments drop. Proposals-due
                should align with the project due field where possible.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addMilestone}>
                <Plus className="h-3.5 w-3.5" />
                Add milestone
              </Button>
              <Button type="button" variant="secondary" size="sm" className="gap-1" onClick={restoreDefaults}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to RFP template
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Milestone order</p>
            <div className="rounded-xl border border-border/50 bg-muted/10 px-2 py-4 sm:px-4">
              {hasIso && minDate != null && maxDate != null ? (
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  {new Date(minDate).toLocaleDateString()} → {new Date(maxDate).toLocaleDateString()} · ordered from earliest
                  to latest below
                </p>
              ) : (
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  Use YYYY-MM-DD in the editor for items to appear in chronological order. Free text (e.g. TBD) sorts after
                  calendar dates.
                </p>
              )}
              {sortedForTimeline.length ? (
                <ol className="relative grid list-none gap-0 border-l-2 border-primary/20 pl-4 sm:pl-5">
                  {sortedForTimeline.map((m) => {
                    const b = SOURCE_BADGE[m.source] ?? SOURCE_BADGE.solicitation;
                    return (
                      <li key={m.id} className="relative pb-6 last:pb-0">
                        <span
                          className="absolute -left-[1.1rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background ring-2 ring-primary/15 sm:-left-[1.2rem]"
                          aria-hidden
                        />
                        <div className="flex flex-col rounded-lg border border-border/50 bg-card/50 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                          <div className="min-w-0">
                            <span className="font-medium text-foreground">{m.label}</span>
                            <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                              {isIsoDateString(m.date) ? (
                                <time dateTime={m.date}>{m.date}</time>
                              ) : (
                                <span>{m.date}</span>
                              )}
                              {m.note ? <span className="ml-1 text-muted-foreground/90">· {m.note}</span> : null}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("mt-2 w-fit shrink-0 sm:mt-0.5", b.className)}
                          >
                            {b.label}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Edit &amp; amendment tracking</p>
            <div className="space-y-4">
              {project.keyDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rows yet. Use &quot;Reset to RFP template&quot; to load defaults from the response.</p>
              ) : null}
              {project.keyDeadlines.map((m) => {
                const b = SOURCE_BADGE[m.source] ?? SOURCE_BADGE.solicitation;
                return (
                  <div
                    key={m.id}
                    className="rounded-xl border border-border/60 bg-muted/5 p-3 sm:p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                        <span className="text-xs text-muted-foreground">Milestone</span>
                        <Badge variant="outline" className={cn("px-1.5 py-0 text-[10px] font-medium", b.className)}>
                          {b.label}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => removeMilestone(m.id)}
                        aria-label="Remove milestone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={m.label}
                          onChange={(e) => updateMilestone(m.id, { ...m, label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Date or text (YYYY-MM-DD, or e.g. TBD)</Label>
                        <Input
                          value={m.date}
                          onChange={(e) => updateMilestone(m.id, { ...m, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Note (optional)</Label>
                        <Input
                          value={m.note ?? ""}
                          onChange={(e) =>
                            updateMilestone(m.id, { ...m, note: e.target.value || undefined })
                          }
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Source</Label>
                        <Select
                          value={m.source}
                          onValueChange={(v) => {
                            if (v === "solicitation" || v === "amendment" || v === "user") {
                              updateMilestone(m.id, { ...m, source: v });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solicitation">RFP (original)</SelectItem>
                            <SelectItem value="amendment">Amendment / changed date</SelectItem>
                            <SelectItem value="user">Custom / internal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {project.dueDate ? (
            <p className="text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" aria-hidden />
              Project <strong>due date</strong> (header): {project.dueDate}. Update it on Home if the solicitation
              deadline moves.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
