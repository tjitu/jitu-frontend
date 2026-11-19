import { normalizeSolutionText } from "@/lib/solution-text";
import katex from "katex";

export function InlineSolutionLabel({ text }: { text: string }) {
  return normalizeSolutionText(text).split(/(\$[^$\n]+\$)/g).map((part, index) => {
    if (!part.startsWith("$") || !part.endsWith("$") || part.length < 3) return part;
    return <span key={index} dangerouslySetInnerHTML={{
      __html: katex.renderToString(part.slice(1, -1), { throwOnError: false }),
    }} />;
  });
}
