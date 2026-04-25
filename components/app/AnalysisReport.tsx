import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CotsLikelihood, RfpFullAnalysis, FitRecommendation } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Quote, Target } from "lucide-react";

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

function Section({ title, children, id }: { title: string; children: ReactNode; id: string }) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm ring-1 ring-border/5" id={id}>
      <CardHeader className="border-b border-border/40 bg-muted/15 py-3">
        <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 text-sm leading-relaxed text-foreground">{children}</CardContent>
    </Card>
  );
}

export function AnalysisReport({ analysis, onBeginDrafting, className }: Props) {
  const a = analysis;
  const next = nextCta[a.recommendedNextStep] ?? nextCta.proceed_draft;
  return (
    <div className={cn("relative space-y-4", className)}>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <Section title="1. Solicitation snapshot" id="analysis-snapshot">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Agency / organization</p>
                <p className="mt-0.5 font-medium">{a.snapshot.agency}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Solicitation title</p>
                <p className="mt-0.5 font-medium">{a.snapshot.projectName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Key deadlines</p>
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                {a.snapshot.keyDeadlines.map((d) => (
                  <li key={d.label + d.date}>
                    <span className="text-foreground">{d.label}:</span> {d.date}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Submission method</p>
                <p className="mt-0.5">{a.snapshot.submissionMethod}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Contract type</p>
                <p className="mt-0.5">{a.snapshot.contractType}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Evaluation criteria summary</p>
              <p className="mt-1 text-muted-foreground">{a.snapshot.evaluationSummary}</p>
            </div>
          </Section>

          <Section title="2. Fit assessment" id="analysis-fit">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold tabular-nums text-foreground">{a.fit.score}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <Badge>{recLabel[a.fit.recommendation]}</Badge>
              <Badge variant="outline">COTS likelihood: {cots[a.fit.cotsLikelihood]}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Top five reasons</p>
              <ol className="mt-1 list-decimal space-y-1.5 pl-4 text-muted-foreground">
                {a.fit.topReasons.slice(0, 5).map((r) => (
                  <li key={r.slice(0, 40)} className="text-foreground/90">
                    {r}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Evidence from RFP wording</p>
              <ul className="mt-2 space-y-2">
                {a.fit.evidenceQuotes.map((q) => (
                  <li
                    key={q}
                    className="flex gap-2 rounded-md border border-border/50 bg-background/50 p-2 text-sm text-muted-foreground"
                  >
                    <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </div>
      </div>

      <Section title="3. Opportunity summary" id="analysis-opp">
        <p>
          <span className="font-medium text-foreground">What the agency is solving: </span>
          {a.opportunity.problem}
        </p>
        <p>
          <span className="font-medium text-foreground">Why it matters: </span>
          {a.opportunity.whyItMatters}
        </p>
        <p>
          <span className="font-medium text-foreground">What a strong proposal must prove: </span>
          {a.opportunity.whatProposalMustProve}
        </p>
      </Section>

      <Section title="4. Capability alignment" id="analysis-align">
        <p>
          <span className="font-medium">Where the company fits: </span>
          {a.alignment.whereWeFit}
        </p>
        <p>
          <span className="font-medium">Where the company may not fit: </span>
          {a.alignment.whereWeMayNot}
        </p>
        <div>
          <p className="font-medium">Knowledge base matches</p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {a.alignment.knowledgeMatches.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Missing proof points</p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {a.alignment.missingProof.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="5. Gaps + risks" id="analysis-gaps">
        <div className="space-y-3">
          {a.gaps.map((g) => (
            <div key={g.gap} className="rounded-lg border border-border/50 p-3">
              <p className="font-medium text-foreground">{g.gap}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium">Impact: </span>
                {g.impact} ·<span className="font-medium"> Owner: </span>
                {g.owner}
              </p>
              <p className="mt-1 text-sm">
                <span className="text-muted-foreground">Mitigation: </span>
                {g.mitigation}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="6. Strategic questions" id="analysis-qs">
        <ul className="space-y-3">
          {a.questions.map((q) => (
            <li key={q.question} className="rounded-md border border-border/40 p-2.5">
              <p className="font-medium">{q.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{q.whyItMatters}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="7. Win strategy" id="analysis-win">
        <p>
          <span className="font-medium">Positioning: </span>
          {a.winStrategy.positioning}
        </p>
        <div>
          <p className="font-medium">Differentiators to emphasize</p>
          <ul className="mt-1 list-inside list-disc">
            {a.winStrategy.differentiators.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-medium">Likely evaluation hot buttons</p>
          <ul className="mt-1 list-inside list-disc text-muted-foreground">
            {a.winStrategy.hotButtons.map((d) => (
              <li key={d} className="text-foreground/90">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="8. Recommended next step" id="analysis-next">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 text-primary" />
            <p className="text-muted-foreground">{next.note}</p>
          </div>
          {a.recommendedNextStep !== "no_bid" ? (
            <Button onClick={onBeginDrafting} className="shrink-0 gap-1" size="sm">
              {next.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </Section>

      <div className="pointer-events-none sticky bottom-0 z-10 -mx-1 border-t border-border/50 bg-gradient-to-t from-background via-background to-transparent py-3 dark:from-background">
        <div className="pointer-events-auto mx-auto max-w-3xl">
          {a.recommendedNextStep === "no_bid" ? (
            <p className="text-center text-sm text-muted-foreground">Recorded recommendation: no-bid for this opportunity profile.</p>
          ) : (
            <div className="flex flex-col items-stretch justify-center gap-2 rounded-xl border border-border/50 bg-card/95 p-3 shadow-lg ring-1 ring-border/10 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">When your team is aligned on fit and risk, open the response workspace to draft and review by volume.</p>
              <Button onClick={onBeginDrafting} className="w-full shrink-0 sm:w-auto" size="lg">
                Open response draft
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
