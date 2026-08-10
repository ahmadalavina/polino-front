'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  GripVertical,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type { DragDropPayload } from '@/types/lesson';

interface Props {
  payload: DragDropPayload;
  onNext: (isCorrect: boolean) => void;
}

export default function DragDropBlock({ payload, onNext }: Props) {
  const [placements, setPlacements] = useState<Array<number | null>>(() =>
    payload.targets.map(() => null),
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const usedItems = useMemo(
    () => new Set(placements.filter((item): item is number => item !== null)),
    [placements],
  );
  const isComplete = placements.every((item) => item !== null);
  const isCorrect = placements.every(
    (itemIndex, targetIndex) =>
      itemIndex !== null &&
      payload.items[itemIndex] === payload.targets[targetIndex],
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
  }

  function handlePrimaryAction() {
    if (checked && isCorrect) {
      onNext(true);
      return;
    }

    setChecked(true);
  }

  return (
    <div className="min-h-[430px] p-5 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-[20px] bg-[#e7fbff] text-[#0891b2] shadow-[0_5px_0_#a5e2ec]">
          <GripVertical size={32} strokeWidth={2.8} />
        </div>
        <h2 className="mb-2 text-xl font-black text-slate-800">
          هر گزینه رو به جای درست ببر
        </h2>
        <p className="text-sm font-bold leading-7 text-slate-500">
          {payload.instruction ?? 'گزینه‌ها را بکش یا لمس کن و در کادر درست قرار بده.'}
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border-2 border-slate-100 bg-slate-50 p-4">
          <p className="mb-3 text-xs font-black text-slate-400">گزینه‌ها</p>
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
                      ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300'
                      : isSelected
                        ? 'border-[#06b6d4] bg-[#e7fbff] text-[#087d92] shadow-[0_4px_0_#9edce7]'
                        : 'border-white bg-white text-slate-700 shadow-[0_4px_0_#e2e8f0] active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <GripVertical size={18} className="shrink-0 text-slate-400" />
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[22px] border-2 border-[#d7f4f8] bg-[#f3fdff] p-4">
          <p className="mb-3 text-xs font-black text-[#0891b2]">جای پاسخ‌ها</p>
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
                        ? 'border-[#58cc59] bg-[#effcef] text-[#318b32]'
                        : 'border-rose-300 bg-rose-50 text-rose-500'
                      : hasItem
                        ? 'border-[#06b6d4] bg-white text-slate-700'
                        : 'border-[#9edce7] bg-white/70 text-slate-400'
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
            isCorrect
              ? 'bg-[#effcef] text-[#318b32]'
              : 'bg-rose-50 text-rose-500'
          }`}
        >
          {isCorrect
            ? 'عالی بود! همه گزینه‌ها درست هستند.'
            : 'بعضی گزینه‌ها درست نیستند؛ دوباره امتحان کن.'}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={!isComplete}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#58cc59] font-black text-white shadow-[0_6px_0_#3da83e] transition-all enabled:hover:bg-[#61d562] enabled:active:translate-y-1 enabled:active:shadow-[0_2px_0_#3da83e] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-[0_6px_0_#b8c0ca]"
        >
          {checked && isCorrect ? 'ادامه درس' : 'بررسی پاسخ'}
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 font-black text-slate-500 shadow-[0_4px_0_#e2e8f0] transition-all active:translate-y-1 active:shadow-none"
        >
          <RotateCcw size={18} strokeWidth={3} />
          شروع دوباره
        </button>
      </div>
    </div>
  );
}
