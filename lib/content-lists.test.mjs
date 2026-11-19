import assert from "node:assert/strict";
import test from "node:test";
import { renderContentLists } from "./content-lists.ts";
import { splitQuestionGuidance } from "./question-guidance.ts";

test("historical bullets and numbered passages retain one marker per item", () => {
  const numbered = renderContentLists("(1) Survei dilakukan. (2) Hasilnya dicatat.");
  assert.match(numbered, /<ol[^>]*><li value="1">Survei dilakukan\.<\/li><li value="2">/);
  assert.match(renderContentLists("- **(3)** Bukti\n- **(4)** Contoh"), /<li value="3">Bukti<\/li><li value="4">Contoh/);
  assert.match(renderContentLists("• Awal\n- Akhir"), /<ul[^>]*><li>Awal<\/li><li>Akhir/);
  assert.match(renderContentLists("- 3\n- 4"), /<li>3<\/li><li>4<\/li>/);
});

test("verse, math, inline references, and existing lists keep their meaning", () => {
  for (const input of [
    "(Bait 2)\nAngin membisikkan kabar\ndan laut menyimpan rindu",
    "Periksa (1) dan (2).", "- 3", "$$x\n- 2$$", "\\[x\n- 2\\]",
    "<ol><li>Isi</li></ol>", "Anak-anak berlari di tepi dermaga",
  ]) assert.equal(renderContentLists(input), input);
});

test("only a trailing answer-format tag is lifted out of the stem", () => {
  assert.deepEqual(splitQuestionGuidance("Bait berapa?\n\n[PETUNJUK FORMAT: Angka saja.]"), {
    question: "Bait berapa?", guidance: "Angka saja.",
  });
  const quoted = "Jelaskan [PETUNJUK FORMAT: angka] dalam kutipan ini.";
  assert.equal(splitQuestionGuidance(quoted).question, quoted);
});
