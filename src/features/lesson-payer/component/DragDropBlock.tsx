'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  GripVertical,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { api, type CompleteGameDto } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import type { DragDropPayload } from '@/types/lesson';

interface Props {
  blockId: number;
  payload: DragDropPayload;
  onNext: () => void;
}

export default function DragDropBlock({ blockId, payload, onNext }: Props) {
  const [placements, setPlacements] = useState<Array<number | null>>(() =>
    payload.targets.map(() => null),
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<boolean | null>(null);

  const usedItems = useMemo(
    () => new Set(placements.filter((item): item is number => item !== null)),
    [placements],
  );
  const isComplete = placements.every((item) => item !== null);
  const isCorrect = placements.every(
    (itemIndex, targetIndex) =>
      itemIndex !== null &&
      itemIndex === targetIndex,
  );

  function placeItem(itemIndex: number, targetIndex: number) {
    setPlacements((current) => {
      const next = current.map((value) =>
        value === itemIndex ? null : value,
      );
      next[targetIndex] = itemIndex;
      return next;
    });
    setSelectedItem(null);
    setChecked(false);
  }

  function removePlacement(targetIndex: number) {
    setPlacements((current) =>
      current.map((value, index) => (index === targetIndex ? null : value)),
    );
    setChecked(false);
  }

  function reset() {
    setPlacements(payload.targets.map(() => null));
    setSelectedItem(null);
    setChecked(false);
    setSubmitResult(null);
  }

  const handleSubmit = useCallback(async () => {
    if (!isComplete || isSubmitting) return;
    setIsSubmitting(true);
    const dto: CompleteGameDto = {
      //@ts-ignore
      gameType: 'drag_drop',
      matchedPairIds: placements
        .map((itemIndex, targetIndex) =>
          itemIndex === targetIndex ? `${targetIndex}` : null,
        )
        .filter(Boolean) as string[],
      attempts: 1,
      mistakes: isCorrect ? 0 : 1,
    };
    try {
      const response = await api.completeGame(blockId, dto);
      setSubmitResult(response.completed);
      if (response.balance) {
        useGameStore.getState().setBalance(response.balance);
      }
    } catch {
      setSubmitResult(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [isComplete, isSubmitting, placements, isCorrect, blockId]);

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
          {payload.instruction ?? 'گزینه‌ها را بکش یا لمس کن و در کادر درست قرار بده.'}
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border-2 border-border bg-surface-muted p-4">
          <p className="mb-3 text-xs font-black text-subtle">گزینه‌ها</p>
          <div className="space-y-3">
            {payload.items.map((item, itemIndex) => {
              const isUsed = usedItems.has(itemIndex);
              const isSelected = selectedItem === itemIndex;

              return (
                <button
                  key={`${item}-${itemIndex}`}
                  type="button"
                  draggable={!isUsed}
                  disabled={isUsed}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', String(itemIndex));
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => setSelectedItem(isSelected ? null : itemIndex)}
                  className={`flex min-h-14 w-full items-center gap-2 rounded-2xl border-2 px-4 text-start text-sm font-black transition-all ${
                    isUsed
                      ? 'cursor-not-allowed border-border bg-surface-muted text-subtle'
                      : isSelected
                        ? 'border-cyan bg-info-soft text-info-strong shadow-[0_4px_0_var(--info-soft)]'
                        : 'border-border bg-surface text-foreground shadow-[0_4px_0_var(--border)] active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <GripVertical size={18} className="shrink-0 text-subtle" />
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[22px] border-2 border-info-soft bg-info-soft p-4">
          <p className="mb-3 text-xs font-black text-cyan-strong">جای پاسخ‌ها</p>
          <div className="space-y-3">
            {payload.targets.map((target, targetIndex) => {
              const itemIndex = placements[targetIndex];
              const hasItem = itemIndex !== null;
              const targetIsCorrect =
                hasItem && payload.items[itemIndex] === target;

              return (
                <button
                  key={`${target}-${targetIndex}`}
                  type="button"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedItem = Number(
                      event.dataTransfer.getData('text/plain'),
                    );
                    if (Number.isInteger(droppedItem)) {
                      placeItem(droppedItem, targetIndex);
                    }
                  }}
                  onClick={() => {
                    if (selectedItem !== null) {
                      placeItem(selectedItem, targetIndex);
                    } else if (hasItem) {
                      removePlacement(targetIndex);
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
                      {target}
                    </span>
                    <span className="mt-1 block text-sm font-black">
                      {hasItem ? payload.items[itemIndex] : 'اینجا قرار بده'}
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
            ? 'بعضی گزینه‌ها درست نیستند؛ در حال بررسی...'
            : 'بعضی گزینه‌ها درست نیستند؛ دوباره امتحان کن.'}
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
