import { z } from 'zod';
import { basketGamePayloadSchema } from '@/features/basket-game/basketGame';
import { memoryFinancialPayloadSchema } from '@/features/memory-financial-game/memoryFinancialGame';

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined);

export const courseSchema = z.object({
  title: z.string().trim().min(2, 'نام دوره باید حداقل ۲ حرف داشته باشد.'),
  description: optionalText,
  cover: optionalText,
  order: z.coerce.number().int().min(1, 'ترتیب نمایش باید حداقل ۱ باشد.'),
  isPublished: z.boolean(),
});

export const courseUpdateSchema = z.object({
  title: z.string().trim().min(2, 'نام دوره باید حداقل ۲ حرف داشته باشد.').optional(),
  description: optionalText.optional(),
  cover: optionalText.optional(),
  order: z.coerce.number().int().min(1, 'ترتیب نمایش باید حداقل ۱ باشد.').optional(),
  isPublished: z.boolean().optional(),
}).partial();

export const lessonSchema = z.object({
  title: z.string().trim().min(2, 'نام درس باید حداقل ۲ حرف داشته باشد.'),
  description: optionalText,
  icon: optionalText,
  sortOrder: z.coerce.number().int().min(1, 'ترتیب درس باید حداقل ۱ باشد.'),
  rewardXp: z.coerce.number().int().min(0, 'امتیاز نمی‌تواند منفی باشد.'),
  rewardCoins: z.coerce.number().int().min(0, 'تعداد سکه نمی‌تواند منفی باشد.'),
  order: z.coerce.number().int().min(1, 'شماره درس باید حداقل ۱ باشد.'),
  courseId: z.coerce.number().int().positive('یک دوره انتخاب کنید.'),
  isPublished: z.boolean(),
});

export const lessonUpdateSchema = z.object({
  title: z.string().trim().min(2, 'نام درس باید حداقل ۲ حرف داشته باشد.').optional(),
  description: optionalText.optional(),
  icon: optionalText.optional(),
  sortOrder: z.coerce.number().int().min(1, 'ترتیب درس باید حداقل ۱ باشد.').optional(),
  rewardXp: z.coerce.number().int().min(0, 'امتیاز نمی‌تواند منفی باشد.').optional(),
  rewardCoins: z.coerce.number().int().min(0, 'تعداد سکه نمی‌تواند منفی باشد.').optional(),
  order: z.coerce.number().int().min(1, 'شماره درس باید حداقل ۱ باشد.').optional(),
  courseId: z.coerce.number().int().positive('یک دوره انتخاب کنید.').optional(),
  isPublished: z.boolean().optional(),
}).partial();

export const lessonBlockSchema = z.object({
  pageNumber: z.coerce.number().int().min(1),
  sortOrder: z.coerce.number().int().min(1, 'ترتیب بلاک باید حداقل ۱ باشد.'),
  type: z.enum([
    'dialog',
    'image',
    'quiz',
    'story',
    'reward',
    'animation',
    'video',
    'drag_drop',
    'drop_down',
    'question_block',
    'film_and_image',
    'coin_hunt',
    'memory_financial',
    'decision_tree',
    'basket_game',
  ]),
  payload: z.record(z.string(), z.unknown()),
  lessonId: z.coerce.number().int().positive('یک درس انتخاب کنید.'),
});

export const lessonBlockUpdateSchema = z.object({
  pageNumber: z.coerce.number().int().min(1).optional(),
  sortOrder: z.coerce.number().int().min(1, 'ترتیب بلاک باید حداقل ۱ باشد.').optional(),
  type: z.enum([
    'dialog',
    'image',
    'quiz',
    'story',
    'reward',
    'animation',
    'video',
    'drag_drop',
    'drop_down',
    'question_block',
    'film_and_image',
    'coin_hunt',
    'memory_financial',
    'decision_tree',
    'basket_game',
  ]).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  lessonId: z.coerce.number().int().positive('یک درس انتخاب کنید.').optional(),
}).partial();

export function validateBlockPayload(type: string, payload: unknown) {
  if (type === 'basket_game') return basketGamePayloadSchema.safeParse(payload);
  if (type === 'memory_financial') return memoryFinancialPayloadSchema.safeParse(payload);
  return z.record(z.string(), z.unknown()).safeParse(payload);
}
