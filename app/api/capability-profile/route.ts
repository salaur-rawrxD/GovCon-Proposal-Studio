import { NextResponse } from "next/server";
import { z } from "zod";
import { getGovRepository } from "@/lib/repository";

const putSchema = z.object({
  title: z.string().optional(),
  narrative: z.string().optional(),
  differentiators: z.array(z.string()).optional(),
  past_performance_summary: z.string().optional(),
  key_personnel_summary: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});

export async function GET() {
  const repo = getGovRepository();
  const companyId = await repo.getDefaultCompanyId();
  const profile = await repo.getCapabilityProfile(companyId);
  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const json = await request.json();
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const repo = getGovRepository();
  const companyId = await repo.getDefaultCompanyId();
  const profile = await repo.upsertCapabilityProfile(companyId, parsed.data);
  return NextResponse.json({ profile });
}
