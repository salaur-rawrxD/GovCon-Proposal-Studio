import { NextResponse } from "next/server";
import { getGovRepository } from "@/lib/repository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const repo = getGovRepository();
  const opportunity = await repo.getOpportunity(id);
  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [documents, analysis, executiveSummary] = await Promise.all([
    repo.listRfpDocuments(id),
    repo.getAnalysisState(id),
    repo.getProposalSection(opportunity, "executive_summary"),
  ]);
  return NextResponse.json({
    opportunity,
    documents,
    analysis,
    executiveSummary,
  });
}
