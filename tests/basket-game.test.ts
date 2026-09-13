import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  basketGameDefaults,
  cancelBasketAnimationFrame,
  createBasketCompletionRequest,
  getBasketLocalScore,
  getBasketRemainingSeconds,
  isBasketTimelineComplete,
  parseBasketGamePayload,
  tryBeginBasketSubmission,
} from '../src/features/basket-game/basketGame.ts';

test('admin defaults construct the exact nested basket payload', () => {
  assert.deepEqual(basketGameDefaults, {
    durationSeconds: 60,
    difficulty: { spawnIntervalMs: 800, fallingSpeed: 180, playerSpeed: 300, bombChance: 0.25 },
    scoring: { coinsPerPoint: 3, bombTimePenaltySeconds: 5 },
  });
  assert.equal(parseBasketGamePayload(basketGameDefaults).success, true);
});

test('admin validation rejects invalid basket values', () => {
  assert.equal(parseBasketGamePayload({ ...basketGameDefaults, durationSeconds: 0 }).success, false);
  assert.equal(parseBasketGamePayload({ ...basketGameDefaults, difficulty: { ...basketGameDefaults.difficulty, bombChance: 1.1 } }).success, false);
  assert.equal(parseBasketGamePayload({ ...basketGameDefaults, scoring: { ...basketGameDefaults.scoring, coinsPerPoint: 1.5 } }).success, false);
});

test('three default coins produce one local point', () => {
  assert.equal(getBasketLocalScore(3, basketGameDefaults.scoring.coinsPerPoint), 1);
});

test('bomb penalty reduces remaining time without changing elapsed time', () => {
  assert.equal(getBasketRemainingSeconds(60, 10, 5), 45);
});

test('timeline completes when elapsed time plus penalties reaches duration', () => {
  assert.equal(isBasketTimelineComplete(60, 50, 10), true);
  assert.equal(isBasketTimelineComplete(60, 49, 10), false);
});

test('completion body contains only backend-owned basket result inputs', () => {
  assert.deepEqual(createBasketCompletionRequest(10, 2, 50), {
    gameType: 'basket_game',
    basketCoinsCollected: 10,
    basketBombsHit: 2,
    basketElapsedSeconds: 50,
  });
});

test('submission guard prevents duplicate requests', () => {
  const flag = { current: false };
  assert.equal(tryBeginBasketSubmission(flag), true);
  assert.equal(tryBeginBasketSubmission(flag), false);
});

test('animation cleanup cancels and clears the active frame', () => {
  const frame = { current: 42 as number | null };
  let cancelled = 0;
  cancelBasketAnimationFrame(frame, (id) => { cancelled = id; });
  assert.equal(cancelled, 42);
  assert.equal(frame.current, null);
});

test('lesson renderer registers basket_game with BasketGame', async () => {
  const source = await readFile(new URL('../src/features/lesson-payer/component/LessonPlayer.tsx', import.meta.url), 'utf8');
  assert.match(source, /case 'basket_game':/);
  assert.match(source, /<BasketGame/);
});
