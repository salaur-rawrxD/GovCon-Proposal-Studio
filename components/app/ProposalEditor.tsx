import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ProposalSectionModel, ProposalSectionStatus } from "@/lib/mock/types";

const stLabel: Record<ProposalSectionStatus, string> = {
  not_started: "Not started",
  drafting: "Drafting",
  needs_review: "Needs review",
  revised: "Revised",
  approved: "Approved",
};

type Props = {
  section: ProposalSectionModel;
  onChange: (id: string, field: "body" | "inlineNotes" | "sourceRefs", value: string) => void;
  onSave: () => void;
  onApprove: () => void;
};

export function ProposalEditor({ section, onChange, onSave, onApprove }: Props) {
  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-1 border-b border-border/50 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">{section.title}</CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {stLabel[section.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground/90">Section goal: </span>
          {section.sectionGoal}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div>
          <Label className="text-xs text-muted-foreground">Draft content</Label>
          <Textarea
            value={section.body}
            onChange={(e) => onChange(section.id, "body", e.target.value)}
            className="mt-1 min-h-[220px] font-serif text-base leading-relaxed"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs text-muted-foreground">Inline notes (internal)</Label>
            <Textarea
              value={section.inlineNotes}
              onChange={(e) => onChange(section.id, "inlineNotes", e.target.value)}
              className="mt-1 min-h-[72px] text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Source references (placeholder)</Label>
            <Input
              value={section.sourceRefs}
              onChange={(e) => onChange(section.id, "sourceRefs", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onSave}>
            Save section
          </Button>
          <Button type="button" variant="secondary" onClick={onApprove} disabled={section.status === "approved"}>
            Approve section
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
