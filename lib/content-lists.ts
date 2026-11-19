/** Numbered passages from older imports sometimes arrive as a single paragraph. */
function splitNumberedPassage(line: string): string[] {
  if (!/^\s*\(1\)\s+\S/.test(line)) return [line];
  const rows = line.trimStart().split(/(?<=[.!?…])\s+(?=\(\d+\)\s+\S)/);
  return rows.every((row, index) => row.startsWith('(' + (index + 1) + ')'))
    ? rows
    : [line];
}

/** Turn flat text lists into native lists before inline emphasis and math are rendered. */
export function renderContentLists(text: string): string {
  const blocks: string[] = [];
  const content = text.replace(
    /\\begin\{tabular\}[\s\S]*?\\end\{tabular\}|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|<(ul|ol|table|pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi,
    block => '\uE000' + (blocks.push(block) - 1) + '\uE001',
  );
  const output: string[] = [];
  let mode: "bullet" | "decimal" | "parenthesized" | undefined;
  let items: string[] = [];

  function flush() {
    if (!mode) return;
    const tag = mode === "bullet" ? "ul" : "ol";
    const style = mode === "parenthesized" ? "learning-list numbered-passage" : "learning-list";
    output.push('<' + tag + ' class="' + style + '">' + items.join("") + '</' + tag + '>');
    items = [];
    mode = undefined;
  }

  const lines = content.split(/\r?\n/).flatMap(splitNumberedPassage);
  for (const [index, raw] of lines.entries()) {
    const bullet = raw.match(/^\s*[-*•]\s+(.+)$/);
    const body = bullet ? bullet[1] : raw.trimStart();
    const number = body.match(/^(?:\*\*\((\d+)\)\*\*|\((\d+)\)|(\d+)[.)])\s+(.+)$/);
    const negativeNumber = /^-\s+\d+(?:[.,]\d+)?\s*$/.test(raw.trimStart())
      && !/^\s*[-*•]\s/.test(lines[index - 1] ?? "")
      && !/^\s*[-*•]\s/.test(lines[index + 1] ?? "");
    if ((!number && !bullet) || negativeNumber) {
      flush();
      output.push(raw);
      continue;
    }
    const next = number ? (number[3] ? "decimal" : "parenthesized") : "bullet";
    if (next !== mode) flush();
    mode = next;
    if (number) {
      const value = Number(number[1] || number[2] || number[3]);
      items.push('<li value="' + value + '">' + number[4] + '</li>');
    } else {
      items.push('<li>' + body + '</li>');
    }
  }
  flush();
  return output.join("\n").replace(/\uE000(\d+)\uE001/g, (match, index: string) => blocks[Number(index)] ?? match);
}
