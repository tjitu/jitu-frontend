import { renderMathContent } from "@/lib/render-math-content";

export function AnswerFormatGuide({ text, id }: { text: string; id?: string }) {
  if (!text) return null;
  return (
    <div id={id} className="answer-format-guide">
      <span className="font-semibold">Format jawaban</span>{" · "}
      <span dangerouslySetInnerHTML={{ __html: renderMathContent(text) }} />
    </div>
  );
}
