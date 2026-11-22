import assert from "node:assert/strict";
import fs from "node:fs";
import { register } from "node:module";
import test from "node:test";

register("./helpers/extensionless-ts-hooks.mjs", import.meta.url);
const { renderMathContent } = await import("../lib/render-math-content.ts");
const { renderSafeContentLists } = await import("../lib/safe-content-lists.ts");

const ATTACKS = [
  "<script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  '"><img src=x onerror=alert(1)>',
  "<svg onload=alert(1)>",
  '<a href="javascript:alert(1)">klik</a>',
  "<div onmouseover=alert(1)>hover</div>",
  "<iframe src=//evil.example></iframe>",
  "<style>@import 'https://evil.example/x.css'</style>",
  "<details open ontoggle=alert(1)>",
  "<input autofocus onfocus=alert(1)>",
  "<math><mi xlink:href=javascript:alert(1)>x</mi></math>",
];

// Anything that could execute or load something when it reaches innerHTML.
const DANGEROUS_TAG = /<\s*(script|img|iframe|object|embed|link|meta|style|form|input|button|textarea|details|video|audio|source|base|a)\b/i;
const SVG_TAG = /<\s*svg\b/i;
const EVENT_HANDLER = /<[^>]*\son[a-z]+\s*=/i;
// Only inside a real tag: escaped text such as "&lt;a href=javascript:x&gt;" is harmless.
const JS_URL = /<[^>]*\s(?:href|src|xlink:href|action|formaction)\s*=\s*["']?\s*(?:javascript|data|vbscript):/i;

// KaTeX itself draws square roots and long arrows with inline <svg>, so the real-content
// check allows <svg> (its event handlers and script URLs are still rejected). Hostile
// payloads never legitimately produce one, so everything else forbids it.
function assertInert(html, label, { allowSvg = false } = {}) {
  assert.ok(!DANGEROUS_TAG.test(html), `${label}: dangerous tag in ${html}`);
  if (!allowSvg) assert.ok(!SVG_TAG.test(html), `${label}: svg in ${html}`);
  assert.ok(!EVENT_HANDLER.test(html), `${label}: event handler in ${html}`);
  assert.ok(!JS_URL.test(html), `${label}: script URL in ${html}`);
}

test("renderMathContent turns hostile markup into inert text", () => {
  for (const attack of ATTACKS) {
    for (const wrapped of [attack, `Soal: ${attack} selesai`, `- ${attack}\n- lain`, `1. ${attack}\n2. lain`, `> ${attack}`, `**${attack}**`, `==${attack}==`, `✅ ${attack}`]) {
      assertInert(renderMathContent(wrapped), wrapped);
      assertInert(renderMathContent(wrapped, { animatedHighlights: true }), wrapped);
    }
  }
  assert.match(renderMathContent("<img src=x onerror=alert(1)>"), /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test("hostile text inside math is rendered by KaTeX, never as markup", () => {
  for (const attack of ATTACKS) {
    for (const wrapped of [`$${attack}$`, `$$${attack}$$`, `$\\text{${attack}}$`, `$$\\text{${attack}}$$`]) {
      assertInert(renderMathContent(wrapped), wrapped);
    }
  }
});

test("KaTeX trust-only commands cannot create script links or load resources", () => {
  for (const tex of [
    "$\\href{javascript:alert(1)}{klik}$",
    "$\\url{javascript:alert(1)}$",
    "$\\includegraphics{https://evil.example/x.png}$",
    "$\\htmlClass{x onclick=alert(1)}{a}$",
    "$\\htmlStyle{background:url(https://evil.example)}{a}$",
  ]) {
    assertInert(renderMathContent(tex), tex);
  }
});

test("hostile text inside LaTeX tables is escaped", () => {
  const tables = [
    "\\begin{tabular}{c|c} <img src=x onerror=alert(1)> & B \\\\ 1 & 2 \\end{tabular}",
    "\\begin{tabular}{c} \\textbf{<img src=x onerror=alert(1)>} \\end{tabular}",
    "$$\\begin{tabular}{c} <script>alert(1)</script> \\end{tabular}$$",
    "\\begin{tabular}{c} $<img src=x onerror=alert(1)>$ \\end{tabular}",
  ];
  for (const table of tables) {
    const html = renderMathContent(table);
    assert.match(html, /<table/, "table is still produced");
    assertInert(html, table);
  }
});

test("forged internal placeholders cannot smuggle content", () => {
  const html = renderMathContent("$x^2$ 0 1 <b>tebal</b>");
  assert.ok(!/[-]/.test(html), "reserved characters must be stripped");
  assert.equal((html.match(/class="katex"/g) || []).length, 1, "only the real formula is rendered");
});

test("legitimate formatting still renders", () => {
  assert.match(renderMathContent("**tebal**"), /<strong[^>]*>tebal<\/strong>/);
  assert.match(renderMathContent("==penting=="), /<mark[^>]*>penting<\/mark>/);
  assert.match(renderMathContent("1. satu\n2. dua"), /<ol[^>]*><li value="1">satu<\/li><li value="2">dua<\/li><\/ol>/);
  assert.match(renderMathContent("- a\n- b"), /<ul[^>]*><li>a<\/li><li>b<\/li><\/ul>/);
  assert.match(renderMathContent("> kutipan"), /<blockquote[^>]*>kutipan<\/blockquote>/);
  assert.match(renderMathContent("✅ Jadi jawabannya B"), /Jadi jawabannya B/);
  assert.match(renderMathContent("Nilai $x^2$ besar"), /class="katex"/);
  assert.match(renderMathContent("$$\\frac{1}{2}$$"), /step-math-card/);
  assert.match(
    renderMathContent("\\begin{tabular}{|c|c|} \\hline A & B \\\\ 1 & 2 \\end{tabular}"),
    /<table[\s\S]*<th[^>]*>A<\/th>[\s\S]*<td[^>]*>2<\/td>/
  );
});

test("plain text that merely looks like markup is displayed, not swallowed", () => {
  const html = renderMathContent("Gita < Hana dan p > q, serta R&D");
  assert.match(html, /Gita &lt; Hana dan p &gt; q, serta R&amp;D/);
  assert.ok(!/<\s*hana/i.test(html));
});

test("renderSafeContentLists escapes everything but keeps list structure and math as text", () => {
  for (const attack of ATTACKS) {
    assertInert(renderSafeContentLists(attack), attack);
    assertInert(renderSafeContentLists(`1. ${attack}\n2. dua`), attack);
    assertInert(renderSafeContentLists(`$${attack}$`), attack);
  }
  assert.match(renderSafeContentLists("1. satu\n2. dua"), /<ol[^>]*><li value="1">satu<\/li>/);
  assert.equal(renderSafeContentLists("a < b & c > d"), "a &lt; b &amp; c &gt; d");
  assert.equal(renderSafeContentLists("Nilai $a<b$"), "Nilai $a&lt;b$");
  assertInert(renderSafeContentLists("\\begin{tabular}{c} <img src=x onerror=alert(1)> \\end{tabular}"), "tabular");
  assert.match(renderSafeContentLists("\\begin{tabular}{c} A \\end{tabular}"), /<table/);
});

test("nothing in the real content corpus produces unsafe markup or throws", () => {
  const archive = JSON.parse(fs.readFileSync(new URL("../data/pintarly_soal_asli.json", import.meta.url), "utf8"));
  let rendered = 0;
  for (const pkg of archive.packages) {
    for (const question of pkg.questions) {
      const html = renderMathContent(question.text);
      assertInert(html, `${pkg.title} #${question.number}`, { allowSvg: true });
      rendered += 1;
    }
  }
  assert.ok(rendered > 3000, `expected the whole archive, rendered ${rendered}`);
});
