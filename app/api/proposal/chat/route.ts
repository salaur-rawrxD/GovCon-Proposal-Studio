import { NextResponse } from "next/server";
import { z } from "zod";
import { getGovRepository } from "@/lib/repository";
import { runEditorAgent } from "@/lib/agents/editorAgent";

const bodySchema = z.object({
  opportunityId: z.string().min(1),
  sectionKey: z.string().min(1),
  message: z.string().min(1),
  currentContent: z.string(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { opportunityId, sectionKey, message, currentContent } = parsed.data;
  const repo = getGovRepository();
  const opportunity = await repo.getOpportunity(opportunityId);
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }
  const section = await repo.getProposalSection(opportunity, sectionKey);
  const text = currentContent || section?.content || "";
  const { compatibility } = await repo.getAnalysisState(opportunityId);
  const context = [compatibility?.fit_summary ?? "", compatibility?.opportunity_summary ?? ""]
    .filter(Boolean)
    .join("\n");
  const content = await runEditorAgent({ sectionContent: text, userMessage: message, context });
  await repo.saveProposalSection(opportunity, sectionKey, section?.title ?? "Section", content);
  return NextResponse.json({ content });
}
