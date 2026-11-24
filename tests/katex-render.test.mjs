import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register("./helpers/extensionless-ts-hooks.mjs", import.meta.url);
const { renderMathContent } = await import("../lib/render-math-content.ts");

const TIGHT_COMMA = '<span class="mord"><span class="mpunct">,</span></span>';

test("bare % no longer swallows the rest of the formula", () => {
  const html = renderMathContent("$\\left[ 0,01 % + 5 \\right]$");
  assert.ok(!html.includes("katex-error"));
  assert.ok(html.includes("katex"));
});

test("decimal comma stays tight", () => {
  const html = renderMathContent("$0,07$");
  assert.ok(html.includes(TIGHT_COMMA), "comma must be wrapped as an ordinary symbol");
});

test("coordinate pairs and lists keep KaTeX punctuation", () => {
  for (const src of ["$(3,5)$", "$1,2,3$"]) {
    const html = renderMathContent(src);
    assert.ok(html.includes('<span class="mpunct">,</span>'), src);
    assert.ok(!html.includes(TIGHT_COMMA), src);
  }
});

test("dangling \\left and braces are closed, never a red error span", () => {
  for (const src of ["$\\left( x + 1$", "$\\frac{1}{2$", "$x + 1}$"]) {
    const html = renderMathContent(src);
    assert.ok(!html.includes("katex-error"), src);
    assert.ok(html.includes("katex"), src);
  }
});

test("unrepairable formula falls back to plain escaped text", () => {
  const html = renderMathContent("$\\right) x$");
  assert.ok(!html.includes("katex-error"));
  assert.ok(html.includes("\\right) x"));
});

test("currency $ pairs wrapping a sentence stay plain text", () => {
  const html = renderMathContent("Gaji $120,000 per tahun naik jadi $1 trillion dolar");
  assert.ok(!html.includes("katex"));
  assert.ok(html.includes("$120,000 per tahun naik jadi $"));
});

test("single-asterisk italic renders, bold and bullets are untouched", () => {
  assert.ok(
    renderMathContent("newly discovered *Pavona clavus*? It").includes("<em>Pavona clavus</em>?")
  );
  const bold = renderMathContent("a **tebal** b");
  assert.ok(bold.includes("<strong") && !bold.includes("<em>"));
  assert.ok(!renderMathContent("2 * 3 * 4").includes("<em>"));
  assert.ok(!renderMathContent("$a*b*c$ dan teks").includes("<em>"));
});

test("a lone numeric fraction renders as a stacked fraction, prose slashes do not", () => {
  const frac = renderMathContent("41/90");
  assert.ok(frac.includes("mfrac") && frac.includes("katex"));
  assert.ok(renderMathContent("-3/4").includes("mfrac"));
  assert.ok(!renderMathContent("60 km/jam").includes("katex"));
  assert.ok(!renderMathContent("dan/atau").includes("katex"));
  assert.ok(!renderMathContent("1/2 atau 3/4").includes("katex"));
});

test("real inline math is still rendered", () => {
  assert.ok(renderMathContent("Nilai $x^2 + 1$ adalah").includes("katex"));
});
