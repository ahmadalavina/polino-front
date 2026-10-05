'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { api, type CompleteGameDto } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import type { QuizPayload } from '@/types/lesson';

interface Props {
  blockId: number;
  payload: QuizPayload;
  onNext: () => void;
}

export default function QuizBlock({ blockId, payload, onNext }: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<boolean | null>(null);

  const options = useMemo(
    () => [...payload.options].sort((a, b) => a.sortOrder - b.sortOrder),
    [payload.options],
  );
  const selectedOption = options.find(
    (option) => option.id === selectedOptionId,
  );

  function getOptionStyle(optionId: number, isCorrect: boolean) {
    if (selectedOptionId === null) {
      return 'border-border bg-surface text-foreground shadow-[0_4px_0_var(--border)] hover:-translate-y-0.5 hover:border-brand-soft-foreground';
    }

    if (isCorrect) {
      return 'border-success bg-success-soft text-success-soft-foreground shadow-[0_4px_0_var(--success)]';
    }

    if (selectedOptionId === optionId) {
      return 'border-danger bg-danger-soft text-danger-soft-foreground shadow-[0_4px_0_var(--danger)]';
    }

    return 'border-border bg-surface-muted text-subtle opacity-65';
  }

  const handleCheck = async () => {
    if (!selectedOptionId || checked || isSubmitting) return;
    setIsSubmitting(true);
    setChecked(true);
    const dto: CompleteGameDto = {
      //@ts-ignore
      gameType: 'quiz',
      matchedPairIds: [selectedOptionId.toString()],
      attempts: 1,
      mistakes: selectedOption?.isCorrect ? 0 : 1,
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
  };

  const isCorrectAnswer = selectedOption?.isCorrect ?? false;

  return (
    <div className="flex min-h-[430px] flex-col justify-center p-5 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-[22px] bg-warning-soft text-warning-strong shadow-[0_4px_0_var(--warning-strong)]">
          <HelpCircle size={32} strokeWidth={2.7} />
        </div>
        <p className="mb-2 text-xs font-black text-brand">وقت فکر کردنه!</p>
        <h2 className="text-lg font-black leading-8 text-foreground sm:text-xl">
          {payload.question}
        </h2>
        {payload.description && (
          <p className="mt-2 text-sm font-medium leading-7 text-muted">
            {payload.description}
          </p>
        )}
      </div>

      {payload.image && (
        <div className="mx-auto mb-5 h-44 w-full max-w-md overflow-hidden rounded-2xl bg-surface-muted">
          <img
            src={payload.image}
            alt=""
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              !checked && setSelectedOptionId(option.id)
            }
            disabled={checked}
            className={`flex min-h-15 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start text-sm font-bold leading-6 transition-all sm:text-base ${getOptionStyle(
              option.id,
              option.isCorrect,
            )}`}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-black/5 text-sm font-black">
              {checked && option.isCorrect ? (
                <Check size={18} strokeWidth={4} />
              ) : checked && selectedOptionId === option.id && !option.isCorrect ? (
                <XCircle size={18} strokeWidth={3} />
              ) : (
                index + 1
              )}
            </span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      {selectedOptionId !== null && (
        <div
          className={`mt-6 rounded-2xl border-2 p-4 ${
            checked
              ? isCorrectAnswer
                ? 'border-success-soft bg-success-soft'
                : 'border-danger-soft bg-danger-soft'
              : 'border-border bg-surface'
          }`}
        >
          <div className="mb-4 flex items-center gap-2">
            {checked && isCorrectAnswer ? (
              <CheckCircle2 className="text-success-strong" size={24} />
            ) : checked && !isCorrectAnswer ? (
              <XCircle className="text-danger" size={24} />
            ) : null}
            <p
              className={`font-black ${
                checked
                  ? isCorrectAnswer ? 'text-success-soft-foreground' : 'text-danger-soft-foreground'
                  : 'text-muted'
              }`}
            >
              {checked
                ? isCorrectAnswer
                  ? submitResult
                    ? 'آفرین! جواب درست رو پیدا کردی.'
                    : 'در حال بررسی...'
                  : 'اشکالی نداره؛ جواب درست رو یاد گرفتی!'
                  //@ts-ignore
                : `آیا ${option.text} گزینه درستی است؟`}
            </p>
          </div>
          {!checked ? (
            <button
              type="button"
              onClick={handleCheck}
              disabled={isSubmitting}
              className={`flex h-13 w-full items-center justify-center gap-2 rounded-2xl font-black shadow-[0_5px_0_var(--button-shadow)] transition-all active:translate-y-1 active:shadow-none ${
                isSubmitting
                  ? 'bg-border-strong text-foreground shadow-none cursor-wait'
                  : 'bg-success text-success-foreground [--button-shadow:var(--success-strong)] hover:bg-success-hover'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  در حال بررسی...
                </>
              ) : (
                <>
                  بررسی پاسخ
                  <ArrowLeft size={19} strokeWidth={3} />
                </>
              )}
            </button>
          ) : isCorrectAnswer && submitResult ? (
            <button
              type="button"
              onClick={onNext}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-success [--button-shadow:var(--success-strong)] text-sm font-black text-success-foreground shadow-[0_5px_0_var(--success-strong)] transition-all active:translate-y-1 active:shadow-none"
            >
              ادامه
              <ArrowLeft size={19} strokeWidth={3} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedOptionId(null);
                setChecked(false);
                setSubmitResult(null);
              }}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-accent [--button-shadow:var(--accent-strong)] text-sm font-black text-accent-foreground shadow-[0_5px_0_var(--accent-strong)] transition-all active:translate-y-1 active:shadow-none"
            >
              تلاش مجدد
              <ArrowLeft size={19} strokeWidth={3} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
