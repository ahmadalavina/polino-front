import { z } from 'zod';
import type { MemoryFinancialPayload } from '../../types/lesson.ts';

const sideSchema = z.object({
  type: z.string().trim().min(1, 'متن روی کارت نمی‌تواند خالی باشد.'),
});

const pairSchema = z.object({
  id: z.string().trim().min(1).optional(),
  first: sideSchema,
  second: sideSchema,
});

export const memoryFinancialPayloadSchema = z.object({
  title: z.string().trim().optional(),
  introduction: z.string().trim().optional(),
  maxAttempts: z.number().int().nonnegative('حداکثر تلاش نمی‌تواند منفی باشد.').optional(),
  pairs: z
    .array(pairSchema)
    .min(1, 'حداقل یک جفت کارت لازم است.'),
});

export function parseMemoryFinancialPayload(value: unknown) {
  return memoryFinancialPayloadSchema.safeParse(value);
}

export const memoryFinancialDefaults: MemoryFinancialPayload = {
  title: 'حافظه مالی',
  introduction: 'کارت‌های مرتبط را پیدا کن و جفت‌ها را کامل کن!',
  pairs: [
    { id: 'saving', first: { type: 'پس‌انداز' }, second: { type: 'هدف' } },
  ],
};
