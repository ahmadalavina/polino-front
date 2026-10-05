'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Coins,
  Map,
  Sparkles,
  Star,
} from 'lucide-react';
import type { CourseDetail } from '@/types/lesson';
import LessonNode from './LessonNode';

interface Props {
  course: CourseDetail;
  onBack: () => void;
}

export default function LessonTree({ course, onBack }: Props) {
  const lessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -start-36 -top-36 size-96 rounded-full bg-info-soft" />
      <div className="pointer-events-none absolute -bottom-48 -end-32 size-[30rem] rounded-full bg-brand-soft" />
      <div className="pointer-events-none absolute end-[7%] top-60 hidden size-5 rotate-45 rounded bg-accent/40 lg:block" />
      <div className="pointer-events-none absolute start-[8%] top-[48%] hidden size-4 rotate-12 rounded bg-warning lg:block" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="بازگشت به دوره‌ها"
            className="grid size-11 place-items-center rounded-2xl border-2 border-border bg-surface text-muted shadow-[0_3px_0_var(--border)] transition-all hover:text-foreground active:translate-y-1 active:shadow-none"
          >
            <ArrowRight size={21} strokeWidth={3} />
          </button>
          <div>
            <p className="text-lg font-black text-foreground">مسیر یادگیری</p>
            <p className="text-[10px] font-bold text-subtle">
              قدم‌به‌قدم تا قهرمانی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border-2 border-border bg-surface px-3 py-2 text-xs font-black text-warning-strong shadow-sm">
          <Coins size={17} className="fill-current text-warning-strong" />
          با هر درس سکه بگیر
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-3 sm:px-8 sm:pt-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-9 overflow-hidden rounded-[32px] border-2 border-border bg-surface/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur sm:p-9"
        >
          <div className="absolute -end-16 -top-20 size-52 rounded-full bg-info-soft" />
          <Sparkles
            className="absolute end-12 top-10 hidden text-info sm:block"
            size={34}
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-brand text-brand-foreground shadow-[0_6px_0_var(--brand-strong)]">
                <BookOpen size={32} strokeWidth={2.6} />
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-success-soft-foreground">
                  دوره آموزشی
                </p>
                <h1 className="text-2xl font-black leading-9 text-foreground sm:text-3xl">
                  {course.title}
                </h1>
                <p className="mt-2 max-w-xl text-sm font-medium leading-7 text-muted">
                  {course.description ??
                    'درس‌ها رو به‌ترتیب جلو برو و با بازی، تمرین و جایزه مهارت‌های تازه یاد بگیر.'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-2xl bg-brand-soft px-4 py-3 text-center">
                <p className="text-2xl font-black text-brand-soft-foreground">
                  {lessons.length}
                </p>
                <p className="mt-1 text-xs font-bold text-muted">درس</p>
              </div>
              <div className="rounded-2xl bg-warning-soft px-4 py-3 text-center">
                <Star
                  className="mx-auto fill-warning-strong text-warning-strong"
                  size={25}
                />
                <p className="mt-1 text-xs font-bold text-muted">
                  ماجراجویی
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Map size={21} className="text-info" />
              <h2 className="text-lg font-black text-foreground sm:text-xl">
                نقشه درس‌ها
              </h2>
            </div>
            <p className="mt-1 text-xs font-bold text-subtle">
              برای شروع، یکی از درس‌ها رو انتخاب کن
            </p>
          </div>
          <div className="hidden rounded-full bg-info-soft px-3 py-2 text-xs font-black text-info-soft-foreground sm:block">
            {lessons.length} مرحله آموزشی
          </div>
        </div>

        {lessons.length > 0 ? (
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute bottom-8 start-[30px] top-8 w-1 rounded-full bg-gradient-to-b from-brand via-info to-success" />
            <div className="space-y-5">
              {lessons.map((lesson, index) => (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <section className="rounded-[28px] border-2 border-dashed border-border bg-surface/80 p-8 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand">
              <BookOpen size={31} />
            </div>
            <h2 className="mb-2 text-xl font-black text-foreground">
              هنوز درسی اضافه نشده
            </h2>
            <p className="text-sm font-medium leading-7 text-muted">
              به‌زودی این دوره با درس‌های جذاب آماده می‌شه.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
