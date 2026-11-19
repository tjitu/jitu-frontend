import katex from "katex";
import { convertLatexTabularToHtml } from "./latex-tabular";

export interface RenderMathOptions {
  animatedHighlights?: boolean;
}

export function renderMathContent(
  content: string,
  options: RenderMathOptions = {}
): string {
  if (!content) return "";

  const { animatedHighlights = false } = options;

  // 0. Convert \begin{tabular}...\end{tabular} into HTML tables before KaTeX parsing
  const preNormalized = convertLatexTabularToHtml(content);

  // 1. Replace block math $$...$$ with compact, balanced math card
  let processed = preNormalized.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="step-math-card my-2.5 py-2.5 px-4 rounded-xl bg-surface-muted/85 border border-primary/20 text-center overflow-x-auto text-sm sm:text-base">${rendered}</div>`;
    } catch {
      return `<div class="step-math-card my-2.5 py-2.5 px-4 rounded-xl bg-surface-muted/85 border border-primary/20 font-mono text-center overflow-x-auto text-sm sm:text-base">$$${math}$$</div>`;
    }
  });

  // 2. Replace inline math $...$ naturally in prose flow without boxy badges
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return `<span class="inline-math px-0.5">${katex.renderToString(
        math.trim(),
        { displayMode: false, throwOnError: false }
      )}</span>`;
    } catch {
      return `$${math}$`;
    }
  });

  // 3. Special callout for checklist / conclusion lines starting with ✅
  processed = processed.replace(
    /^✅\s*(.*?)$/gm,
    `<div class="flex items-start gap-2.5 p-3 sm:p-3.5 my-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 font-semibold text-sm sm:text-[15px] leading-snug">
      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] mt-0.5">✓</span>
      <div class="flex-1">$1</div>
    </div>`
  );

  // 4. Blockquotes > ...
  processed = processed.replace(
    /^>\s*(.*?)$/gm,
    `<blockquote class="border-l-4 border-primary pl-3.5 py-2 my-2.5 bg-blue-50/50 rounded-r-xl text-sm sm:text-[15px] text-text-body italic leading-relaxed">$1</blockquote>`
  );

  // Clean extra newlines directly adjacent to block-level HTML cards so whitespace-pre-wrap stays crisp
  processed = processed
    .replace(/\n+(<(?:div|blockquote)\b)/g, "$1")
    .replace(/(<\/(?:div|blockquote)>)\n+/g, "$1");

  // 5. Highlight syntax ==text== -> yellow animated stabilo ONLY for truly crucial insights
  if (animatedHighlights) {
    processed = processed.replace(
      /(?<!=)==([^\n]+?)(?<!=)==(?!=)/g,
      `<mark class="step-highlight-animated">$1</mark>`
    );
  } else {
    processed = processed.replace(
      /(?<!=)==([^\n]+?)(?<!=)==(?!=)/g,
      `<mark class="px-1 py-0.5 rounded bg-yellow-100 font-semibold text-text">$1</mark>`
    );
  }

  // 6. Standard markdown **text** -> clean bold without yellow stabilo
  processed = processed.replace(
    /\*\*(.*?)\*\*/g,
    `<strong class="font-bold text-text">$1</strong>`
  );

  return processed;
}

