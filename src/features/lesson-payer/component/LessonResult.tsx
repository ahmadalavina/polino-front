// src/features/lesson-player/components/LessonResult.tsx
'use client';

import { LessonResult } from '@/types/lesson';

interface Props {
  result: LessonResult;
  onContinue: () => void;
}

export default function LessonResultScreen({ result, onContinue }: Props) {
  const accuracy = result.totalQuestions > 0
    ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
    : 100;

  const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 p-6 gap-6">
      <div className="text-6xl animate-bounce">🏆</div>

      <h1 className="text-3xl font-bold text-orange-600">آفرین! درس تموم شد!</h1>

      <div className="flex gap-2 text-5xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={i < stars ? 'opacity-100' : 'opacity-30'}>⭐</span>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-lg">XP دریافتی</span>
          <span className="text-2xl font-bold text-purple-600">+{result.xpEarned} ✨</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-lg">سکه دریافتی</span>
          <span className="text-2xl font-bold text-yellow-500">+{result.coinsEarned} 🪙</span>
        </div>
        {result.totalQuestions > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-lg">پاسخ درست</span>
            <span className="text-2xl font-bold text-green-500">
              {result.correctAnswers}/{result.totalQuestions}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onContinue}
        className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-12 rounded-full text-xl shadow-md active:scale-95 transition-transform"
      >
        ادامه 🚀
      </button>
    </div>
  );
}
