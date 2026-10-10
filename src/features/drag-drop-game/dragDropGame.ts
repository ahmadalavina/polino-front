import { z } from 'zod';
import type {
  DragDropCompletionRequest,
  DragDropItem,
  DragDropPayload,
  DragDropPlacement,
  DragDropTarget,
} from '../../types/lesson.ts';

export const dragDropItemSchema = z.object({
  id: z.string().trim().min(1, 'شناسه گزینه نمی‌تواند خالی باشد.'),
  content: z.string().trim().min(1, 'متن گزینه نمی‌تواند خالی باشد.'),
});

export const dragDropTargetSchema = z.object({
  id: z.string().trim().min(1, 'شناسه هدف نمی‌تواند خالی باشد.'),
  label: z.string().trim().min(1, 'برچسب هدف نمی‌تواند خالی باشد.'),
  acceptsItemId: z.string().trim().min(1).optional(),
});

export const dragDropScoringSchema = z.object({
  correct: z.number().int('امتیاز پاسخ درست باید عدد صحیح باشد.').optional(),
  wrong: z.number().int('امتیاز پاسخ نادرست باید عدد صحیح باشد.').optional(),
  maxScore: z.number().int().nonnegative('سقف امتیاز نمی‌تواند منفی باشد.').optional(),
});

function normalizeItems(entries: Array<string | DragDropItem>): DragDropItem[] {
  return entries.map((entry, index) =>
    typeof entry === 'string' ? { id: `item-${index + 1}`, content: entry } : entry,
  );
}

function normalizeTargets(entries: Array<string | DragDropTarget>): DragDropTarget[] {
  return entries.map((entry, index) =>
    typeof entry === 'string' ? { id: `target-${index + 1}`, label: entry } : entry,
  );
}

export const dragDropPayloadSchema = z
  .object({
    introduction: z.string().trim().optional(),
    items: z
      .array(z.union([z.string().trim().min(1), dragDropItemSchema]))
      .min(1, 'حداقل یک گزینه لازم است.'),
    targets: z
      .array(z.union([z.string().trim().min(1), dragDropTargetSchema]))
      .min(1, 'حداقل یک هدف لازم است.'),
    scoring: dragDropScoringSchema.optional(),
    /** @deprecated legacy guidance field; migrated into `introduction` on read. */
    instruction: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    const items = normalizeItems(value.items);
    const targets = normalizeTargets(value.targets);

    const itemIds = new Set<string>();
    items.forEach((item, index) => {
      if (itemIds.has(item.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'id'],
          message: 'شناسه گزینه تکراری است.',
        });
      }
      itemIds.add(item.id);
    });

    const targetIds = new Set<string>();
    targets.forEach((target, index) => {
      if (targetIds.has(target.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['targets', index, 'id'],
          message: 'شناسه هدف تکراری است.',
        });
      }
      targetIds.add(target.id);
      if (target.acceptsItemId && !itemIds.has(target.acceptsItemId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['targets', index, 'acceptsItemId'],
          message: 'هدف به گزینه‌ای اشاره می‌کند که وجود ندارد.',
        });
      }
    });
  });

export interface NormalizedDragDrop {
  introduction?: string;
  items: DragDropItem[];
  targets: DragDropTarget[];
  scoring: { correct: number; wrong: number; maxScore?: number };
}

export function parseDragDropPayload(value: unknown) {
  const parsed = dragDropPayloadSchema.safeParse(value);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const normalized: NormalizedDragDrop = {
    introduction: data.introduction ?? data.instruction,
    items: normalizeItems(data.items),
    targets: normalizeTargets(data.targets),
    scoring: {
      correct: data.scoring?.correct ?? dragDropDefaults.scoring!.correct!,
      wrong: data.scoring?.wrong ?? dragDropDefaults.scoring!.wrong!,
      maxScore: data.scoring?.maxScore,
    },
  };
  return { success: true as const, data: normalized };
}

export const dragDropDefaults: DragDropPayload = {
  introduction: 'هر گزینه را در جای درست قرار بده.',
  items: [
    { id: 'item-coin', content: 'سکه' },
    { id: 'item-note', content: 'اسکناس' },
  ],
  targets: [
    { id: 'target-saving', label: 'پس‌انداز', acceptsItemId: 'item-coin' },
    { id: 'target-spending', label: 'هزینه', acceptsItemId: 'item-note' },
  ],
  scoring: { correct: 10, wrong: 0, maxScore: 100 },
};

export function isDragDropTargetCorrect(
  target: DragDropTarget,
  itemId: string | null,
): boolean {
  return Boolean(itemId) && target.acceptsItemId === itemId;
}

export function tryBeginDragDropSubmission(flag: { current: boolean }) {
  if (flag.current) return false;
  flag.current = true;
  return true;
}

export function createDragDropCompletionRequest(
  placements: DragDropPlacement[],
  startedAt?: string,
  completedAt?: string,
): DragDropCompletionRequest {
  return {
    gameType: 'drag_drop',
    dragDropPlacements: placements.map((placement) => ({
      itemId: placement.itemId,
      targetId: placement.targetId,
    })),
    startedAt,
    completedAt,
  };
}
