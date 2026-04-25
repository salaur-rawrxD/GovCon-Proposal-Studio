import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Project, ProposalSectionModel } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const outline = [
  { id: "cover", t: "Cover page" },
  { id: "executive", t: "Executive summary" },
  { id: "need", t: "Understanding of need" },
  { id: "technical", t: "Proposed solution / technical approach" },
  { id: "ux", t: "UX / user-centered design approach" },
  { id: "pm", t: "Project management approach" },
  { id: "implementation", t: "Implementation timeline" },
  { id: "staffing", t: "Staffing plan" },
  { id: "past_performance", t: "Past performance" },
  { id: "risk", t: "Risk management" },
  { id: "accessibility", t: "Accessibility and compliance" },
  { id: "pricing", t: "Pricing assumptions" },
  { id: "appendices", t: "Appendices" },
];

type Props = {
  project: Project;
  sections: ProposalSectionModel[];
  onRegenerate: () => void;
  onExport: () => void;
  className?: string;
};

export function FinalDocumentPreview({ project, sections, onRegenerate, onExport, className }: Props) {
  const byId = Object.fromEntries(sections.map((s) => [s.id, s]));
  return (
    <div className={cn("space-y-4", className)}>
      <Card className="border-border/50 print:shadow-none ring-1 ring-border/5">
        <CardHeader>
          <CardDescription>Compiled response (preview)</CardDescription>
          <CardTitle className="text-xl">{project.rfpTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {project.agency} · Response due {project.dueDate}
          </p>
        </CardHeader>
        <CardContent className="space-y-6 font-serif text-sm leading-relaxed">
          <section className="rounded-lg border-2 border-foreground/80 bg-gradient-to-b from-muted/20 to-card px-8 py-10 text-center">
            <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">Technical proposal</h2>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">{project.name}</h1>
            <p className="mt-2 text-muted-foreground">{project.agency}</p>
            <p className="mt-6 text-xs text-muted-foreground">Planned submission: {project.dueDate}</p>
          </section>
          <div>
            <h3 className="mb-2 font-sans text-sm font-semibold">Table of contents</h3>
            <ol className="list-decimal space-y-1 pl-5 font-sans text-sm">
              {outline.map((o, i) => (
                <li key={o.id}>
                  {i + 1}. {o.t}
                </li>
              ))}
              <li>Compliance matrix (attachment A)</li>
            </ol>
          </div>
          {outline.slice(1).map((o) => {
            const s = byId[o.id];
            if (!s) return null;
            if (s.status !== "approved") return null;
            return (
              <section key={o.id} id={o.id} className="scroll-mt-4 border-b border-border/40 pb-4">
                <h3 className="mb-2 font-sans text-base font-semibold">{s.title}</h3>
                <p className="whitespace-pre-wrap text-foreground/90">{s.body.slice(0, 1200)}{s.body.length > 1200 ? "…" : ""}</p>
              </section>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Attachments: compliance matrix and evidence index (included in the full export package when enabled).
          </p>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onRegenerate}>
          Refresh preview
        </Button>
        <Button type="button" onClick={onExport}>
          Export
        </Button>
      </div>
    </div>
  );
}
