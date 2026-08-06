'use client';

import {
  ArrowLeft,
  Coins,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import type { LessonResult } from '@/types/lesson';

interface Props {
  result: LessonResult;
  lessonTitle: string;
  onContinue: () => void;
}

export default function LessonResultScreen({
  result,
  lessonTitle,
  onContinue,
}: Props) {
  const accuracy =
    result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 100;
  const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5fbff] p-4 text-slate-800"
      dir="rtl"
    >
      <div className="absolute -start-28 -top-28 size-72 rounded-full bg-[#fff2bd]" />
      <div className="absolute -bottom-36 -end-24 size-80 rounded-full bg-[#ddf8ef]" />
      <div className="absolute end-[10%] top-[18%] hidden size-5 rotate-45 rounded bg-[#7c5cff]/30 lg:block" />

      <section className="relative w-full max-w-lg rounded-[34px] border-2 border-white bg-white/95 p-6 text-center shadow-[0_24px_75px_rgba(42,60,90,0.14)] backdrop-blur sm:p-9">
        <div className="mx-auto mb-5 grid size-28 place-items-center rounded-full bg-gradient-to-br from-[#ffe56b] to-[#ffb33f] shadow-[0_8px_0_#e89b2e]">
          <Trophy
            size={58}
            className="text-white drop-shadow"
            strokeWidth={2.5}
          />
        </div>

        <div className="mb-3 flex items-center justify-center gap-2 text-[#7c5cff]">
          <Sparkles size={20} />
          <span className="text-sm font-black">درس کامل شد!</span>
        </div>
        <h1 className="mb-2 text-2xl font-black text-slate-800 sm:text-3xl">
          آفرین قهرمان!
        </h1>
        <p className="mx-auto mb-5 max-w-sm text-sm font-medium leading-7 text-slate-500">
          درس «{lessonTitle}» رو با موفقیت تموم کردی.
        </p>

        <div className="mb-6 flex items-center justify-center gap-2" dir="ltr">
          {Array.from({ length: 3 }, (_, index) => (
            <Star
              key={index}
              size={42}
              strokeWidth={2.5}
              className={
                index < stars
                  ? 'fill-amber-400 text-amber-400 drop-shadow'
                  : 'fill-slate-100 text-slate-200'
              }
            />
          ))}
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f1edff] p-4">
            <Sparkles className="mx-auto mb-2 text-[#7c5cff]" size={24} />
            <p className="text-xl font-black text-[#6748df]">
              +{result.xpEarned}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500">امتیاز</p>
          </div>
          <div className="rounded-2xl bg-[#fff7d6] p-4">
            <Coins
              className="mx-auto mb-2 fill-current text-amber-400"
              size={24}
            />
            <p className="text-xl font-black text-[#c78300]">
              +{result.coinsEarned}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500">سکه</p>
          </div>
          <div className="col-span-2 rounded-2xl bg-[#eafffb] p-4 sm:col-span-1">
            <Target className="mx-auto mb-2 text-[#16a394]" size={24} />
            <p className="text-xl font-black text-[#087d72]">
              {result.totalQuestions > 0
                ? `${result.correctAnswers}/${result.totalQuestions}`
                : '۱۰۰٪'}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500">پاسخ درست</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e]"
        >
          برگشت به مسیر یادگیری
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
      </section>
    </main>
  );
}
