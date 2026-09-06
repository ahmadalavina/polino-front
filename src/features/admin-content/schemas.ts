import { z } from 'zod';

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
  ]),
  payload: z.record(z.string(), z.unknown()),
  lessonId: z.coerce.number().int().positive('یک درس انتخاب کنید.'),
});
