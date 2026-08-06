'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import type { QuizPayload } from '@/types/lesson';

interface Props {
  payload: QuizPayload;
  onNext: (isCorrect: boolean) => void;
}

export default function QuizBlock({ payload, onNext }: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const options = useMemo(
    () => [...payload.options].sort((a, b) => a.sortOrder - b.sortOrder),
    [payload.options],
  );
  const selectedOption = options.find(
    (option) => option.id === selectedOptionId,
  );

  function getOptionStyle(optionId: number, isCorrect: boolean) {
    if (selectedOptionId === null) {
      return 'border-slate-200 bg-white text-slate-700 shadow-[0_4px_0_#e2e8f0] hover:-translate-y-0.5 hover:border-[#a997ff]';
    }

    if (isCorrect) {
      return 'border-[#58cc59] bg-[#edffed] text-[#278f2b] shadow-[0_4px_0_#58cc59]';
    }

    if (selectedOptionId === optionId) {
      return 'border-rose-400 bg-rose-50 text-rose-600 shadow-[0_4px_0_#fb7185]';
    }

    return 'border-slate-100 bg-slate-50 text-slate-400 opacity-65';
  }

  return (
    <div className="flex min-h-[430px] flex-col justify-center p-5 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-[22px] bg-[#fff7d6] text-[#d99100] shadow-[0_4px_0_#f2c94c]">
          <HelpCircle size={32} strokeWidth={2.7} />
        </div>
        <p className="mb-2 text-xs font-black text-[#7c5cff]">وقت فکر کردنه!</p>
        <h2 className="text-lg font-black leading-8 text-slate-800 sm:text-xl">
          {payload.question}
        </h2>
        {payload.description && (
          <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
            {payload.description}
          </p>
        )}
      </div>

      {payload.image && (
        <div className="mx-auto mb-5 h-44 w-full max-w-md overflow-hidden rounded-2xl bg-slate-100">
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
              selectedOptionId === null && setSelectedOptionId(option.id)
            }
            disabled={selectedOptionId !== null}
            className={`flex min-h-15 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start text-sm font-bold leading-6 transition-all sm:text-base ${getOptionStyle(
              option.id,
              option.isCorrect,
            )}`}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-black/5 text-sm font-black">
              {selectedOptionId !== null && option.isCorrect ? (
                <Check size={18} strokeWidth={4} />
              ) : selectedOptionId === option.id ? (
                <XCircle size={18} strokeWidth={3} />
              ) : (
                index + 1
              )}
            </span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>

      {selectedOption && (
        <div
          className={`mt-6 rounded-2xl border-2 p-4 ${
            selectedOption.isCorrect
              ? 'border-green-100 bg-green-50'
              : 'border-rose-100 bg-rose-50'
          }`}
        >
          <div className="mb-4 flex items-center gap-2">
            {selectedOption.isCorrect ? (
              <CheckCircle2 className="text-[#3baa40]" size={24} />
            ) : (
              <XCircle className="text-rose-500" size={24} />
            )}
            <p
              className={`font-black ${
                selectedOption.isCorrect ? 'text-[#278f2b]' : 'text-rose-600'
              }`}
            >
              {selectedOption.isCorrect
                ? 'آفرین! جواب درست رو پیدا کردی.'
                : 'اشکالی نداره؛ جواب درست رو یاد گرفتی!'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNext(selectedOption.isCorrect)}
            className={`flex h-13 w-full items-center justify-center gap-2 rounded-2xl font-black text-white shadow-[0_5px_0_var(--button-shadow)] transition-all active:translate-y-1 active:shadow-none ${
              selectedOption.isCorrect
                ? 'bg-[#58cc59] [--button-shadow:#3da83e]'
                : 'bg-[#ff8a55] [--button-shadow:#e56f3d]'
            }`}
          >
            ادامه
            <ArrowLeft size={19} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
