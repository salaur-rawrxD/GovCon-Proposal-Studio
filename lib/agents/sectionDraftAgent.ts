import { withAiMode, completeJsonString } from "@/lib/ai/client";
import { executiveSummaryDraft } from "@/lib/ai/prompts";
import type { RfpSynthesis } from "./rfpParserAgent";
import type { CompatibilityResult } from "./compatibilityAgent";
import type { CapabilityProfile } from "@/lib/types";

export async function runExecutiveSummaryDraft(ctx: {
  rfp: RfpSynthesis;
  compatibility: CompatibilityResult;
  profile: CapabilityProfile | null;
}): Promise<string> {
  return withAiMode({
    mock: () => {
      const c = ctx.compatibility;
      return [
        `${ctx.rfp.opportunitySummary.split(".")[0]}.`,
        "",
        "Our team is positioned to meet the government’s delivery objectives with an agile, secure engineering cadence, transparent reporting, and rapid defect closure aligned to the evaluation priorities stated in the solicitation.",
        "",
        "We bring a repeatable DevSecOps pipeline, automated security gates, and cloud-native services that map directly to the technical factors under evaluation, while our past performance in federal civilian programs provides credible depth for similar scope, scale, and compliance posture.",
        "",
        `The engagement carries manageable risks, notably ${c.keyRisks[0]?.toLowerCase() ?? "schedule and page constraints"}; we mitigate through disciplined staffing, a named transition lead, and weekly executive reviews.`,
        "",
        "We are committed to mission outcomes: stable releases, measurable service levels, and a partnership model that extends beyond contract award through sustainment and knowledge transfer.",
      ].join("\n");
    },
    real: async () => {
      const raw = await completeJsonString({
        system: executiveSummaryDraft.system,
        user: JSON.stringify({
          task: "Return JSON: { content: string } for executive summary only.",
          rfp: ctx.rfp,
          compatibility: {
            fitSummary: ctx.compatibility.fitSummary,
            keyRisks: ctx.compatibility.keyRisks,
            score: ctx.compatibility.compatibilityScore,
          },
          profile: ctx.profile,
        }),
      });
      return (JSON.parse(raw) as { content: string }).content;
    },
  });
}
