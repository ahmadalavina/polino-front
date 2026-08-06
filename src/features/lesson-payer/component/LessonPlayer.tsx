'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Coins,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  DialogPayload,
  ImagePayload,
  LessonBlock,
  LessonData,
  LessonResult,
  QuizPayload,
} from '@/types/lesson';
import DialogBlock from './DialogBlock';
import ImageBlock from './ImageBlock';
import QuizBlock from './QuizBlock';
import LessonResultScreen from './LessonResult';

interface Props {
  lesson: LessonData;
  onExit?: () => void;
  onFinish?: () => void;
}

const blockLabels: Partial<Record<LessonBlock['type'], string>> = {
  dialog: 'داستان',
  image: 'تصویر آموزشی',
  quiz: 'سؤال',
};

export default function LessonPlayer({ lesson, onExit, onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});

  const blocks = useMemo(
    () => [...lesson.blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [lesson.blocks],
  );

  function handleNext() {
    if (currentIndex + 1 >= blocks.length) {
      setDone(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function handlePrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function handleQuizNext(blockId: number, isCorrect: boolean) {
    setQuizResults((results) => ({ ...results, [blockId]: isCorrect }));
    handleNext();
  }

  function renderBlock(block: LessonBlock) {
    switch (block.type) {
      case 'dialog':
        return (
          <DialogBlock
            key={block.id}
            payload={block.payload as DialogPayload}
            onNext={handleNext}
          />
        );
      case 'image':
        return (
          <ImageBlock
            key={block.id}
            payload={block.payload as ImagePayload}
            onNext={handleNext}
          />
        );
      case 'quiz':
        return (
          <QuizBlock
            key={block.id}
            payload={block.payload as QuizPayload}
            onNext={(isCorrect) => handleQuizNext(block.id, isCorrect)}
          />
        );
      default:
        return (
          <div className="flex min-h-[430px] flex-col items-center justify-center px-5 py-10 text-center">
            <div className="mb-5 grid size-20 place-items-center rounded-[24px] bg-[#eee9ff] text-[#7c5cff]">
              <BookOpen size={38} />
            </div>
            <h2 className="mb-2 text-xl font-black text-slate-800">
              بخش بعدی آماده‌ست
            </h2>
            <p className="mb-7 text-sm font-medium text-slate-500">
              برای ادامه ماجراجویی روی دکمه بزن.
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-[#58cc59] font-black text-white shadow-[0_6px_0_#3da83e] transition-all active:translate-y-1 active:shadow-[0_2px_0_#3da83e]"
            >
              ادامه
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
          </div>
        );
    }
  }

  if (done) {
    const answers = Object.values(quizResults);
    const result: LessonResult = {
      xpEarned: lesson.rewardXp,
      coinsEarned: lesson.rewardCoins,
      correctAnswers: answers.filter(Boolean).length,
      totalQuestions: answers.length,
    };

    return (
      <LessonResultScreen
        result={result}
        lessonTitle={lesson.title}
        onContinue={onFinish ?? (() => {})}
      />
    );
  }

  if (blocks.length === 0) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-[#f5fbff] p-4"
        dir="rtl"
      >
        <section className="w-full max-w-md rounded-[30px] border-2 border-white bg-white p-8 text-center shadow-[0_20px_65px_rgba(38,61,89,0.12)]">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-[24px] bg-[#fff7d6] text-[#d99a00]">
            <BookOpen size={38} />
          </div>
          <h1 className="mb-2 text-xl font-black text-slate-800">
            محتوای درس آماده نیست
          </h1>
          <p className="mb-6 text-sm font-medium text-slate-500">
            به‌زودی این درس پر از داستان و بازی می‌شه.
          </p>
          <button
            type="button"
            onClick={onFinish}
            className="h-13 w-full rounded-2xl bg-[#7c5cff] font-black text-white shadow-[0_5px_0_#6245dc] transition-all active:translate-y-1 active:shadow-none"
          >
            برگشت به مسیر
          </button>
        </section>
      </main>
    );
  }

  const currentBlock = blocks[currentIndex];
  const progress = ((currentIndex + 1) / blocks.length) * 100;

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#f5fbff] text-slate-800"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -start-36 -top-36 size-96 rounded-full bg-[#ddf8ef]" />
      <div className="pointer-events-none absolute -bottom-48 -end-32 size-[30rem] rounded-full bg-[#ece7ff]" />
      <div className="pointer-events-none absolute end-[8%] top-[38%] hidden size-5 rotate-45 rounded bg-[#ff8a55]/35 lg:block" />

      <header className="relative mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <button
          type="button"
          onClick={onExit}
          aria-label="خروج از درس"
          className="grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-slate-200 bg-white text-slate-500 shadow-[0_3px_0_#e2e8f0] transition-all hover:text-slate-700 active:translate-y-1 active:shadow-none"
        >
          <X size={21} strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-black text-slate-800 sm:text-base">
            {lesson.title}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-slate-400">
            {blockLabels[currentBlock.type] ?? 'مرحله آموزشی'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border-2 border-slate-100 bg-white px-3 py-2 text-xs font-black text-[#7c5cff] shadow-sm sm:flex">
            <Sparkles size={16} />
            {lesson.rewardXp}
          </div>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-slate-100 bg-white px-3 py-2 text-xs font-black text-[#d99100] shadow-sm">
            <Coins size={16} className="fill-current text-amber-400" />
            {lesson.rewardCoins}
          </div>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
        <div className="mb-5 rounded-2xl border-2 border-white bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-xs font-black">
            <span className="text-[#58b759]">پیشرفت درس</span>
            <span className="text-slate-400">
              {currentIndex + 1} از {blocks.length}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#58cc59] to-[#8cdf58] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-[30px] border-2 border-white bg-white/95 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur">
          {renderBlock(currentBlock)}
          {currentIndex > 0 && (
            <div className="border-t-2 border-dashed border-slate-100 px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-12 items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-black text-slate-500 shadow-[0_4px_0_#e2e8f0] transition-all hover:border-slate-300 hover:text-slate-700 active:translate-y-1 active:shadow-none"
              >
                <ArrowRight size={18} strokeWidth={3} />
                بازگشت به مرحله قبل
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
