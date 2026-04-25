import { NextResponse } from "next/server";
import { getGovRepository } from "@/lib/repository";

export async function GET() {
  const repo = getGovRepository();
  const opportunities = await repo.listOpportunities();
  return NextResponse.json({ opportunities });
}
