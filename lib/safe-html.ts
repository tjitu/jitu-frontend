/**
 * Helpers for turning untrusted text (question bank, scraped archives, AI output) into
 * HTML that is safe to hand to dangerouslySetInnerHTML.
 *
 * Rule of the pipeline: user text is always escaped. The only markup that may appear in
 * the final string is markup this code generated itself (KaTeX output, our own tables,
 * lists and callouts), and that markup is kept in a "vault" behind placeholders until the
 * very end, so user text can never be mistaken for it.
 */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Coerce any untrusted value (DB/JSON data) into a display string. */
export function toSafeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(toSafeText).filter(Boolean).join("\n");
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * Private-use characters reserved for placeholders. / belong to
 * renderContentLists, / to the vault below. They are stripped from input so
 * that user text cannot forge a placeholder.
 */
export function stripReservedChars(text: string): string {
  return text.replace(/[-]/g, "");
}

export interface HtmlVault {
  /** Stores trusted HTML and returns the placeholder that stands in for it. */
  store(html: string): string;
  /** Replaces placeholders with the stored HTML. Unknown placeholders are dropped. */
  restore(text: string): string;
}

export function createVault(): HtmlVault {
  const items: string[] = [];
  return {
    store(html) {
      return "" + (items.push(html) - 1) + "";
    },
    restore(text) {
      return text.replace(/(\d+)/g, (_match, index: string) => items[Number(index)] ?? "");
    },
  };
}
