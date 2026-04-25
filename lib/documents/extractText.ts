import "server-only";

export async function extractTextFromFile(buffer: Buffer, contentType: string, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (contentType.includes("text/plain") || lower.endsWith(".txt") || lower.endsWith(".md")) {
    return buffer.toString("utf-8");
  }
  if (contentType === "application/pdf" || lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text ?? "";
  }
  // Excel, Word, etc. — extend with mammoth, xlsx as needed; fail soft for MVP
  throw new Error(
    `Unsupported file type for text extraction: ${contentType || "unknown"}. ` +
      `Use PDF or plain text for this MVP.`
  );
}
