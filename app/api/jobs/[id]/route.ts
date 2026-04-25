import { NextResponse } from "next/server";
import { getGovRepository } from "@/lib/repository";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const repo = getGovRepository();
  const job = await repo.getAgentJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ job });
}
