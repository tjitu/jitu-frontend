/**
 * Converts LaTeX `\begin{tabular}...\end{tabular}` blocks (including `$ $\begin{tabular}...\end{tabular}$ $` wrappers)
 * into clean HTML `<table>` elements so KaTeX does not fail with red "No such environment: tabular" errors.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseColumnAlignments(spec: string): Array<"left" | "center" | "right"> {
  const aligns: Array<"left" | "center" | "right"> = [];
  for (const ch of spec) {
    if (ch === "l") aligns.push("left");
    else if (ch === "c") aligns.push("center");
    else if (ch === "r") aligns.push("right");
  }
  return aligns;
}

function renderCellContent(cell: string, isPlainText: boolean): string {
  const trimmed = cell.trim();
  if (!trimmed) return "&nbsp;";

  // Handle \textbf{...} and \text{...} when used inside tabular cells
  let processed = trimmed
    .replace(/\\textbf\{([^}]*)\}/g, "<strong>$1</strong>")
    .replace(/\\textit\{([^}]*)\}/g, "<em>$1</em>");

  if (isPlainText) {
    // Preserve inline math $...$ as-is for KaTeX auto-render, escape surrounding text carefully
    const parts = processed.split(/(\$[^$]+\$)/g);
    return parts
      .map((part) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          return part;
        }
        return part
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      })
      .join("");
  }

  return processed;
}

function splitTabularRows(body: string): string[] {
  // Split rows on \\ outside nested braces
  return body
    .split(/\\\\/g)
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && r !== "\\hline");
}

function buildHtmlTable(
  colSpec: string,
  body: string,
  isPlainText: boolean,
): string {
  const alignments = parseColumnAlignments(colSpec);
  const rawRows = splitTabularRows(body);

  const htmlRows: string[] = [];
  for (const rawRow of rawRows) {
    const cleanedRow = rawRow.replace(/\\hline/g, "").trim();
    if (!cleanedRow) continue;

    const cells = cleanedRow.split("&");
    const isHeaderRow = htmlRows.length === 0 && rawRow.includes("\\hline");
    const tag = isHeaderRow ? "th" : "td";

    const cellsHtml = cells
      .map((cell, idx) => {
        const align = alignments[idx] || "center";
        const content = renderCellContent(cell, isPlainText);
        const weightClass = isHeaderRow ? "font-semibold bg-slate-50 text-slate-900" : "text-slate-700";
        return `<${tag} class="border border-slate-300 px-3 py-2 text-${align} ${weightClass}">${content}</${tag}>`;
      })
      .join("");

    htmlRows.push(`<tr>${cellsHtml}</tr>`);
  }

  if (htmlRows.length === 0) return "";

  return `<div class="my-3 overflow-x-auto"><table class="min-w-full border-collapse border border-slate-300 text-sm">${htmlRows.join("")}</table></div>`;
}

/**
 * Replaces wrapped or bare `\begin{tabular}{...} ... \end{tabular}` blocks with HTML tables.
 * Preserves surrounding KaTeX math and HTML content.
 */
export function convertLatexTabularToHtml(
  input: string,
  options?: { escapePlainText?: boolean },
): string {
  if (!input || !input.includes("tabular")) return input;

  const isPlainText = options?.escapePlainText ?? false;

  // Match optional outer math delimiters like `$$ ... $$` or `$ $ ... $ $` or `$ ... $`
  const wrappedTabularRegex =
    /(?:\$\$\s*|\$\s+\$|\$\s*)?\\begin\{tabular\}\{([^}]*)\}([\s\S]*?)\\end\{tabular\}(?:\s*\$\$|\s*\$\s+\$|\s*\$)?/g;

  return input.replace(wrappedTabularRegex, (_match, colSpec: string, body: string) => {
    const tableHtml = buildHtmlTable(colSpec || "", body || "", isPlainText);
    return tableHtml || escapeHtml(_match);
  });
}

/**
 * Converts text containing `\begin{tabular}` into plain readable text for short preview snippets
 * without cutting mid-LaTeX command.
 */
export function sanitizePreviewSnippet(input: string, maxLength = 180): string {
  if (!input) return "";

  // First replace tabular blocks with a compact "[Tabel]" or row summary
  let cleaned = input.replace(
    /(?:\$\$\s*|\$\s+\$|\$\s*)?\\begin\{tabular\}\{[^}]*\}([\s\S]*?)\\end\{tabular\}(?:\s*\$\$|\s*\$\s+\$|\s*\$)?/g,
    (_m, body: string) => {
      const rows = splitTabularRows(body)
        .map((r) => r.replace(/\\hline/g, "").replace(/&/g, " | ").trim())
        .filter(Boolean);
      return rows.length > 0 ? ` [Tabel: ${rows.slice(0, 2).join("; ")}] ` : " [Tabel] ";
    },
  );

  cleaned = cleaned.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;

  // Avoid truncating mid-math `$ ... $`
  let slice = cleaned.slice(0, maxLength);
  const dollarCount = (slice.match(/\$/g) || []).length;
  if (dollarCount % 2 === 1) {
    const lastDollar = slice.lastIndexOf("$");
    if (lastDollar > 20) {
      slice = slice.slice(0, lastDollar).trim();
    }
  }
  return `${slice.trim()}...`;
}
