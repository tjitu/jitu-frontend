/** Normalize whitespace entities found in imported solution text. */
export function normalizeSolutionText(text: string): string {
  return text.replace(/&(?:nbsp|\#0*32|\#x0*20|\#0*160|\#x0*a0);/gi, " ");
}
