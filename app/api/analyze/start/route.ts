import { after } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getGovRepository } from "@/lib/repository";
import { runOpportunityAnalysis } from "@/lib/agents/orchestrator";

const bodySchema = z.object({
  opportunityId: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "opportunityId required" }, { status: 400 });
  }

  const repo = getGovRepository();
  const opportunity = await repo.getOpportunity(parsed.data.opportunityId);
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  const { id: jobId } = await repo.createAgentJob(opportunity, "analyze");

  after(() => {
    void (async () => {
      try {
        await runOpportunityAnalysis(repo, jobId, opportunity);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Analysis failed";
        await repo.failJob(jobId, msg);
      }
    })();
  });

  return NextResponse.json({ jobId, message: "Analysis started" });
}
