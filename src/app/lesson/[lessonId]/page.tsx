'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, RefreshCw, Star } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import LessonPlayer from '@/features/lesson-payer/component/LessonPlayer';
import { api } from '@/lib/api';
import type { LessonData } from '@/types/lesson';

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const lessonIdNumber = Number(lessonId);
    let isActive = true;

    setLoading(true);
    setHasError(false);
    setLesson(null);

    if (
      !lessonId ||
      !Number.isInteger(lessonIdNumber) ||
      lessonIdNumber <= 0
    ) {
      setHasError(true);
      setLoading(false);
      return;
    }

    api
      .getLessonPlay(lessonIdNumber)
      .then((response) => {
        if (isActive) setLesson(response.data);
      })
      .catch(() => {
        if (isActive) setHasError(true);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [lessonId, reloadKey]);

  if (loading) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4"
        dir="rtl"
      >
        <div className="absolute -start-28 -top-28 size-72 rounded-full bg-info-soft" />
        <div className="absolute -bottom-36 -end-24 size-80 rounded-full bg-brand-soft" />
        <section className="relative w-full max-w-sm rounded-[30px] border-2 border-border bg-surface/95 p-8 text-center shadow-[0_20px_65px_rgba(38,61,89,0.12)]">
          <div className="relative mx-auto mb-6 grid size-24 place-items-center rounded-[28px] bg-warning-soft text-5xl shadow-[0_6px_0_var(--warning-strong)]">
            📖
            <Star
              className="absolute -start-2 -top-2 fill-brand text-brand"
              size={23}
            />
          </div>
          <h1 className="mb-2 text-xl font-black text-foreground">
            درس داره آماده می‌شه
          </h1>
          <p className="text-sm font-medium text-muted">
            چند لحظه صبر کن قهرمان...
          </p>
          <div className="mx-auto mt-6 h-3 w-40 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-success" />
          </div>
        </section>
      </main>
    );
  }

  if (hasError || !lesson) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4"
        dir="rtl"
      >
        <div className="absolute -start-28 -top-28 size-72 rounded-full bg-accent-soft" />
        <div className="absolute -bottom-36 -end-24 size-80 rounded-full bg-brand-soft" />
        <section className="relative w-full max-w-md rounded-[30px] border-2 border-border bg-surface/95 p-7 text-center shadow-[0_20px_65px_rgba(38,61,89,0.12)] sm:p-9">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-[24px] bg-danger-soft text-danger">
            <BookOpen size={38} strokeWidth={2.4} />
          </div>
          <h1 className="mb-2 text-2xl font-black text-foreground">
            درس باز نشد
          </h1>
          <p className="mx-auto mb-6 max-w-xs text-sm font-medium leading-7 text-muted">
            اتصال اینترنت رو بررسی کن و دوباره تلاش کن.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-5 font-black text-brand-foreground shadow-[0_5px_0_var(--brand-strong)] transition-all active:translate-y-1 active:shadow-[0_1px_0_var(--brand-strong)]"
            >
              <RefreshCw size={19} strokeWidth={3} />
              تلاش دوباره
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-5 font-black text-muted shadow-[0_4px_0_var(--border)] transition-all active:translate-y-1 active:shadow-none"
            >
              <ArrowRight size={19} strokeWidth={3} />
              برگشت
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <LessonPlayer
      key={lesson.id}
      lesson={lesson}
      onExit={() => router.back()}
      onFinish={() => router.back()}
    />
  );
}
