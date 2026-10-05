'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Coins,
  Heart,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  UserRound,
  ShieldCheck,
  X,
} from 'lucide-react';
import CourseCard from '@/components/CourseCard';
import ThemeToggle from '@/components/ThemeToggle';
import { api } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';

interface Course {
  id: number;
  title: string;
  description: string;
  cover: string;
  order: number;
}

type CourseResponse = {
  data: Course[];
};

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('fa-IR')
    .replaceAll('ي', 'ی')
    .replaceAll('ك', 'ک');
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border-2 border-border bg-surface shadow-[0_12px_35px_rgba(42,60,90,0.08)]"
        >
          <div className="h-44 animate-pulse bg-surface-muted" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3 w-full animate-pulse rounded-full bg-surface-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const hearts = useGameStore((state) => state.hearts);
  const coins = useGameStore((state) => state.coins);
  const role = useAuthStore((state) => state.profile?.role);

  useEffect(() => {
    let isActive = true;

    setLoading(true);
    setHasError(false);

    api
      .getCourses()
      .then((response) => {
        if (!isActive) return;

        const result = response as CourseResponse;
        setCourses(Array.isArray(result.data) ? result.data : []);
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
  }, [reloadKey]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    if (!normalizedQuery) return courses;

    return courses.filter((course) =>
      normalizeSearchValue(course.title).includes(normalizedQuery),
    );
  }, [courses, searchQuery]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -start-36 -top-36 size-96 rounded-full bg-info-soft" />
      <div className="pointer-events-none absolute -bottom-48 -end-32 size-[30rem] rounded-full bg-brand-soft" />
      <div className="pointer-events-none absolute end-[7%] top-52 hidden size-5 rotate-45 rounded bg-accent/40 lg:block" />
      <div className="pointer-events-none absolute start-[8%] top-[38%] hidden size-4 rotate-12 rounded bg-warning lg:block" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-success text-xl shadow-[0_4px_0_var(--success-strong)]">
            🪙
          </div>
          <div>
            <p className="text-xl font-black text-foreground">پولینو</p>
            <p className="text-[10px] font-bold text-subtle">
              قهرمان پول‌های من
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <Link
              href="/admin"
              aria-label="مدیریت محتوا"
              title="مدیریت محتوا"
              className="grid size-11 place-items-center rounded-full border-2 border-warning-soft bg-warning-soft text-warning-soft-foreground shadow-sm transition-colors hover:border-warning hover:text-warning-soft-foreground"
            >
              <ShieldCheck size={20} />
            </Link>
          )}
          <ThemeToggle />
          <Link
            href="/profile"
            aria-label="ویرایش پروفایل"
            className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface text-muted shadow-sm transition-colors hover:border-brand hover:text-brand"
          >
            <UserRound size={20} />
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-border bg-surface px-3 py-2 text-sm font-black text-muted shadow-sm">
            <Heart size={18} className="fill-current text-danger" />
            {hearts}
          </div>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-border bg-surface px-3 py-2 text-sm font-black text-muted shadow-sm">
            <Coins size={18} className="fill-current text-warning-strong" />
            {coins}
          </div>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-3 sm:px-8 sm:pt-7">
        <section className="relative mb-8 overflow-hidden rounded-[32px] border-2 border-border bg-surface/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur sm:p-9">
          <div className="absolute -end-12 -top-16 size-44 rounded-full bg-info-soft" />
          <div className="absolute end-10 top-8 hidden text-info sm:block">
            <Sparkles size={34} />
          </div>

          <div className="relative max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_5px_0_var(--brand-strong)]">
                <BookOpen size={29} strokeWidth={2.7} />
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-success-soft-foreground">
                  مسیر یادگیری تو
                </p>
                <h1 className="text-2xl font-black leading-9 text-foreground sm:text-3xl">
                  دوره‌های آموزشی
                </h1>
              </div>
            </div>

            <p className="mb-6 max-w-xl text-sm font-medium leading-7 text-muted sm:text-base">
              دوره مورد علاقه‌ات رو پیدا کن و با بازی و جایزه، مدیریت پول
              رو یاد بگیر.
            </p>

            <label className="group relative block">
              <span className="sr-only">جستجوی نام دوره</span>
              <Search
                aria-hidden="true"
                className="absolute start-4 top-1/2 -translate-y-1/2 text-subtle transition-colors group-focus-within:text-brand"
                size={22}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="اسم دوره رو جستجو کن..."
                className="h-16 w-full rounded-2xl border-2 border-border bg-surface-muted ps-12 pe-12 text-base font-bold text-foreground outline-none transition-all placeholder:font-medium placeholder:text-subtle focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_rgba(124,92,255,0.12)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="پاک کردن جستجو"
                  className="absolute end-4 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-border text-muted transition-colors hover:bg-border-strong"
                >
                  <X size={17} strokeWidth={3} />
                </button>
              )}
            </label>
          </div>
        </section>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground sm:text-xl">
              دوره‌ها
            </h2>
            <p className="mt-1 text-xs font-bold text-subtle">
              {loading
                ? 'در حال آماده‌سازی دوره‌ها...'
                : `${filteredCourses.length} دوره پیدا شد`}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-warning-soft px-3 py-2 text-xs font-black text-warning-soft-foreground">
            <Star size={16} className="fill-warning-strong text-warning-strong" />
            یاد بگیر و جایزه بگیر
          </div>
        </div>

        {loading ? (
          <LoadingCards />
        ) : hasError ? (
          <section className="rounded-[28px] border-2 border-danger-soft bg-surface p-8 text-center shadow-[0_14px_40px_rgba(42,60,90,0.08)]">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-danger-soft text-danger">
              <BookOpen size={32} />
            </div>
            <h2 className="mb-2 text-xl font-black text-foreground">
              دوره‌ها بارگذاری نشدن
            </h2>
            <p className="mb-5 text-sm font-medium text-muted">
              اتصال اینترنت رو بررسی کن و دوباره تلاش کن.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mx-auto flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-6 text-sm font-black text-brand-foreground shadow-[0_5px_0_var(--brand-strong)] transition-all active:translate-y-1 active:shadow-[0_1px_0_var(--brand-strong)]"
            >
              <RefreshCw size={18} strokeWidth={3} />
              تلاش دوباره
            </button>
          </section>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <section className="rounded-[28px] border-2 border-dashed border-border bg-surface/80 p-8 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Search size={30} strokeWidth={2.5} />
            </div>
            <h2 className="mb-2 text-xl font-black text-foreground">
              دوره‌ای پیدا نشد
            </h2>
            <p className="mb-5 text-sm font-medium leading-7 text-muted">
              اسم دوره رو به شکل دیگه‌ای بنویس یا جستجو رو پاک کن.
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-2xl bg-brand px-5 py-3 text-sm font-black text-brand-foreground shadow-[0_4px_0_var(--brand-strong)] transition-all active:translate-y-1 active:shadow-none"
              >
                نمایش همه دوره‌ها
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
