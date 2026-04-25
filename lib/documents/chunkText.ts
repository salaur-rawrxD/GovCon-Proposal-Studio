const DEFAULT_SIZE = 3500;
const DEFAULT_OVERLAP = 200;

export function chunkText(
  text: string,
  options: { size?: number; overlap?: number } = {}
): string[] {
  const size = options.size ?? DEFAULT_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;
  const t = text.replace(/\r\n/g, "\n").trim();
  if (t.length <= size) return t ? [t] : [];
  const out: string[] = [];
  let i = 0;
  while (i < t.length) {
    const end = Math.min(i + size, t.length);
    out.push(t.slice(i, end));
    if (end >= t.length) break;
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return out;
}
