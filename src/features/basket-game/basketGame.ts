import { z } from 'zod';
import type { BasketGamePayload, BasketGameCompletionRequest } from '../../types/lesson.ts';

export const basketGameDefaults: BasketGamePayload = {
  durationSeconds: 60,
  difficulty: {
    spawnIntervalMs: 800,
    fallingSpeed: 180,
    playerSpeed: 300,
    bombChance: 0.25,
  },
  scoring: {
    coinsPerPoint: 3,
    bombTimePenaltySeconds: 5,
  },
};

export const basketGamePayloadSchema = z.object({
  durationSeconds: z.number().int().positive('مدت بازی باید یک عدد صحیح بزرگ‌تر از صفر باشد.'),
  difficulty: z.object({
    spawnIntervalMs: z.number().positive('فاصله ایجاد آیتم‌ها باید بزرگ‌تر از صفر باشد.'),
    fallingSpeed: z.number().positive('سرعت افتادن باید بزرگ‌تر از صفر باشد.'),
    playerSpeed: z.number().positive('سرعت بازیکن باید بزرگ‌تر از صفر باشد.'),
    bombChance: z.number().min(0, 'احتمال بمب نمی‌تواند منفی باشد.').max(1, 'احتمال بمب نمی‌تواند بیشتر از ۱ باشد.'),
  }),
  scoring: z.object({
    coinsPerPoint: z.number().int().positive('تعداد سکه برای امتیاز باید یک عدد صحیح مثبت باشد.'),
    bombTimePenaltySeconds: z.number().int().nonnegative('جریمه زمانی نمی‌تواند منفی باشد.'),
  }),
});

export function parseBasketGamePayload(value: unknown) {
  return basketGamePayloadSchema.safeParse(value);
}

export function getBasketLocalScore(coinsCollected: number, coinsPerPoint: number) {
  if (!Number.isInteger(coinsCollected) || coinsCollected < 0 || !Number.isInteger(coinsPerPoint) || coinsPerPoint <= 0) return 0;
  return Math.floor(coinsCollected / coinsPerPoint);
}

export function getBasketRemainingSeconds(durationSeconds: number, elapsedSeconds: number, penaltySeconds: number) {
  return Math.max(0, durationSeconds - elapsedSeconds - penaltySeconds);
}

export function isBasketTimelineComplete(durationSeconds: number, elapsedSeconds: number, penaltySeconds: number) {
  return getBasketRemainingSeconds(durationSeconds, elapsedSeconds, penaltySeconds) === 0;
}

export function tryBeginBasketSubmission(flag: { current: boolean }) {
  if (flag.current) return false;
  flag.current = true;
  return true;
}

export function cancelBasketAnimationFrame(frame: { current: number | null }, cancel: (id: number) => void) {
  if (frame.current === null) return;
  cancel(frame.current);
  frame.current = null;
}

export function createBasketCompletionRequest(
  coinsCollected: number,
  bombsHit: number,
  elapsedSeconds: number,
): BasketGameCompletionRequest {
  return {
    gameType: 'basket_game',
    basketCoinsCollected: Math.max(0, Math.floor(coinsCollected)),
    basketBombsHit: Math.max(0, Math.floor(bombsHit)),
    basketElapsedSeconds: Math.max(0, Math.floor(elapsedSeconds)),
  };
}
