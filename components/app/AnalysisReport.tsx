import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CotsLikelihood, RfpFullAnalysis, FitRecommendation } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Quote, Target, BookOpen, Compass } from "lucide-react";

const recLabel: Record<FitRecommendation, string> = {
  go: "Go",
  no_go: "No-Go",
  go_with_conditions: "Go with conditions",
};

const cots: Record<CotsLikelihood, string> = { low: "Low", medium: "Medium", high: "High" };

const nextCta: Record<string, { label: string; note: string }> = {
  proceed_draft: {
    label: "Continue to response draft",
    note: "Proceed to structured volumes with your team; capture can close gaps in parallel with drafting.",
  },
  pursue_conditions: {
    label: "Proceed with conditions",
    note: "Advance to drafting while mitigations and open items are tracked in the workspace.",
  },
  no_bid: {
    label: "Record no-bid",
    note: "Document decision rationale in your capture process and retain this analysis for pipeline reporting.",
  },
};

type Props = {
  analysis: RfpFullAnalysis;
  onBeginDrafting: () => void;
  className?: string;
};

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-secondary">{children}</p>;
}

function ReportSection({
  kicker,
  title,
  children,
  id,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-4 overflow-hidden rounded-lg border-2 border-border/40 bg-surface shadow-sm"
    >
      <div className="border-b border-border/50 bg-background/40 px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{kicker}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">{title}</h2>
      </div>
      <div className="space-y-5 px-5 py-6 text-sm leading-7 text-foreground/95 sm:px-6 sm:py-7">{children}</div>
    </section>
  );
}

export function AnalysisReport({ analysis, onBeginDrafting, className }: Props) {
  const a = analysis;
  const next = nextCta[a.recommendedNextStep] ?? nextCta.proceed_draft;
  return (
    <div className={cn("mx-auto max-w-4xl space-y-8 pb-24", className)}>
      <div className="rounded-xl border-2 border-primary/25 bg-primary/[0.05] p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Compass className="h-3.5 w-3.5" />
              At a glance
            </p>
            <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl">
              {a.fit.score}
              <span className="ml-0.5 text-2xl font-medium text-text-secondary/90 sm:text-3xl">/ 100</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-6 items-center rounded border border-border/60 bg-surface px-2 text-xs font-bold text-foreground">
                {recLabel[a.fit.recommendation]}
              </span>
              <span className="text-sm text-text-secondary">COTS likelihood {cots[a.fit.cotsLikelihood]}</span>
            </div>
          </div>
          {a.recommendedNextStep !== "no_bid" ? (
            <Button
              onClick={onBeginDrafting}
              size="lg"
              className="h-10 shrink-0 gap-2 self-start sm:self-auto"
            >
              Open response draft
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
          Read the full analysis below, or go straight to drafting when your team is aligned.
        </p>
      </div>

      <div className="space-y-8">
        <ReportSection kicker="Solicitation" title="Context & dates" id="analysis-snapshot">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel>Agency</FieldLabel>
              <p className="text-base font-medium leading-snug">{a.snapshot.agency}</p>
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Title</FieldLabel>
              <p className="text-base font-medium leading-snug">{a.snapshot.projectName}</p>
            </div>
          </div>
          <Separator className="my-1 bg-border/60" />
          <div>
            <FieldLabel>Key dates</FieldLabel>
            <ul className="mt-2 space-y-2">
              {a.snapshot.keyDeadlines.map((d) => (
                <li
                  key={d.label + d.date}
                  className="flex flex-col gap-0.5 rounded-md border border-border/40 bg-background/50 px-3 py-2.5 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="font-medium text-foreground">{d.label}</span>
                  <span className="shrink-0 text-sm text-text-secondary">{d.date}</span>
                </li>
              ))}
            </ul>
          </div>
          {a.snapshot.solicitationUrl?.trim() ? (
            <>
              <Separator className="my-1 bg-border/60" />
              <div>
                <FieldLabel>Agency / portal</FieldLabel>
                <a
                  href={a.snapshot.solicitationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 block break-all text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  {a.snapshot.solicitationUrl}
                </a>
              </div>
            </>
          ) : null}
          {(a.snapshot.agencyContact.name ||
            a.snapshot.agencyContact.title ||
            a.snapshot.agencyContact.email ||
            a.snapshot.agencyContact.phone ||
            a.snapshot.agencyContact.organization) && (
            <>
              <Separator className="my-1 bg-border/60" />
              <div>
                <FieldLabel>Point of contact</FieldLabel>
                <p className="mt-1.5 text-sm leading-relaxed">
                  {a.snapshot.agencyContact.name}
                  {a.snapshot.agencyContact.title ? <span> · {a.snapshot.agencyContact.title}</span> : null}
                </p>
                {a.snapshot.agencyContact.organization ? (
                  <p className="text-sm text-text-secondary">{a.snapshot.agencyContact.organization}</p>
                ) : null}
                <p className="text-sm text-text-secondary">
                  {a.snapshot.agencyContact.email}
                  {a.snapshot.agencyContact.email && a.snapshot.agencyContact.phone ? " · " : null}
                  {a.snapshot.agencyContact.phone}
                </p>
              </div>
            </>
          )}
          <Separator className="my-1 bg-border/60" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel>Submission</FieldLabel>
              <p className="mt-1.5 text-sm leading-relaxed">{a.snapshot.submissionMethod}</p>
            </div>
            <div>
              <FieldLabel>Contract type</FieldLabel>
              <p className="mt-1.5 text-sm leading-relaxed">{a.snapshot.contractType}</p>
            </div>
          </div>
          <div>
            <FieldLabel>How you will be evaluated</FieldLabel>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{a.snapshot.evaluationSummary}</p>
          </div>
        </ReportSection>

        <ReportSection kicker="Fit" title="Why this opportunity matches (or not)" id="analysis-fit">
          <div>
            <FieldLabel>Drivers behind the score</FieldLabel>
            <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-7 text-foreground/95">
              {a.fit.topReasons.slice(0, 5).map((r) => (
                <li key={r.slice(0, 48)}>{r}</li>
              ))}
            </ol>
          </div>
          <div>
            <FieldLabel>Evidence in the RFP</FieldLabel>
            <ul className="mt-3 space-y-3">
              {a.fit.evidenceQuotes.map((q) => (
                <li
                  key={q}
                  className="flex gap-3 rounded-lg border border-border/50 bg-background/60 p-3 text-sm leading-relaxed text-text-secondary"
                >
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </ReportSection>
      </div>

      <ReportSection kicker="Narrative" title="What the government is trying to buy" id="analysis-opp">
        <p className="text-base font-medium text-foreground">Problem to solve</p>
        <p className="mt-2 text-sm leading-7 text-text-secondary">{a.opportunity.problem}</p>
        <p className="mt-5 text-base font-medium text-foreground">Why it matters to the mission</p>
        <p className="mt-2 text-sm leading-7 text-text-secondary">{a.opportunity.whyItMatters}</p>
        <p className="mt-5 text-base font-medium text-foreground">What the winner must prove</p>
        <p className="mt-2 text-sm leading-7 text-text-secondary">{a.opportunity.whatProposalMustProve}</p>
      </ReportSection>

      <ReportSection kicker="Positioning" title="Alignment with your organization" id="analysis-align">
        <div className="space-y-4">
          <p>
            <span className="font-semibold text-foreground">Where you line up: </span>
            <span className="text-text-secondary">{a.alignment.whereWeFit}</span>
          </p>
          <p>
            <span className="font-semibold text-foreground">Where evaluators may push: </span>
            <span className="text-text-secondary">{a.alignment.whereWeMayNot}</span>
          </p>
        </div>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border/40 bg-background/50 p-4">
            <p className="text-xs font-bold uppercase text-primary">Reusable in knowledge base</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-text-secondary">
              {a.alignment.knowledgeMatches.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-border/40 bg-background/50 p-4">
            <p className="text-xs font-bold uppercase text-amber-800 dark:text-amber-200/90">Proof to strengthen</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-text-secondary">
              {a.alignment.missingProof.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </ReportSection>

      <ReportSection kicker="Risk" title="Gaps, mitigations, and owners" id="analysis-gaps">
        <ul className="space-y-4">
          {a.gaps.map((g) => (
            <li key={g.gap} className="rounded-lg border-2 border-border/40 bg-background/40 p-4 sm:p-5">
              <p className="font-semibold text-foreground">{g.gap}</p>
              <p className="mt-2 text-sm text-text-secondary">
                <span className="font-medium text-foreground/90">Impact: </span>
                {g.impact} ·<span className="font-medium text-foreground/90"> Owner: </span>
                {g.owner}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                <span className="font-medium text-foreground/90">Mitigation: </span>
                {g.mitigation}
              </p>
            </li>
          ))}
        </ul>
      </ReportSection>

      <ReportSection kicker="Q&A" title="Strategic questions for the government" id="analysis-qs">
        <ul className="space-y-4">
          {a.questions.map((q) => (
            <li
              key={q.question}
              className="rounded-lg border-2 border-border/35 bg-surface/80 px-4 py-3 sm:px-5 sm:py-4"
            >
              <p className="font-medium text-foreground">{q.question}</p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{q.whyItMatters}</p>
            </li>
          ))}
        </ul>
      </ReportSection>

      <ReportSection kicker="Win plan" title="How to be scored well" id="analysis-win">
        <p>
          <span className="font-semibold">Positioning: </span>
          <span className="text-text-secondary">{a.winStrategy.positioning}</span>
        </p>
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-text-secondary">Emphasize</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-0.5 text-sm text-text-secondary">
            {a.winStrategy.differentiators.map((d) => (
              <li key={d} className="pl-1">
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <p className="text-xs font-bold uppercase text-text-secondary">Hot-button themes</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-0.5 text-sm text-text-secondary">
            {a.winStrategy.hotButtons.map((d) => (
              <li key={d} className="pl-1">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </ReportSection>

      <div className="flex flex-col gap-4 rounded-xl border-2 border-border/50 bg-surface/90 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-2">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm font-medium leading-relaxed text-foreground/90">{next.note}</p>
        </div>
        {a.recommendedNextStep !== "no_bid" ? (
          <Button onClick={onBeginDrafting} className="shrink-0 gap-1.5" size="default">
            {next.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      {a.recommendedNextStep === "no_bid" ? (
        <p className="text-center text-sm text-text-secondary">This profile is currently marked no-bid.</p>
      ) : null}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 border-t border-border/50 bg-gradient-to-t from-background via-background/95 to-transparent px-3 py-4 pt-8">
        <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col items-stretch gap-2 rounded-xl border-2 border-border/50 bg-surface/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-xs leading-relaxed text-text-secondary sm:text-sm">
            <BookOpen className="mr-1 inline h-3.5 w-3.5 -translate-y-px text-primary" />
            Ready? Move to the <strong className="font-semibold text-foreground">Response draft</strong> tab to work by volume.
          </p>
          {a.recommendedNextStep !== "no_bid" ? (
            <Button onClick={onBeginDrafting} className="w-full gap-1.5 sm:w-auto" size="default">
              Open response draft
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
