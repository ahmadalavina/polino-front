// src/features/lesson-player/components/LessonPlayer.tsx
'use client';

import { useState } from 'react';
import { LessonData, LessonBlock, LessonResult } from '@/types/lesson';
import { DialogPayload, ImagePayload, QuizPayload } from '@/types/lesson';
import DialogBlock from './DialogBlock';
import ImageBlock from './ImageBlock';
import QuizBlock from './QuizBlock';
import LessonResultScreen from './LessonResult';

interface Props {
  lesson: LessonData;
  onFinish?: () => void;
}

export default function LessonPlayer({ lesson, onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const blocks = [...lesson.blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  function handleNext() {
    if (currentIndex + 1 >= blocks.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleQuizNext(isCorrect: boolean) {
    setTotalQuestions((n) => n + 1);
    if (isCorrect) setCorrectAnswers((n) => n + 1);
    handleNext();
  }

  function renderBlock(block: LessonBlock) {
    switch (block.type) {
      case 'dialog':
        return <DialogBlock payload={block.payload as DialogPayload} onNext={handleNext} />;
      case 'image':
        return <ImageBlock payload={block.payload as ImagePayload} onNext={handleNext} />;
      case 'quiz':
        return <QuizBlock payload={block.payload as QuizPayload} onNext={handleQuizNext} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <span className="text-5xl">📖</span>
            <button onClick={handleNext} className="bg-blue-400 text-white py-3 px-8 rounded-full text-lg font-bold">
              بعدی
            </button>
          </div>
        );
    }
  }

  if (done) {
    const result: LessonResult = {
      xpEarned: lesson.rewardXp,
      coinsEarned: lesson.rewardCoins,
      correctAnswers,
      totalQuestions,
    };
    return <LessonResultScreen result={result} onContinue={onFinish ?? (() => {})} />;
  }

  const progress = ((currentIndex) / blocks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col" dir="rtl">
      {/* Progress Bar */}
      <div className="p-4 flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-green-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 font-medium">
          {currentIndex + 1}/{blocks.length}
        </span>
      </div>

      {/* Block Content */}
      <div className="flex-1">
        {renderBlock(blocks[currentIndex])}
      </div>
    </div>
  );
}
