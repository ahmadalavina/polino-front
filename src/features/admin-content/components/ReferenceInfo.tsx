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
    <section className="rounded-[24px] border-2 border-border bg-surface/90 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers3 size={18} className="text-brand" />
          <h2 className="text-sm font-black text-foreground">
            اطلاعات مرجع
          </h2>
        </div>
        <button
          type="button"
          onClick={() => onRefresh()}
          aria-label="به‌روزرسانی فهرست‌ها"
          className="grid size-8 place-items-center rounded-xl bg-surface-muted text-muted"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-brand-soft p-3 text-center">
          <p className="text-xl font-black text-brand-soft-foreground">
            {courses.length}
          </p>
          <p className="mt-1 text-[11px] font-bold text-muted">
            دوره
          </p>
        </div>
        <div className="rounded-2xl bg-info-soft p-3 text-center">
          <p className="text-xl font-black text-info-soft-foreground">
            {lessons.length}
          </p>
          <p className="mt-1 text-[11px] font-bold text-muted">
            درس
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-xs font-bold leading-5 text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
