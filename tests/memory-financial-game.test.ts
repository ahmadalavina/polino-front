import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  memoryFinancialDefaults,
  parseMemoryFinancialPayload,
} from '../src/features/memory-financial-game/memoryFinancialGame.ts';

test('admin defaults construct a valid memory payload', () => {
  assert.equal(parseMemoryFinancialPayload(memoryFinancialDefaults).success, true);
});

test('admin validation accepts first/second with non-empty type', () => {
  const result = parseMemoryFinancialPayload({
    title: 'حافظه مالی',
    maxAttempts: 5,
    pairs: [{ id: 'saving', first: { type: 'پس‌انداز' }, second: { type: 'هدف' } }],
  });
  assert.equal(result.success, true);
});

test('admin validation rejects an empty pairs array', () => {
  assert.equal(parseMemoryFinancialPayload({ pairs: [] }).success, false);
});

test('admin validation rejects a pair missing a side', () => {
  assert.equal(
    parseMemoryFinancialPayload({ pairs: [{ first: { type: 'پس‌انداز' } }] }).success,
    false,
  );
});

test('admin validation rejects a blank card label', () => {
  assert.equal(
    parseMemoryFinancialPayload({
      pairs: [{ first: { type: '   ' }, second: { type: 'هدف' } }],
    }).success,
    false,
  );
});

test('admin validation rejects a negative maxAttempts', () => {
  assert.equal(
    parseMemoryFinancialPayload({
      maxAttempts: -1,
      pairs: [{ first: { type: 'a' }, second: { type: 'b' } }],
    }).success,
    false,
  );
});

test('admin validation rejects the legacy cardA/cardB pair shape', () => {
  assert.equal(
    parseMemoryFinancialPayload({
      pairs: [{ id: 'saving', cardA: 'پس‌انداز', cardB: 'قرض' }],
    }).success,
    false,
  );
});

test('lesson renderer registers memory_financial with MemoryFinancialGame', async () => {
  const source = await readFile(
    new URL('../src/features/lesson-payer/component/LessonPlayer.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /case 'memory_financial':/);
  assert.match(source, /<MemoryFinancialGame/);
});
