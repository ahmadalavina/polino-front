// src/features/lesson-player/components/QuizBlock.tsx
'use client';

import { useState } from 'react';
import { QuizPayload } from '@/types/lesson';

interface Props {
  payload: QuizPayload;
  onNext: (isCorrect: boolean) => void;
}

export default function QuizBlock({ payload, onNext }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const sorted = [...payload.options].sort((a, b) => a.sortOrder - b.sortOrder);

  function handleSelect(optionId: number, isCorrect: boolean) {
    if (selected !== null) return;
    setSelected(optionId);
    setTimeout(() => onNext(isCorrect), 1200);
  }

  function getStyle(optionId: number, isCorrect: boolean) {
    if (selected === null) return 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50';
    if (isCorrect) return 'bg-green-100 border-green-500 scale-105';
    if (selected === optionId) return 'bg-red-100 border-red-400';
    return 'bg-white border-gray-200 opacity-50';
  }

  return (
    <div className="flex flex-col gap-5 p-6 min-h-[60vh] justify-center">
      <div className="text-center">
        <span className="text-4xl">🤔</span>
        <h2 className="text-xl font-bold text-gray-800 mt-3 leading-relaxed">{payload.question}</h2>
        {payload.description && (
          <p className="text-sm text-gray-500 mt-1">{payload.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 mt-2">
        {sorted.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id, opt.isCorrect)}
            className={`w-full p-4 rounded-2xl border-4 text-right text-lg font-medium transition-all duration-300 ${getStyle(opt.id, opt.isCorrect)}`}
          >
            {selected !== null && opt.isCorrect && <span className="ml-2">✅</span>}
            {selected === opt.id && !opt.isCorrect && <span className="ml-2">❌</span>}
            {opt.text}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className={`text-center text-2xl font-bold mt-2 animate-pulse ${
          sorted.find(o => o.id === selected)?.isCorrect ? 'text-green-500' : 'text-red-500'
        }`}>
          {sorted.find(o => o.id === selected)?.isCorrect ? '🎉 آفرین! درسته!' : '😅 اشتباه بود!'}
        </div>
      )}
    </div>
  );
}
