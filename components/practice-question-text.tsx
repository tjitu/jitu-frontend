import { renderMathContent } from "@/lib/render-math-content";

function Passage({ text }: { text: string }) {
  const paragraphs = text.trim().split(/\r?\n\s*\r?\n/);
  const stanzas = paragraphs.map(part => /^\(Bait (\d+)\)[ \t]*\r?\n([\s\S]+)$/i.exec(part));
  const hasTitle = !stanzas[0] && !paragraphs[0].includes("\n");
  const start = hasTitle ? 1 : 0;
  if (stanzas.length > start && stanzas.slice(start).every(Boolean)) {
    return (
      <div className="space-y-4">
        {hasTitle && <div className="font-semibold" dangerouslySetInnerHTML={{ __html: renderMathContent(paragraphs[0]) }} />}
        {stanzas.slice(start).map((stanza, index) => stanza && (
          <div key={index}>
            <div className="text-sm font-semibold">Bait {stanza[1]}</div>
            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMathContent(stanza[2]) }} />
          </div>
        ))}
      </div>
    );
  }
  return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderMathContent(text) }} />;
}

export function PracticeQuestionText({ narration, question }: { narration?: string | null; question: string }) {
  return (
    <div className="learning-content space-y-4">
      {narration && <Passage text={narration} />}
      <div className="whitespace-pre-wrap font-medium" dangerouslySetInnerHTML={{ __html: renderMathContent(question) }} />
    </div>
  );
}
