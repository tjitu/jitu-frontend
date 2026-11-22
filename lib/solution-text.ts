/** Normalize whitespace entities found in imported solution text. */
export function normalizeSolutionText(text: unknown): string {
  if (typeof text !== "string") return text == null ? "" : String(text);
  return text.replace(/&(?:nbsp|\#0*32|\#x0*20|\#0*160|\#x0*a0);/gi, " ");
}
