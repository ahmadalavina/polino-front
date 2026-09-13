import { Layers3, RefreshCw } from 'lucide-react';
import { type AdminCourseOption } from '@/types/admin';

export function ReferenceInfo({
  courses,
  lessons,
  loading,
  error,
  onRefresh,
}: {
  courses: AdminCourseOption[];
  lessons: unknown[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
}) {
  return (
    <section className="rounded-[24px] border-2 border-white bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers3 size={18} className="text-[#7c5cff]" />
          <h2 className="text-sm font-black text-slate-700">
            اطلاعات مرجع
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onRefresh()}
          aria-label="به‌روزرسانی فهرست‌ها"
          className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-500"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-[#f1edff] p-3 text-center">
          <p className="text-xl font-black text-[#6748df]">
            {courses.length}
          </p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">
            دوره
          </p>
        </div>
        <div className="rounded-2xl bg-[#eafffb] p-3 text-center">
          <p className="text-xl font-black text-[#087d72]">
            {lessons.length}
          </p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">
            درس
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-xs font-bold leading-5 text-rose-500">
          {error}
        </p>
      )}
    </section>
  );
}
