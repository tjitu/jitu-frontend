const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const element = tag => ({ children }) => React.createElement(tag, null, children);
const aliases = {
  '@/components/ui/button': { Button: element('button') },
  '@/components/ui/card': { Card: element('section'), CardHeader: element('header'), CardTitle: element('h2'), CardContent: element('div') },
  '@/lib/tryout-display': { getDisplayedParticipants: (_, count) => count },
  '@/lib/avatar': { PRESET_AVATARS: [{ id: 'avatar', url: '/avatar.png' }] },
  '@/lib/tryout-countdown': { getTryoutCountdown: () => 'Selesai' },
  './SubtestIcons': { getSubtestInfo: () => ({ IconComponent: element('svg'), name: 'Penalaran Umum' }) },
};
function compile(relative) {
  const filename = path.resolve(relative), mod = new Module(filename, module);
  mod.paths = Module._nodeModulePaths(process.cwd());
  const original = mod.require.bind(mod);
  mod.require = name => name in aliases ? aliases[name] : original(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText, filename);
  return mod.exports;
}
const { TryoutHeroHeader } = compile('modules/TryoutDetailModule/components/TryoutHeroHeader.tsx');
const { SubtestListCard } = compile('modules/TryoutDetailModule/components/SubtestListCard.tsx');
const data = { id: 'test', title: 'Tryout', participants: 0, correctCount: 12, wrongCount: 3, emptyCount: 5, resultsAvailable: false };
function hero(overrides = {}) {
  return renderToStaticMarkup(React.createElement(TryoutHeroHeader, {
    tryoutData: data, formatDate: value => value, isFinished: true, isUnlocked: false, finalScore: 650, ...overrides,
  }));
}
function subtests(overrides = {}) {
  return renderToStaticMarkup(React.createElement(SubtestListCard, {
    summaryOnly: true, isFinished: true, isUnlocked: false, cost: 1,
    categories: [{ id: 1, name: 'Penalaran Umum', duration: 30, questionCount: 20, correctCount: 12, wrongCount: 3, emptyCount: 5 }],
    onUnlockClick() {}, onStartSubtest() {}, ...overrides,
  }));
}
function count(html, label) {
  const match = html.match(new RegExp('>' + label + '</div><div[^>]*>([^<]+)</div>'));
  assert.ok(match, label + ' statistic must be visible');
  return match[1];
}
test('finished summary shows correct, wrong and empty counts before review release without exposing IRT', () => {
  const html = hero();
  assert.equal(count(html, 'Benar'), '12'); assert.equal(count(html, 'Salah'), '3'); assert.equal(count(html, 'Kosong'), '5');
  assert.ok(!html.includes('Skor IRT')); assert.ok(!html.includes('Review Hasil'));
});
test('an entirely unanswered attempt shows zero correct, zero wrong, and all empty questions', () => {
  const html = hero({ tryoutData: { ...data, correctCount: 0, wrongCount: 0, emptyCount: 20 } });
  assert.equal(count(html, 'Benar'), '0'); assert.equal(count(html, 'Salah'), '0'); assert.equal(count(html, 'Kosong'), '20');
});
test('released results remain locked until access is unlocked', () => {
  const html = hero({ tryoutData: { ...data, resultsAvailable: true } });
  assert.equal(count(html, 'Benar'), '-'); assert.equal(count(html, 'Salah'), '-'); assert.equal(count(html, 'Kosong'), '-');
  assert.equal(count(html, 'Skor IRT'), '???');
});
test('released unlocked results display empty count and score', () => {
  const html = hero({ tryoutData: { ...data, resultsAvailable: true }, isUnlocked: true });
  assert.equal(count(html, 'Kosong'), '5'); assert.equal(count(html, 'Skor IRT'), '650');
});
test('unfinished attempts do not display result counts', () => {
  const html = hero({ isFinished: false, isUnlocked: true });
  assert.equal(count(html, 'Benar'), '-'); assert.equal(count(html, 'Salah'), '-'); assert.equal(count(html, 'Kosong'), '-');
});
test('subtest summaries show empty counts while review actions remain unavailable', () => {
  const html = subtests();
  assert.match(html, /12 Benar/); assert.match(html, /3 Salah/); assert.match(html, /5 Kosong/);
  assert.ok(!html.includes('Bahas Subtes')); assert.ok(!html.includes('Upgrade'));
});
test('subtest released access gates still control counts and review actions', () => {
  const locked = subtests({ summaryOnly: false });
  assert.ok(!locked.includes('Kosong')); assert.ok(locked.includes('Upgrade'));
  const unlocked = subtests({ summaryOnly: false, isUnlocked: true });
  assert.match(unlocked, /5 Kosong/); assert.ok(unlocked.includes('Bahas Subtes'));
});
