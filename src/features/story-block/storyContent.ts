import { z } from 'zod';
import type {
  StoryContentAlign,
  StoryContentItem,
  StoryPayload,
} from '../../types/lesson.ts';

export const storyContentAligns: StoryContentAlign[] = ['start', 'center', 'end'];

const textItemSchema = z.object({
  type: z.literal('text'),
  value: z.string().trim().min(1, 'متن داستان نمی‌تواند خالی باشد.'),
});

const imageItemSchema = z.object({
  type: z.literal('image'),
  url: z.string().trim().min(1, 'آدرس تصویر نمی‌تواند خالی باشد.'),
  alt: z.string().trim().min(1).optional(),
  caption: z.string().trim().min(1).optional(),
  width: z
    .number()
    .int()
    .positive('عرض تصویر باید عددی مثبت باشد.')
    .optional(),
  align: z.enum(storyContentAligns).optional(),
});

export const storyContentItemSchema = z.discriminatedUnion('type', [
  textItemSchema,
  imageItemSchema,
]);

export const storyPayloadSchema = z
  .object({
    title: z.string().trim().optional(),
    content: z.array(storyContentItemSchema).optional(),
    // Legacy single-text story shape; migrated into `content` on read.
    text: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    const hasContent = Array.isArray(value.content) && value.content.length > 0;
    const hasLegacyText =
      typeof value.text === 'string' && value.text.trim().length > 0;
    if (!hasContent && !hasLegacyText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: 'داستان باید حداقل یک بخش متن یا تصویر داشته باشد.',
      });
    }
  });

export interface NormalizedStory {
  title?: string;
  content: StoryContentItem[];
}

function normalizeTextItem(item: z.infer<typeof textItemSchema>): StoryContentItem {
  return { type: 'text', value: item.value };
}

function normalizeImageItem(item: z.infer<typeof imageItemSchema>): StoryContentItem {
  return {
    type: 'image',
    url: item.url,
    alt: item.alt,
    caption: item.caption,
    width: item.width,
    align: item.align,
  };
}

export function parseStoryPayload(value: unknown) {
  const parsed = storyPayloadSchema.safeParse(value);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const content: StoryContentItem[] =
    Array.isArray(data.content) && data.content.length > 0
      ? data.content.map((item) =>
          item.type === 'text'
            ? normalizeTextItem(item)
            : normalizeImageItem(item),
        )
      : data.text && data.text.trim().length > 0
        ? [{ type: 'text', value: data.text }]
        : [];

  const normalized: NormalizedStory = {
    title: data.title && data.title.trim() ? data.title : undefined,
    content,
  };
  return { success: true as const, data: normalized };
}

export const storyDefaults: StoryPayload = {
  title: 'عنوان داستان',
  content: [
    { type: 'text', value: 'متن داستان را اینجا وارد کنید.' },
  ],
};
