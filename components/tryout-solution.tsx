"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import renderMathInElement from "katex/contrib/auto-render";
import InteractiveSolutionDeck from "./interactive-solution-deck";
import type { QuestionSolutionData } from "@/lib/practice-store";

export function TryoutSolution({ solution, explanation }: {
  solution?: QuestionSolutionData | null;
  explanation?: string | null;
}) {
  const legacy = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (legacy.current) renderMathInElement(legacy.current, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
      ],
      trust: false,
      throwOnError: false,
    });
  }, [solution, explanation]);
  if (solution) return <InteractiveSolutionDeck solution={solution} />;
  if (!explanation) return null;
  return (
    <div key={explanation} ref={legacy} className="prose prose-sm learning-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation.replace(/^•[ \t]+/gm, "* ")}</ReactMarkdown>
    </div>
  );
}
