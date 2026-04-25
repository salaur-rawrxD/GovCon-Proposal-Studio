import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileInput } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { id: "word", label: "Word document" },
  { id: "pdf", label: "PDF" },
  { id: "gdoc", label: "Google Docs" },
  { id: "csv", label: "Compliance matrix (CSV)" },
  { id: "pkg", label: "Full submission package" },
];

const checks = [
  "Technical and management volumes use consistent page numbering and headers/footers.",
  "All Section L representations and certifications are included and signed (where required).",
  "Price / cost volumes cross-reference the CLIN structure in the RFP.",
  "Compliance matrix matches final proposal version number.",
];

type Props = {
  fileNameHint: string;
  onMarkSubmitted: () => void;
  showSubmittedCta: boolean;
  className?: string;
};

export function ExportPanel({ fileNameHint, onMarkSubmitted, showSubmittedCta, className }: Props) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((o) => (
          <Button key={o.id} type="button" variant="secondary" className="h-auto justify-start gap-2 py-3 text-left" disabled>
            <FileInput className="h-4 w-4 shrink-0" />
            <span>
              {o.label}
              <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">UI only in preview</span>
            </span>
          </Button>
        ))}
      </div>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Export checklist</CardTitle>
          <CardDescription>Validate before you submit through the official agency portal (mock).</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {checks.map((c) => (
              <li key={c} className="flex gap-2">
                <input type="checkbox" className="mt-0.5 rounded" readOnly tabIndex={-1} />
                {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">File naming (suggested)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-mono text-sm text-foreground">{fileNameHint}</p>
          <p className="text-muted-foreground">
            Add amendment version (e.g. A02) to the file name if the RFP is amended. Keep volume labels consistent
            (Vol I Technical, Vol II Cost).
          </p>
        </CardContent>
      </Card>
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader>
          <CardTitle className="text-base">Submission reminder</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Submit only through the method in Section L (e.g. agency portal, email to CO, or hard copy). This workspace
          does not transmit to the government. Keep proof of time-stamped receipt.
        </CardContent>
      </Card>
      {showSubmittedCta ? (
        <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Package prepared for your agency submission workflow.
          </div>
          <Button type="button" onClick={onMarkSubmitted} variant="default">
            Mark as submitted
          </Button>
        </div>
      ) : null}
    </div>
  );
}
