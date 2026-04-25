import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FitRecommendation } from "@/lib/mock/types";

const recLabel: Record<FitRecommendation, string> = {
  go: "Go",
  no_go: "No-Go",
  go_with_conditions: "Go with conditions",
};

export function FitScoreCard({
  fitScore,
  recommendation,
  className,
  compact,
}: {
  fitScore: number;
  recommendation: FitRecommendation;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Card className={cn("border-border/50 bg-card/50 ring-1 ring-border/5", className)}>
      <CardHeader className={cn("pb-2", compact && "p-4 pb-2")}>
        <CardDescription>Opportunity fit</CardDescription>
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-3xl tabular-nums sm:text-4xl">{fitScore}</CardTitle>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-xs font-medium",
              recommendation === "go" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
              recommendation === "no_go" && "border-destructive/30 bg-destructive/5 text-destructive",
              recommendation === "go_with_conditions" && "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200"
            )}
          >
            {recLabel[recommendation]}
          </span>
        </div>
      </CardHeader>
      <CardContent className={cn(compact && "p-4 pt-0")}>
        <Progress value={fitScore} className="h-2" />
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Index 0–100, combining solicitation fit against your content library, credentials, and past performance
          (illustrative scoring in this preview).
        </p>
      </CardContent>
    </Card>
  );
}
