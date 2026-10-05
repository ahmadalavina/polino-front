import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export function AdminHeader() {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#7c5cff] text-white shadow-[0_4px_0_#6245dc]">
          <GraduationCap size={24} strokeWidth={2.7} />
        </div>
        <div>
          <p className="text-xl font-black text-slate-800">مدیریت پولینو</p>
          <p className="text-[10px] font-bold text-slate-400">
            ساخت محتوا
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/course"
          className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-[0_3px_0_#e2e8f0] transition-all active:translate-y-1 active:shadow-none"
        >
          مشاهده دوره‌ها
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
