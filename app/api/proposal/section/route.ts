import { NextResponse } from "next/server";
import { z } from "zod";
import { getGovRepository } from "@/lib/repository";

const putSchema = z.object({
  opportunityId: z.string().min(1),
  sectionKey: z.string().min(1),
  title: z.string().min(1),
  content: z.string(),
});

export async function PUT(request: Request) {
  const json = await request.json();
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { opportunityId, sectionKey, title, content } = parsed.data;
  const repo = getGovRepository();
  const opportunity = await repo.getOpportunity(opportunityId);
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }
  await repo.saveProposalSection(opportunity, sectionKey, title, content);
  return NextResponse.json({ ok: true });
}
