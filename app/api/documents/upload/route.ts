import { NextResponse } from "next/server";
import { z } from "zod";
import { getGovRepository } from "@/lib/repository";

const fieldSchema = z.object({
  opportunityId: z.string().min(1),
});

export async function POST(request: Request) {
  const form = await request.formData();
  const opportunityId = form.get("opportunityId");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  const fields = fieldSchema.safeParse({ opportunityId });
  if (!fields.success) {
    return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
  }
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const repo = getGovRepository();
  const opp = await repo.getOpportunity(fields.data.opportunityId);
  if (!opp) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await repo.addRfpDocument(opp, {
      buffer,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
    });
  }

  await repo.extractAndStoreAllChunks(opp);
  const documents = await repo.listRfpDocuments(opp.id);
  return NextResponse.json({ documents, message: "Uploaded and text extracted" });
}
