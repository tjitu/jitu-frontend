/** The authoring tools append this bracketed field to short-answer stems. */
export function splitQuestionGuidance(content: string) {
  const match = /\s*\[PETUNJUK\s+FORMAT\s*:\s*([^\]]+)\]\s*$/i.exec(content);
  return match
    ? { question: content.slice(0, match.index).trimEnd(), guidance: match[1].trim() }
    : { question: content, guidance: "" };
}
