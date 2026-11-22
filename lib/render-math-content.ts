import { renderContentLists } from "./content-lists";
import { normalizeSolutionText } from "./solution-text";
import katex from "katex";
import { convertLatexTabularToHtml } from "./latex-tabular";
import { createVault, escapeHtml, stripReservedChars, toSafeText } from "./safe-html";

export { toSafeText };

export interface RenderMathOptions {
  animatedHighlights?: boolean;
}

const BLOCK_MATH = /\$\$([\s\S]*?)\$\$/g;
const INLINE_MATH = /\$([^$\n]+?)\$/g;

const BLOCK_CARD_CLASS =
  "step-math-card my-2.5 py-2.5 px-4 rounded-xl bg-surface-muted/85 border border-primary/20 text-center overflow-x-auto text-sm sm:text-base";

function renderKatex(math: string, displayMode: boolean): string {
  // trust is false (KaTeX's default, stated on purpose): \href, \url, \includegraphics and
  // \html* stay disabled, so a formula can never create a link or load a resource.
  return katex.renderToString(math.trim(), { displayMode, throwOnError: false, trust: false });
}

function renderBlockMath(math: string): string {
  try {
    return `<div class="${BLOCK_CARD_CLASS}">${renderKatex(math, true)}</div>`;
  } catch {
    return `<div class="${BLOCK_CARD_CLASS.replace("text-center", "font-mono text-center")}">${escapeHtml(`$$${math}$$`)}</div>`;
  }
}

function renderInlineMath(math: string): string {
  try {
    return `<span class="inline-math px-0.5">${renderKatex(math, false)}</span>`;
  } catch {
    return escapeHtml(`$${math}$`);
  }
}

/** Plain text to safe HTML: formulas are rendered by KaTeX, everything else is escaped. */
function renderInlineText(text: string): string {
  const pattern = /\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g;
  let output = "";
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    output += escapeHtml(text.slice(last, match.index));
    output += match[1] !== undefined ? renderBlockMath(match[1]) : renderInlineMath(match[2]);
    last = match.index + match[0].length;
  }
  return output + escapeHtml(text.slice(last));
}

/**
 * Turns untrusted lesson text into HTML that is safe for dangerouslySetInnerHTML.
 *
 * The input is plain text with a little markup of our own (**bold**, ==highlight==, lists,
 * "> quote", "✅ note", $math$ and LaTeX tabulars). Any HTML in it is escaped and shown as
 * text. Markup that this function produces (KaTeX output, tables) is kept behind
 * placeholders while the text is processed, so user text can never be mistaken for it.
 */
export function renderMathContent(
  rawContent: unknown,
  options: RenderMathOptions = {}
): string {
  const content = toSafeText(rawContent);
  if (!content) return "";

  const { animatedHighlights = false } = options;
  const vault = createVault();

  // 0. Convert \begin{tabular}...\end{tabular} into HTML tables. Cells are rendered from raw
  //    text through renderInlineText, and each finished table goes into the vault.
  let processed = convertLatexTabularToHtml(normalizeSolutionText(stripReservedChars(content)), {
    renderText: renderInlineText,
    protect: vault.store,
  });

  // 1. Replace block math $$...$$ with a compact, balanced math card, then inline math
  //    $...$ naturally in prose flow. The rendered HTML is stored in the vault.
  processed = processed.replace(BLOCK_MATH, (_, math: string) => vault.store(renderBlockMath(math)));
  processed = processed.replace(INLINE_MATH, (_, math: string) => vault.store(renderInlineMath(math)));

  // 2. Whatever is left is plain text: escape it, build lists, then bring the trusted pieces back.
  processed = vault.restore(renderContentLists(escapeHtml(processed)));

  // 3. Special callout for checklist / conclusion lines starting with ✅
  processed = processed.replace(
    /^✅\s*(.*?)$/gm,
    `<div class="flex items-start gap-2.5 p-3 sm:p-3.5 my-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 font-semibold text-sm sm:text-[15px] leading-snug">
      <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px] mt-0.5">✓</span>
      <div class="flex-1">$1</div>
    </div>`
  );

  // 4. Blockquotes > ... (the text was escaped, so a leading ">" is now "&gt;")
  processed = processed.replace(
    /^(?:>|&gt;)\s*(.*?)$/gm,
    `<blockquote class="border-l-4 border-primary pl-3.5 py-2 my-2.5 bg-blue-50/50 rounded-r-xl text-sm sm:text-[15px] text-text-body italic leading-relaxed">$1</blockquote>`
  );

  // Clean extra newlines directly adjacent to block-level HTML cards so whitespace-pre-wrap stays crisp
  processed = processed
    .replace(/\n+(<(?:div|blockquote|ul|ol)\b)/g, "$1")
    .replace(/(<\/(?:div|blockquote|ul|ol)>)\n+/g, "$1");

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
