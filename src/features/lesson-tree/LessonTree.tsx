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
      className="relative min-h-screen overflow-hidden bg-[#f5fbff] text-slate-800"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -start-36 -top-36 size-96 rounded-full bg-[#ddf8ef]" />
      <div className="pointer-events-none absolute -bottom-48 -end-32 size-[30rem] rounded-full bg-[#ece7ff]" />
      <div className="pointer-events-none absolute end-[7%] top-60 hidden size-5 rotate-45 rounded bg-[#ff8a55]/40 lg:block" />
      <div className="pointer-events-none absolute start-[8%] top-[48%] hidden size-4 rotate-12 rounded bg-amber-300 lg:block" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="بازگشت به دوره‌ها"
            className="grid size-11 place-items-center rounded-2xl border-2 border-slate-200 bg-white text-slate-500 shadow-[0_3px_0_#e2e8f0] transition-all hover:text-slate-700 active:translate-y-1 active:shadow-none"
          >
            <ArrowRight size={21} strokeWidth={3} />
          </button>
          <div>
            <p className="text-lg font-black text-slate-800">مسیر یادگیری</p>
            <p className="text-[10px] font-bold text-slate-400">
              قدم‌به‌قدم تا قهرمانی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border-2 border-slate-100 bg-white px-3 py-2 text-xs font-black text-[#d99100] shadow-sm">
          <Coins size={17} className="fill-current text-amber-400" />
          با هر درس سکه بگیر
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-3 sm:px-8 sm:pt-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-9 overflow-hidden rounded-[32px] border-2 border-white bg-white/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur sm:p-9"
        >
          <div className="absolute -end-16 -top-20 size-52 rounded-full bg-[#eafffb]" />
          <Sparkles
            className="absolute end-12 top-10 hidden text-[#16b8a6] sm:block"
            size={34}
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-[#7c5cff] text-white shadow-[0_6px_0_#6245dc]">
                <BookOpen size={32} strokeWidth={2.6} />
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-[#58b759]">
                  دوره آموزشی
                </p>
                <h1 className="text-2xl font-black leading-9 text-slate-800 sm:text-3xl">
                  {course.title}
                </h1>
                <p className="mt-2 max-w-xl text-sm font-medium leading-7 text-slate-500">
                  {course.description ??
                    'درس‌ها رو به‌ترتیب جلو برو و با بازی، تمرین و جایزه مهارت‌های تازه یاد بگیر.'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-2xl bg-[#f1edff] px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#6748df]">
                  {lessons.length}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">درس</p>
              </div>
              <div className="rounded-2xl bg-[#fff7d6] px-4 py-3 text-center">
                <Star
                  className="mx-auto fill-amber-400 text-amber-400"
                  size={25}
                />
                <p className="mt-1 text-xs font-bold text-slate-500">
                  ماجراجویی
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Map size={21} className="text-[#16a394]" />
              <h2 className="text-lg font-black text-slate-800 sm:text-xl">
                نقشه درس‌ها
              </h2>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-400">
              برای شروع، یکی از درس‌ها رو انتخاب کن
            </p>
          </div>
          <div className="hidden rounded-full bg-[#eafffb] px-3 py-2 text-xs font-black text-[#087d72] sm:block">
            {lessons.length} مرحله آموزشی
          </div>
        </div>

        {lessons.length > 0 ? (
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute bottom-8 start-[30px] top-8 w-1 rounded-full bg-gradient-to-b from-[#7c5cff] via-[#16b8a6] to-[#58cc59]" />
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
          <section className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white/80 p-8 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-[#eee9ff] text-[#7c5cff]">
              <BookOpen size={31} />
            </div>
            <h2 className="mb-2 text-xl font-black text-slate-700">
              هنوز درسی اضافه نشده
            </h2>
            <p className="text-sm font-medium leading-7 text-slate-500">
              به‌زودی این دوره با درس‌های جذاب آماده می‌شه.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
