import { renderContentLists } from "./content-lists";
import { convertLatexTabularToHtml } from "./latex-tabular";
import { createVault, escapeHtml, stripReservedChars, toSafeText } from "./safe-html";

/**
 * List handling for raw, untrusted text that is inserted as HTML and has its formulas
 * rendered afterwards in the browser (KaTeX auto-render). Everything is escaped, so
 * `$a<b$` stays text until KaTeX reads it back; only the lists and tables built here are markup.
 */
export function renderSafeContentLists(raw: unknown): string {
  const text = toSafeText(raw);
  if (!text) return "";
  const vault = createVault();
  const withTables = convertLatexTabularToHtml(stripReservedChars(text), {
    renderText: escapeHtml,
    protect: vault.store,
  });
  return vault.restore(renderContentLists(escapeHtml(withTables)));
}
