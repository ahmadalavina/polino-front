import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createWordSearchCompletionRequest,
  createWordSearchSelection,
  doesSelectionMatchWord,
  normalizeWordSearchWord,
  parseWordSearchPayload,
  readWordSearchLine,
  wordSearchDefaults,
} from '../src/features/word-search-game/wordSearchGame.ts';

const grid = [
  ['ب', 'ا', 'ن', 'ک', 'خ'],
  ['د', 'ر', 'م', 'ب', 'ا'],
  ['س', 'ه', 'م', 'ج', 'ه'],
];

test('admin defaults parse into a normalized word search payload', () => {
  const result = parseWordSearchPayload(wordSearchDefaults);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.allowReverse, true);
    assert.equal(result.data.scoring.perWord, 10);
    assert.deepEqual(result.data.words, ['بانک']);
  }
});

test('normalization strips spaces and ZWNJ', () => {
  assert.equal(normalizeWordSearchWord('ب ا ن ک'), 'بانک');
  assert.equal(normalizeWordSearchWord('می\u200cرود'), 'میرود');
});

test('grid strings and matrices normalize to a rectangular character matrix', () => {
  const result = parseWordSearchPayload({
    grid: ['بانکخ', ['د', 'ر', 'م', 'ب', 'ا']],
    words: ['بانک'],
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.grid[0], ['ب', 'ا', 'ن', 'ک', 'خ']);
    assert.deepEqual(result.data.grid[1], ['د', 'ر', 'م', 'ب', 'ا']);
  }
});

test('ragged rows are rejected', () => {
  assert.equal(
    parseWordSearchPayload({ grid: ['بانک', 'در'], words: ['بانک'] }).success,
    false,
  );
});

test('empty words and empty grid are rejected', () => {
  assert.equal(parseWordSearchPayload({ grid, words: [] }).success, false);
  assert.equal(parseWordSearchPayload({ grid: [], words: ['بانک'] }).success, false);
});

test('horizontal line reads the correct cells and text', () => {
  const line = readWordSearchLine(grid, { row: 0, col: 0 }, { row: 0, col: 3 });
  assert.ok(line);
  assert.equal(line.text, 'بانک');
  assert.deepEqual(line.cells, [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 0, col: 3 },
  ]);
});

test('reverse line reads leftwards', () => {
  const line = readWordSearchLine(grid, { row: 2, col: 2 }, { row: 2, col: 0 });
  assert.ok(line);
  assert.equal(line.text, 'مهس');
  assert.deepEqual(line.cells, [
    { row: 2, col: 2 },
    { row: 2, col: 1 },
    { row: 2, col: 0 },
  ]);
});

test('non-linear selection is rejected', () => {
  assert.equal(readWordSearchLine(grid, { row: 0, col: 0 }, { row: 1, col: 2 }), null);
});

test('out-of-bounds selection is rejected', () => {
  assert.equal(readWordSearchLine(grid, { row: 0, col: 0 }, { row: 9, col: 0 }), null);
});

test('diagonal selections are detected in both directions', () => {
  const diagonalGrid = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];
  assert.equal(readWordSearchLine(diagonalGrid, { row: 0, col: 0 }, { row: 2, col: 2 })?.text, '159');
  assert.equal(readWordSearchLine(diagonalGrid, { row: 2, col: 2 }, { row: 0, col: 0 })?.text, '951');
});

test('selection match respects reverse allowance', () => {
  const selection = { word: 'ک ن ا ب', start: { row: 0, col: 0 }, end: { row: 0, col: 3 } };
  assert.equal(doesSelectionMatchWord(selection, ['بانک'], true), true);
  assert.equal(doesSelectionMatchWord(selection, ['بانک'], false), false);
});

test('createWordSearchSelection returns null for invalid lines', () => {
  assert.equal(createWordSearchSelection(grid, { row: 0, col: 0 }, { row: 1, col: 2 }), null);
});

test('completion request uses wordSearchSelections, not the legacy field', () => {
  const selection = { word: 'بانک', start: { row: 0, col: 0 }, end: { row: 0, col: 3 } };
  const dto = createWordSearchCompletionRequest([selection]);
  assert.deepEqual(dto, {
    gameType: 'word_search',
    wordSearchSelections: [selection],
    startedAt: undefined,
    completedAt: undefined,
  });
  assert.equal('wordSearchFoundWords' in dto, false);
});

test('lesson renderer registers word_search with WordSearchBlock', async () => {
  const source = await readFile(
    new URL('../src/features/lesson-payer/component/LessonPlayer.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /case 'word_search':/);
  assert.match(source, /<WordSearchBlock/);
});
