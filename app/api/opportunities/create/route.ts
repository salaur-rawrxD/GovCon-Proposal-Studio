import { NextResponse } from "next/server";
import { z } from "zod";
import { getGovRepository } from "@/lib/repository";

const bodySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, description } = parsed.data;
  const repo = getGovRepository();
  const opportunity = await repo.createOpportunity(title, description ?? null);
  return NextResponse.json({ opportunity });
}
