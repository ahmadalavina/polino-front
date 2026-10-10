'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  GripVertical,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import type { DragDropTarget } from '@/types/lesson';
import {
  createDragDropCompletionRequest,
  isDragDropTargetCorrect,
  parseDragDropPayload,
  tryBeginDragDropSubmission,
} from '@/features/drag-drop-game/dragDropGame';

interface Props {
  blockId: number;
  payload: unknown;
  onNext: () => void;
}

export default function DragDropBlock({ blockId, payload, onNext }: Props) {
  const config = useMemo(() => {
    const parsed = parseDragDropPayload(payload);
    return parsed.success ? parsed.data : null;
  }, [payload]);

  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const startedAt = useRef(new Date().toISOString());
  const submitGuard = useRef(false);

  const items = config?.items ?? [];
  const targets = config?.targets ?? [];

  const usedItemIds = useMemo(
    () => new Set(Object.values(placements).filter((id): id is string => id !== null)),
    [placements],
  );
  const isComplete = targets.length > 0 && targets.every((target) => placements[target.id]);
  const isCorrect = targets.every((target) =>
    isDragDropTargetCorrect(target, placements[target.id] ?? null),
  );

  function placeItem(itemId: string, target: DragDropTarget) {
    setPlacements((current) => {
      const next: Record<string, string | null> = { ...current };
      for (const key of Object.keys(next)) {
        if (next[key] === itemId) next[key] = null;
      }
      next[target.id] = itemId;
      return next;
    });
    setSelectedItemId(null);
    setChecked(false);
  }

  function removePlacement(targetId: string) {
    setPlacements((current) => ({ ...current, [targetId]: null }));
    setChecked(false);
  }

  function reset() {
    setPlacements({});
    setSelectedItemId(null);
    setChecked(false);
    setSubmitResult(null);
    setError('');
    startedAt.current = new Date().toISOString();
    submitGuard.current = false;
  }

  const handleSubmit = useCallback(async () => {
    if (!isComplete || isSubmitting) return;
    if (!tryBeginDragDropSubmission(submitGuard)) return;
    setIsSubmitting(true);
    setError('');
    const dto = createDragDropCompletionRequest(
      targets
        .map((target) => {
          const itemId = placements[target.id];
          return itemId ? { itemId, targetId: target.id } : null;
        })
        .filter((placement): placement is { itemId: string; targetId: string } => placement !== null),
      startedAt.current,
      new Date().toISOString(),
    );
    try {
      const response = await api.completeGame(blockId, dto);
      setSubmitResult(response.completed);
      if (response.balance) {
        useGameStore.getState().setBalance(response.balance);
      }
    } catch (e) {
      submitGuard.current = false;
      setError(e instanceof Error ? e.message : 'ثبت نتیجه ناموفق بود.');
      setSubmitResult(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isComplete, isSubmitting, targets, placements, blockId]);

  function handlePrimaryAction() {
    if (checked) {
      if (!isCorrect) {
        handleSubmit();
        return;
      }
      if (isCorrect && submitResult) {
        onNext();
        return;
      }
    }
    setChecked(true);
  }

  if (!config || items.length === 0 || targets.length === 0) {
    return (
      <div className="p-8 text-center font-bold text-danger">
        بلوک کشیدن و رها کردن کامل نیست.
      </div>
    );
  }

  return (
    <div className="min-h-[430px] p-5 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-[20px] bg-info-soft text-cyan-strong shadow-[0_5px_0_var(--info-soft)]">
          <GripVertical size={32} strokeWidth={2.8} />
        </div>
        <h2 className="mb-2 text-xl font-black text-foreground">
          هر گزینه رو به جای درست ببر
        </h2>
        <p className="text-sm font-bold leading-7 text-muted">
          {config.introduction ?? 'گزینه‌ها را بکش یا لمس کن و در کادر درست قرار بده.'}
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border-2 border-border bg-surface-muted p-4">
          <p className="mb-3 text-xs font-black text-subtle">گزینه‌ها</p>
          <div className="space-y-3">
            {items.map((item) => {
              const isUsed = usedItemIds.has(item.id);
              const isSelected = selectedItemId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  draggable={!isUsed}
                  disabled={isUsed}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', item.id);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                  className={`flex min-h-14 w-full items-center gap-2 rounded-2xl border-2 px-4 text-start text-sm font-black transition-all ${
                    isUsed
                      ? 'cursor-not-allowed border-border bg-surface-muted text-subtle'
                      : isSelected
                        ? 'border-cyan bg-info-soft text-info-strong shadow-[0_4px_0_var(--info-soft)]'
                        : 'border-border bg-surface text-foreground shadow-[0_4px_0_var(--border)] active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <GripVertical size={18} className="shrink-0 text-subtle" />
                  {item.content}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[22px] border-2 border-info-soft bg-info-soft p-4">
          <p className="mb-3 text-xs font-black text-cyan-strong">جای پاسخ‌ها</p>
          <div className="space-y-3">
            {targets.map((target) => {
              const itemId = placements[target.id] ?? null;
              const hasItem = itemId !== null;
              const placedItem = items.find((item) => item.id === itemId);
              const targetIsCorrect = isDragDropTargetCorrect(target, itemId);

              return (
                <button
                  key={target.id}
                  type="button"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedItemId = event.dataTransfer.getData('text/plain');
                    if (droppedItemId) {
                      placeItem(droppedItemId, target);
                    }
                  }}
                  onClick={() => {
                    if (selectedItemId !== null) {
                      placeItem(selectedItemId, target);
                    } else if (hasItem) {
                      removePlacement(target.id);
                    }
                  }}
                  className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed px-4 text-start transition-all ${
                    checked
                      ? targetIsCorrect
                        ? 'border-success bg-success-soft text-success-soft-foreground'
                        : 'border-danger bg-danger-soft text-danger'
                      : hasItem
                        ? 'border-cyan bg-surface text-foreground'
                        : 'border-info-soft bg-surface/70 text-subtle'
                  }`}
                >
                  <span>
                    <span className="block text-[11px] font-bold opacity-70">
                      {target.label}
                    </span>
                    <span className="mt-1 block text-sm font-black">
                      {placedItem ? placedItem.content : 'اینجا قرار بده'}
                    </span>
                  </span>
                  {checked &&
                    (targetIsCorrect ? (
                      <CheckCircle2 className="shrink-0" size={22} />
                    ) : (
                      <XCircle className="shrink-0" size={22} />
                    ))}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {checked && (
        <div
          className={`mb-5 rounded-2xl px-4 py-3 text-center text-sm font-black ${
            isCorrect && submitResult
              ? 'bg-success-soft text-success-soft-foreground'
              : isCorrect
              ? 'bg-success-soft text-success-soft-foreground'
              : 'bg-danger-soft text-danger'
          }`}
        >
          {submitResult
            ? 'عالی بود! همه گزینه‌ها درست هستند.'
            : checked && !isCorrect
            ? 'بعضی گزینه‌ها درست نیستند؛ دوباره امتحان کن.'
            : 'بعضی گزینه‌ها درست نیستند؛ دوباره امتحان کن.'}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl bg-danger-soft px-4 py-3 text-center text-sm font-black text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={!isComplete || isSubmitting}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-success font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all enabled:hover:bg-success-hover enabled:active:translate-y-1 enabled:active:shadow-[0_2px_0_var(--success-strong)] disabled:cursor-not-allowed disabled:bg-border-strong disabled:shadow-[0_6px_0_var(--border-strong)]"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⟳</span>
              در حال بررسی
            </>
          ) : checked && isCorrect && submitResult
          ? 'ادامه درس'
          : 'بررسی پاسخ'}
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-5 font-black text-muted shadow-[0_4px_0_var(--border)] transition-all active:translate-y-1 active:shadow-none"
        >
          <RotateCcw size={18} strokeWidth={3} />
          شروع دوباره
        </button>
      </div>
    </div>
  );
}
