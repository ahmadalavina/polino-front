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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-foreground"
      dir="rtl"
    >
      <div className="absolute -start-28 -top-28 size-72 rounded-full bg-warning-soft" />
      <div className="absolute -bottom-36 -end-24 size-80 rounded-full bg-info-soft" />
      <div className="absolute end-[10%] top-[18%] hidden size-5 rotate-45 rounded bg-brand/30 lg:block" />

      <section className="relative w-full max-w-lg rounded-[34px] border-2 border-border bg-surface/95 p-6 text-center shadow-[0_24px_75px_rgba(42,60,90,0.14)] backdrop-blur sm:p-9">
        <div className="mx-auto mb-5 grid size-28 place-items-center rounded-full bg-gradient-to-br from-warning to-accent shadow-[0_8px_0_var(--warning-strong)]">
          <Trophy
            size={58}
            className="text-warning-foreground drop-shadow"
            strokeWidth={2.5}
          />
        </div>

        <div className="mb-3 flex items-center justify-center gap-2 text-brand">
          <Sparkles size={20} />
          <span className="text-sm font-black">درس کامل شد!</span>
        </div>
        <h1 className="mb-2 text-2xl font-black text-foreground sm:text-3xl">
          آفرین قهرمان!
        </h1>
        <p className="mx-auto mb-5 max-w-sm text-sm font-medium leading-7 text-muted">
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
                  ? 'fill-warning-strong text-warning-strong drop-shadow'
                  : 'fill-border text-faint'
              }
            />
          ))}
        </div>

        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-brand-soft p-4">
            <Sparkles className="mx-auto mb-2 text-brand" size={24} />
            <p className="text-xl font-black text-brand-soft-foreground">
              +{result.xpEarned}
            </p>
            <p className="mt-1 text-xs font-bold text-muted">امتیاز</p>
          </div>
          <div className="rounded-2xl bg-warning-soft p-4">
            <Coins
              className="mx-auto mb-2 fill-current text-warning-strong"
              size={24}
            />
            <p className="text-xl font-black text-warning-soft-foreground">
              +{result.coinsEarned}
            </p>
            <p className="mt-1 text-xs font-bold text-muted">سکه</p>
          </div>
          <div className="col-span-2 rounded-2xl bg-info-soft p-4 sm:col-span-1">
            <Target className="mx-auto mb-2 text-info" size={24} />
            <p className="text-xl font-black text-info-soft-foreground">
              {result.totalQuestions > 0
                ? `${result.correctAnswers}/${result.totalQuestions}`
                : '۱۰۰٪'}
            </p>
            <p className="mt-1 text-xs font-bold text-muted">پاسخ درست</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-success text-base font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)]"
        >
          برگشت به مسیر یادگیری
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
      </section>
    </main>
  );
}
