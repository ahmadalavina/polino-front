'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, RefreshCw, Star } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import LessonTree from '@/features/lesson-tree/LessonTree';
import { api } from '@/lib/api';
import type { CourseDetail } from '@/types/lesson';

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setHasError(false);

    if (!id) {
      setHasError(true);
      setLoading(false);
      return;
    }

    api
      .getCourse(id)
      .then((response) => {
        if (isActive) setCourse(response.data);
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
  }, [id, reloadKey]);

  if (loading) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4"
        dir="rtl"
      >
        <div className="absolute -start-28 -top-28 size-72 rounded-full bg-info-soft" />
        <div className="absolute -bottom-36 -end-24 size-80 rounded-full bg-brand-soft" />
        <section className="relative w-full max-w-sm rounded-[30px] border-2 border-border bg-surface/95 p-8 text-center shadow-[0_20px_65px_rgba(38,61,89,0.12)]">
          <div className="relative mx-auto mb-6 grid size-24 place-items-center rounded-[28px] bg-brand-soft text-brand shadow-[0_6px_0_var(--brand-soft)]">
            <BookOpen size={46} strokeWidth={2.4} />
            <Star
              className="absolute -start-2 -top-2 fill-warning-strong text-warning-strong"
              size={24}
            />
          </div>
          <h1 className="mb-2 text-xl font-black text-foreground">
            مسیر دوره داره آماده می‌شه
          </h1>
          <p className="text-sm font-medium text-muted">
            چند لحظه صبر کن قهرمان...
          </p>
          <div className="mx-auto mt-6 h-3 w-40 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand" />
          </div>
        </section>
      </main>
    );
  }

  if (hasError || !course) {
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
            دوره باز نشد
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
              onClick={() => router.push('/course')}
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface px-5 font-black text-muted shadow-[0_4px_0_var(--border)] transition-all active:translate-y-1 active:shadow-none"
            >
              <ArrowRight size={19} strokeWidth={3} />
              همه دوره‌ها
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <LessonTree
      course={course}
      onBack={() => router.push('/course')}
    />
  );
}
