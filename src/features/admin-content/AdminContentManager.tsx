'use client';

import {
  BookOpen,
  Boxes,
  CheckCircle2,
  Coins,
  GraduationCap,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  School,
  Sparkles,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type {
  AdminCourseOption,
  AdminLessonOption,
} from '@/types/admin';
import type { BlockType } from '@/types/lesson';
import {
  courseSchema,
  lessonBlockSchema,
  lessonSchema,
} from './schemas';
import BlockPayloadEditor from './components/BlockPayloadEditor';

type AdminSection = 'course' | 'lesson' | 'block';
type FieldErrors = Record<string, string>;
type SubmitStatus = {
  type: 'idle' | 'submitting' | 'success' | 'error';
  message?: string;
};

type SectionDefinition = {
  id: AdminSection;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  shadow: string;
};

const sections: SectionDefinition[] = [
  {
    id: 'course',
    title: 'ساخت دوره',
    subtitle: 'اطلاعات اصلی مسیر آموزشی',
    icon: School,
    color: 'bg-[#7c5cff]',
    shadow: 'shadow-[0_5px_0_#6245dc]',
  },
  {
    id: 'lesson',
    title: 'ساخت درس',
    subtitle: 'افزودن درس به یک دوره',
    icon: BookOpen,
    color: 'bg-[#16b8a6]',
    shadow: 'shadow-[0_5px_0_#0c9082]',
  },
  {
    id: 'block',
    title: 'ساخت بلاک',
    subtitle: 'محتوای مرحله‌ای هر درس',
    icon: Boxes,
    color: 'bg-[#ff8a55]',
    shadow: 'shadow-[0_5px_0_#e56f3d]',
  },
];

const blockTypeLabels: Record<BlockType, string> = {
  dialog: 'گفت‌وگو',
  image: 'تصویر',
  quiz: 'آزمون',
  story: 'داستان',
  reward: 'جایزه',
  animation: 'انیمیشن',
  video: 'ویدیو',
  drag_drop: 'کشیدن و رها کردن',
};

const blockPresets: Record<BlockType, Record<string, unknown>> = {
  dialog: {
    character: 'fox',
    text: 'سلام! امروز درباره پول یاد می‌گیریم.',
  },
  image: {
    url: 'lessons/example.png',
    caption: 'توضیح تصویر آموزشی',
  },
  quiz: {
    quizId: 1,
  },
  story: {
    title: 'عنوان داستان',
    text: 'متن داستان را اینجا وارد کنید.',
  },
  reward: {
    xp: 20,
    coins: 5,
    message: 'آفرین! جایزه این مرحله را گرفتی.',
  },
  animation: {
    url: 'animations/example.json',
    caption: 'توضیح انیمیشن',
  },
  video: {
    url: 'videos/example.mp4',
    caption: 'توضیح ویدیو',
  },
  drag_drop: {
    instruction: 'هر گزینه را در جای درست قرار بده.',
    items: [],
    targets: [],
  },
};

const initialCourseForm = {
  title: '',
  description: '',
  cover: '',
  order: '1',
  isPublished: true,
};

const initialLessonForm = {
  courseId: '',
  title: '',
  description: '',
  icon: '',
  sortOrder: '1',
  order: '1',
  rewardXp: '20',
  rewardCoins: '5',
  isPublished: true,
};

const initialBlockForm = {
  courseId: '',
  lessonId: '',
  sortOrder: '1',
  type: 'dialog' as BlockType,
  payload: JSON.stringify(blockPresets.dialog, null, 2),
};

const inputClassName =
  'h-13 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-[#7c5cff] focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,92,255,0.1)]';

function getFieldErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  return issues.reduce<FieldErrors>((errors, issue) => {
    const field = String(issue.path[0] ?? 'form');
    if (!errors[field]) errors[field] = issue.message;
    return errors;
  }, {});
}

function getCreatedId(response: unknown) {
  if (typeof response !== 'object' || response === null) return null;

  const data =
    'data' in response && typeof response.data === 'object'
      ? response.data
      : response;

  if (typeof data !== 'object' || data === null || !('id' in data)) return null;

  const id = Number(data.id);
  return Number.isInteger(id) ? id : null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'مشکلی پیش آمد؛ دوباره تلاش کنید.';
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs font-bold text-rose-500">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-2 block text-xs font-medium leading-5 text-slate-400">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function PublishToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
      <span>
        <span className="block text-sm font-black text-slate-700">
          انتشار محتوا
        </span>
        <span className="mt-1 block text-xs font-medium text-slate-400">
          بعد از ساخت برای کاربران قابل نمایش باشد
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-[#58cc59]"
      />
    </label>
  );
}

function SubmitBanner({ status }: { status: SubmitStatus }) {
  if (status.type === 'idle' || status.type === 'submitting') return null;

  const isSuccess = status.type === 'success';

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${
        isSuccess
          ? 'border-green-100 bg-green-50 text-[#278f2b]'
          : 'border-rose-100 bg-rose-50 text-rose-600'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 shrink-0" size={21} />
      ) : (
        <XCircle className="mt-0.5 shrink-0" size={21} />
      )}
      <p className="text-sm font-bold leading-6">{status.message}</p>
    </div>
  );
}

function SubmitButton({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e] disabled:cursor-wait disabled:bg-slate-300 disabled:shadow-[0_6px_0_#cbd5e1]"
    >
      {loading ? (
        <LoaderCircle className="animate-spin" size={21} />
      ) : (
        <Save size={20} strokeWidth={3} />
      )}
      {loading ? 'در حال ذخیره...' : label}
    </button>
  );
}

export default function AdminContentManager() {
  const [activeSection, setActiveSection] =
    useState<AdminSection>('course');
  const [courses, setCourses] = useState<AdminCourseOption[]>([]);
  const [lessons, setLessons] = useState<AdminLessonOption[]>([]);
  const [referencesLoading, setReferencesLoading] = useState(true);
  const [referenceError, setReferenceError] = useState('');

  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [lessonForm, setLessonForm] = useState(initialLessonForm);
  const [blockForm, setBlockForm] = useState(initialBlockForm);

  const [courseErrors, setCourseErrors] = useState<FieldErrors>({});
  const [lessonErrors, setLessonErrors] = useState<FieldErrors>({});
  const [blockErrors, setBlockErrors] = useState<FieldErrors>({});

  const [courseStatus, setCourseStatus] = useState<SubmitStatus>({
    type: 'idle',
  });
  const [lessonStatus, setLessonStatus] = useState<SubmitStatus>({
    type: 'idle',
  });
  const [blockStatus, setBlockStatus] = useState<SubmitStatus>({
    type: 'idle',
  });

  const loadReferences = useCallback(async () => {
    setReferencesLoading(true);
    setReferenceError('');

    try {
      const [courseResponse, lessonResponse] = await Promise.all([
        api.getCourses(),
        api.getLessons(),
      ]);
      const nextCourses = Array.isArray(courseResponse.data)
        ? courseResponse.data
        : [];
      const nextLessons = Array.isArray(lessonResponse.data)
        ? lessonResponse.data
        : [];

      setCourses(nextCourses);
      setLessons(nextLessons);
      setLessonForm((form) => ({
        ...form,
        courseId: form.courseId || String(nextCourses[0]?.id ?? ''),
      }));
      setBlockForm((form) => ({
        ...form,
        courseId: form.courseId || String(nextCourses[0]?.id ?? ''),
        lessonId: form.lessonId || String(nextLessons[0]?.id ?? ''),
      }));
    } catch (error) {
      setReferenceError(getErrorMessage(error));
    } finally {
      setReferencesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  const activeDefinition =
    sections.find((section) => section.id === activeSection) ?? sections[0];
  const ActiveIcon = activeDefinition.icon;

  const selectedCourseLessons = useMemo(() => {
    const selectedCourseId = Number(blockForm.courseId);

    if (!selectedCourseId) return lessons;

    const matchingLessons = lessons.filter(
      (lesson) => lesson.courseId === selectedCourseId,
    );

    return matchingLessons.length > 0 ? matchingLessons : lessons;
  }, [blockForm.courseId, lessons]);

  async function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCourseErrors({});
    setCourseStatus({ type: 'idle' });

    const parsed = courseSchema.safeParse(courseForm);

    if (!parsed.success) {
      setCourseErrors(getFieldErrors(parsed.error.issues));
      return;
    }

    setCourseStatus({ type: 'submitting' });

    try {
      const response = await api.createCourse(parsed.data);
      const createdId = getCreatedId(response);

      setCourseStatus({
        type: 'success',
        message: 'دوره با موفقیت ساخته شد. حالا اولین درسش را اضافه کنید.',
      });
      setCourseForm((form) => ({
        ...initialCourseForm,
        order: String(Number(form.order) + 1),
      }));
      await loadReferences();
      if (createdId) {
        setLessonForm((form) => ({
          ...form,
          courseId: String(createdId),
        }));
      }
      setActiveSection('lesson');
    } catch (error) {
      setCourseStatus({
        type: 'error',
        message: getErrorMessage(error),
      });
    }
  }

  async function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLessonErrors({});
    setLessonStatus({ type: 'idle' });

    const parsed = lessonSchema.safeParse(lessonForm);

    if (!parsed.success) {
      setLessonErrors(getFieldErrors(parsed.error.issues));
      return;
    }

    setLessonStatus({ type: 'submitting' });

    try {
      const response = await api.createLesson(parsed.data);
      const createdId = getCreatedId(response);
      const selectedCourseId = lessonForm.courseId;

      setLessonStatus({
        type: 'success',
        message: 'درس ساخته شد. حالا بلاک‌های محتوایی آن را اضافه کنید.',
      });
      setLessonForm((form) => ({
        ...initialLessonForm,
        courseId: selectedCourseId,
        sortOrder: String(Number(form.sortOrder) + 1),
        order: String(Number(form.order) + 1),
      }));
      await loadReferences();
      if (createdId) {
        setBlockForm((form) => ({
          ...form,
          courseId: selectedCourseId,
          lessonId: String(createdId),
        }));
      }
      setActiveSection('block');
    } catch (error) {
      setLessonStatus({
        type: 'error',
        message: getErrorMessage(error),
      });
    }
  }

  async function handleBlockSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBlockErrors({});
    setBlockStatus({ type: 'idle' });

    let payload: unknown;

    try {
      payload = JSON.parse(blockForm.payload);
    } catch {
      setBlockErrors({
        payload: 'ساختار JSON معتبر نیست؛ ویرگول‌ها و کوتیشن‌ها را بررسی کنید.',
      });
      return;
    }

    if (!blockForm.courseId) {
      setBlockErrors({ courseId: 'یک دوره انتخاب کنید.' });
      return;
    }

    const parsed = lessonBlockSchema.safeParse({
      ...blockForm,
      payload,
    });

    if (!parsed.success) {
      setBlockErrors(getFieldErrors(parsed.error.issues));
      return;
    }

    setBlockStatus({ type: 'submitting' });

    try {
      await api.createLessonBlock(parsed.data);
      setBlockStatus({
        type: 'success',
        message: 'بلاک با موفقیت به درس اضافه شد.',
      });
      setBlockForm((form) => ({
        ...form,
        sortOrder: String(Number(form.sortOrder) + 1),
      }));
    } catch (error) {
      setBlockStatus({
        type: 'error',
        message: getErrorMessage(error),
      });
    }
  }

  function handleBlockTypeChange(type: BlockType) {
    setBlockForm((form) => ({
      ...form,
      type,
      payload: JSON.stringify(blockPresets[type], null, 2),
    }));
    setBlockErrors({});
    setBlockStatus({ type: 'idle' });
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#f5fbff] text-slate-800"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -start-36 -top-36 size-96 rounded-full bg-[#ddf8ef]" />
      <div className="pointer-events-none absolute -bottom-48 -end-32 size-[30rem] rounded-full bg-[#ece7ff]" />
      <div className="pointer-events-none absolute end-[7%] top-60 hidden size-5 rotate-45 rounded bg-[#ff8a55]/35 lg:block" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#7c5cff] text-white shadow-[0_4px_0_#6245dc]">
            <GraduationCap size={24} strokeWidth={2.7} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-800">مدیریت پولینو</p>
            <p className="text-[10px] font-bold text-slate-400">
              ساخت محتوای آموزشی
            </p>
          </div>
        </div>

        <Link
          href="/course"
          className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-[0_3px_0_#e2e8f0] transition-all active:translate-y-1 active:shadow-none"
        >
          مشاهده دوره‌ها
        </Link>
      </header>

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-3 sm:px-8 sm:pt-6">
        <section className="relative mb-7 overflow-hidden rounded-[32px] border-2 border-white bg-white/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur sm:p-8">
          <div className="absolute -end-14 -top-16 size-48 rounded-full bg-[#eafffb]" />
          <Sparkles
            className="absolute end-10 top-8 hidden text-[#16b8a6] sm:block"
            size={32}
          />
          <div className="relative max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid size-14 place-items-center rounded-2xl bg-[#58cc59] text-white shadow-[0_5px_0_#3da83e]">
                <Plus size={28} strokeWidth={3} />
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-[#58b759]">
                  پنل تولید محتوا
                </p>
                <h1 className="text-2xl font-black leading-9 text-slate-800 sm:text-3xl">
                  ساخت دوره، درس و بلاک
                </h1>
              </div>
            </div>
            <p className="text-sm font-medium leading-7 text-slate-500 sm:text-base">
              ابتدا دوره را بسازید، سپس درس‌های آن را اضافه کنید و در پایان
              محتوای مرحله‌ای هر درس را بچینید.
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <nav className="rounded-[28px] border-2 border-white bg-white/95 p-3 shadow-[0_14px_45px_rgba(38,61,89,0.1)]">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-start transition-all ${
                      isActive
                        ? 'bg-slate-50'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl text-white ${section.color} ${section.shadow}`}
                    >
                      <Icon size={22} strokeWidth={2.7} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black text-slate-700">
                        {index + 1}. {section.title}
                      </span>
                      <span className="mt-1 block truncate text-[11px] font-medium text-slate-400">
                        {section.subtitle}
                      </span>
                    </span>
                    {isActive && (
                      <span className="size-2 rounded-full bg-[#58cc59]" />
                    )}
                  </button>
                );
              })}
            </nav>

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
                  onClick={() => void loadReferences()}
                  aria-label="به‌روزرسانی فهرست‌ها"
                  className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-500"
                >
                  <RefreshCw
                    size={16}
                    className={referencesLoading ? 'animate-spin' : ''}
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
              {referenceError && (
                <p className="mt-3 text-xs font-bold leading-5 text-rose-500">
                  {referenceError}
                </p>
              )}
            </section>
          </aside>

          <section className="rounded-[30px] border-2 border-white bg-white/95 p-5 shadow-[0_18px_55px_rgba(38,61,89,0.11)] sm:p-8">
            <div className="mb-7 flex items-start gap-4">
              <div
                className={`grid size-13 shrink-0 place-items-center rounded-2xl text-white ${activeDefinition.color} ${activeDefinition.shadow}`}
              >
                <ActiveIcon size={25} strokeWidth={2.7} />
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-[#58b759]">
                  مرحله {sections.findIndex((item) => item.id === activeSection) + 1}
                  {' '}از {sections.length}
                </p>
                <h2 className="text-xl font-black text-slate-800 sm:text-2xl">
                  {activeDefinition.title}
                </h2>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  {activeDefinition.subtitle}
                </p>
              </div>
            </div>

            {activeSection === 'course' && (
              <form className="space-y-5" onSubmit={handleCourseSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="نام دوره" error={courseErrors.title}>
                    <input
                      value={courseForm.title}
                      onChange={(event) =>
                        setCourseForm((form) => ({
                          ...form,
                          title: event.target.value,
                        }))
                      }
                      placeholder="مثلاً سواد مالی پایه"
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField
                    label="ترتیب نمایش"
                    error={courseErrors.order}
                  >
                    <input
                      type="number"
                      min={1}
                      value={courseForm.order}
                      onChange={(event) =>
                        setCourseForm((form) => ({
                          ...form,
                          order: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </FormField>
                </div>

                <FormField
                  label="توضیحات دوره"
                  error={courseErrors.description}
                >
                  <textarea
                    rows={4}
                    value={courseForm.description}
                    onChange={(event) =>
                      setCourseForm((form) => ({
                        ...form,
                        description: event.target.value,
                      }))
                    }
                    placeholder="این دوره چه مهارتی را آموزش می‌دهد؟"
                    className={`${inputClassName} h-auto resize-y py-3 leading-7`}
                  />
                </FormField>

                <FormField
                  label="مسیر تصویر کاور"
                  hint="نمونه مطابق Swagger: courses/finance-basic.png"
                  error={courseErrors.cover}
                >
                  <input
                    value={courseForm.cover}
                    onChange={(event) =>
                      setCourseForm((form) => ({
                        ...form,
                        cover: event.target.value,
                      }))
                    }
                    placeholder="courses/finance-basic.png"
                    className={inputClassName}
                  />
                </FormField>

                <PublishToggle
                  checked={courseForm.isPublished}
                  onChange={(isPublished) =>
                    setCourseForm((form) => ({ ...form, isPublished }))
                  }
                />
                <SubmitBanner status={courseStatus} />
                <SubmitButton
                  loading={courseStatus.type === 'submitting'}
                  label="ساخت دوره و ادامه"
                />
              </form>
            )}

            {activeSection === 'lesson' && (
              <form className="space-y-5" onSubmit={handleLessonSubmit}>
                <FormField
                  label="دوره مقصد"
                  hint={
                    courses.length === 0
                      ? 'ابتدا یک دوره بسازید یا فهرست را به‌روزرسانی کنید.'
                      : undefined
                  }
                  error={lessonErrors.courseId}
                >
                  <select
                    value={lessonForm.courseId}
                    onChange={(event) =>
                      setLessonForm((form) => ({
                        ...form,
                        courseId: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="">انتخاب دوره</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="نام درس" error={lessonErrors.title}>
                    <input
                      value={lessonForm.title}
                      onChange={(event) =>
                        setLessonForm((form) => ({
                          ...form,
                          title: event.target.value,
                        }))
                      }
                      placeholder="مثلاً پول چیست؟"
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField
                    label="مسیر آیکن"
                    error={lessonErrors.icon}
                  >
                    <input
                      value={lessonForm.icon}
                      onChange={(event) =>
                        setLessonForm((form) => ({
                          ...form,
                          icon: event.target.value,
                        }))
                      }
                      placeholder="money.png"
                      className={inputClassName}
                    />
                  </FormField>
                </div>

                <FormField
                  label="توضیحات درس"
                  error={lessonErrors.description}
                >
                  <textarea
                    rows={3}
                    value={lessonForm.description}
                    onChange={(event) =>
                      setLessonForm((form) => ({
                        ...form,
                        description: event.target.value,
                      }))
                    }
                    placeholder="خلاصه کوتاهی از محتوای درس"
                    className={`${inputClassName} h-auto resize-y py-3 leading-7`}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <FormField
                    label="Sort order"
                    error={lessonErrors.sortOrder}
                  >
                    <input
                      type="number"
                      min={1}
                      value={lessonForm.sortOrder}
                      onChange={(event) =>
                        setLessonForm((form) => ({
                          ...form,
                          sortOrder: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField label="شماره درس" error={lessonErrors.order}>
                    <input
                      type="number"
                      min={1}
                      value={lessonForm.order}
                      onChange={(event) =>
                        setLessonForm((form) => ({
                          ...form,
                          order: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField label="امتیاز XP" error={lessonErrors.rewardXp}>
                    <input
                      type="number"
                      min={0}
                      value={lessonForm.rewardXp}
                      onChange={(event) =>
                        setLessonForm((form) => ({
                          ...form,
                          rewardXp: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </FormField>
                  <FormField
                    label="جایزه سکه"
                    error={lessonErrors.rewardCoins}
                  >
                    <input
                      type="number"
                      min={0}
                      value={lessonForm.rewardCoins}
                      onChange={(event) =>
                        setLessonForm((form) => ({
                          ...form,
                          rewardCoins: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </FormField>
                </div>

                <PublishToggle
                  checked={lessonForm.isPublished}
                  onChange={(isPublished) =>
                    setLessonForm((form) => ({ ...form, isPublished }))
                  }
                />
                <SubmitBanner status={lessonStatus} />
                <SubmitButton
                  loading={lessonStatus.type === 'submitting'}
                  label="ساخت درس و ادامه"
                />
              </form>
            )}

            {activeSection === 'block' && (
              <form className="space-y-5" onSubmit={handleBlockSubmit}>
                <div className="grid gap-5 lg:grid-cols-3">
                  <FormField
                    label="دوره مرتبط"
                    error={blockErrors.courseId}
                  >
                    <select
                      value={blockForm.courseId}
                      onChange={(event) => {
                        const courseId = event.target.value;
                        const firstLesson = lessons.find(
                          (lesson) => lesson.courseId === Number(courseId),
                        );

                        setBlockForm((form) => ({
                          ...form,
                          courseId,
                          lessonId: String(firstLesson?.id ?? ''),
                        }));
                      }}
                      className={inputClassName}
                    >
                      <option value="">انتخاب دوره</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField
                    label="درس مقصد"
                    hint={
                      lessons.length === 0
                        ? 'ابتدا یک درس بسازید یا فهرست را به‌روزرسانی کنید.'
                        : undefined
                    }
                    error={blockErrors.lessonId}
                  >
                    <select
                      value={blockForm.lessonId}
                      onChange={(event) =>
                        setBlockForm((form) => ({
                          ...form,
                          lessonId: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    >
                      <option value="">انتخاب درس</option>
                      {selectedCourseLessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField
                    label="ترتیب بلاک"
                    error={blockErrors.sortOrder}
                  >
                    <input
                      type="number"
                      min={1}
                      value={blockForm.sortOrder}
                      onChange={(event) =>
                        setBlockForm((form) => ({
                          ...form,
                          sortOrder: event.target.value,
                        }))
                      }
                      className={inputClassName}
                    />
                  </FormField>
                </div>

                <FormField label="نوع بلاک" error={blockErrors.type}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(Object.keys(blockTypeLabels) as BlockType[]).map(
                      (type) => {
                        const isSelected = blockForm.type === type;

                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleBlockTypeChange(type)}
                            className={`rounded-2xl border-2 px-3 py-3 text-xs font-black transition-all ${
                              isSelected
                                ? 'border-[#ff8a55] bg-[#fff0e9] text-[#d65f2f] shadow-[0_3px_0_#ff8a55]'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {blockTypeLabels[type]}
                          </button>
                        );
                      },
                    )}
                  </div>
                </FormField>

                <BlockPayloadEditor
                  blockType={blockForm.type}
                  payloadJson={blockForm.payload}
                  onPayloadChange={(payload) =>
                    setBlockForm((form) => ({ ...form, payload }))
                  }
                  errors={blockErrors}
                />

                <div className="flex items-center gap-2 rounded-2xl bg-[#fff7d6] p-4 text-xs font-bold leading-6 text-[#8a6100]">
                  <Coins size={19} className="shrink-0 text-amber-500" />
                  بعد از ذخیره، ترتیب بلاک خودکار یک شماره افزایش پیدا می‌کند.
                </div>
                <SubmitBanner status={blockStatus} />
                <SubmitButton
                  loading={blockStatus.type === 'submitting'}
                  label="افزودن بلاک به درس"
                />
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
