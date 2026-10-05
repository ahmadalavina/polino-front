import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export function AdminHeader() {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-[0_4px_0_var(--brand-strong)]">
          <GraduationCap size={24} strokeWidth={2.7} />
        </div>
        <div>
          <p className="text-xl font-black text-foreground">مدیریت پولینو</p>
          <p className="text-[10px] font-bold text-subtle">
            ساخت محتوا
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/course"
          className="rounded-2xl border-2 border-border bg-surface px-4 py-2.5 text-xs font-black text-muted shadow-[0_3px_0_var(--border)] transition-all active:translate-y-1 active:shadow-none"
        >
          مشاهده دوره‌ها
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
