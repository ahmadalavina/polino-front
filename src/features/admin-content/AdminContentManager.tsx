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
  Trash2,
  XCircle,
  Pencil,
  ArrowLeft,
  Eye,
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
  AdminLessonBlockOption,
  CreateCourseInput,
  CreateLessonInput,
  CreateLessonBlockInput,
  UpdateCourseInput,
  UpdateLessonInput,
} from '@/types/admin';
import type { BlockType, Lesson, LessonBlock } from '@/types/lesson';
import {
  courseSchema,
  lessonSchema,
  lessonBlockSchema,
  validateBlockPayload,
  courseUpdateSchema,
  lessonUpdateSchema,
  lessonBlockUpdateSchema,
} from './schemas';
import { basketGameDefaults } from '@/features/basket-game/basketGame';
import BlockPayloadEditor from './components/BlockPayloadEditor';

type AdminSection = 'course' | 'lesson' | 'block';
type ViewMode = 'list' | 'create' | 'edit';
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
  listTitle: string;
};

const sections: SectionDefinition[] = [
  {
    id: 'course',
    title: 'ساخت دوره',
    subtitle: 'اطلاعات اصلی مسیر آموزشی',
    icon: School,
    color: 'bg-[#7c5cff]',
    shadow: 'shadow-[0_5px_0_#6245dc]',
    listTitle: 'لیست دوره‌ها',
  },
  {
    id: 'lesson',
    title: 'ساخت درس',
    subtitle: 'افزودن درس به یک دوره',
    icon: BookOpen,
    color: 'bg-[#16b8a6]',
    shadow: 'shadow-[0_5px_0_#0c9082]',
    listTitle: 'لیست درس‌ها',
  },
  {
    id: 'block',
    title: 'ساخت بلاک',
    subtitle: 'محتوای مرحله‌ای هر درس',
    icon: Boxes,
    color: 'bg-[#ff8a55]',
    shadow: 'shadow-[0_5px_0_#e56f3d]',
    listTitle: 'لیست بلاک‌ها',
  },
];

const blockTypeLabels: Partial<Record<BlockType, string>> = {
  dialog: 'گفت‌وگو',
  image: 'تصویر',
  quiz: 'آزمون',
  story: 'داستان',
  reward: 'جایزه',
  animation: 'انیمیشن',
  video: 'ویدیو',
  drag_drop: 'کشیدن و رها کردن',
};

const blockPresets: Partial<Record<BlockType, Record<string, unknown>>> = {
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

Object.assign(blockTypeLabels, {
  drop_down: 'انتخاب گزینه',
  question_block: 'بلوک سوال',
  film_and_image: 'فیلم و تصویر',
  coin_hunt: 'شکار سکه',
  memory_financial: 'حافظه مالی',
  decision_tree: 'درخت تصمیم',
  basket_game: 'بازی سبد',
});

Object.assign(blockPresets, {
  drop_down: { introduction: '', label: '', options: [] },
  question_block: { introduction: '', label: '', options: [] },
  film_and_image: { introduction: '', videoUrl: '', imageUrl: '' },
  coin_hunt_legacy: {
    title: 'شکار سکه',
    introduction: 'سکه‌های درست را جمع کن!',
    items: [
      { id: 'coin-100', value: 100, collectible: true },
      { id: 'coin-500', value: 500, collectible: true },
    ],
  },
  memory_financial_legacy: {
    title: 'حافظه مالی',
    introduction: 'کارت‌های مرتبط را پیدا کن!',
    pairs: [
      { id: 'saving', cardA: 'پس‌انداز', cardB: 'هدف آینده' },
      { id: 'loan', cardA: 'وام', cardB: 'قرض گرفتن پول' },
    ],
  },
  coin_hunt: {
    introduction: 'Coin Hunt',
    duration: 60,
    target: { type: 'count', value: 2 },
    scoring: { correct: 10, wrong: -2 },
    items: [
      { id: 'coin-100', value: 100 },
      { id: 'coin-500', value: 500 },
    ],
  },
  memory_financial: {
    introduction: 'Match the pairs',
    pairs: [
      { id: 'saving', first: { type: 'saving' }, second: { type: 'future_goal' } },
      { id: 'loan', first: { type: 'loan' }, second: { type: 'borrowing' } },
    ],
  },
  decision_tree: {
    steps: [
      { id: 'pay-debt', question: 'بدهی داری، اول چی کار می‌کنی؟', choices: ['pay-debt', 'save', 'spend'] },
      { id: 'save', question: 'پول اضافی داری، اولویت بعدی چیه؟', choices: ['pay-debt', 'save', 'spend'] },
      { id: 'spend', question: 'بدهی صاف شد، پس‌انداز هم شد، چی می‌مونه؟', choices: ['pay-debt', 'save', 'spend'] },
    ],
    correctOrder: { steps: ['pay-debt', 'save', 'spend'] },
    lesson: { lesson: 'اول بدهی رو بده، بعد پس‌انداز کن، بعد خرج کن.' },
    scoring: { correct: 10, wrong: -5, maxScore: 30 },
  },
  basket_game: basketGameDefaults,
});

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
  pageNumber: '1',
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

function ConfirmDelete({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="grid size-16 place-items-center rounded-full bg-rose-100">
            <Trash2 size={28} className="text-rose-500" />
          </div>
        </div>
        <h3 className="mb-2 text-center text-lg font-black text-slate-800">
          حذف اطمینان
        </h3>
        <p className="mb-6 text-center text-sm text-slate-500">
          آیا از حذف این مورد اطمینان دارید؟ این عمل قابل بازگشت نیست.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-wait"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-black text-white shadow-[0_4px_0_#dc2626] transition-all hover:bg-rose-600 active:translate-y-1 active:shadow-none disabled:cursor-wait"
          >
            {loading ? 'در حال حذف...' : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  variant,
}: {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  variant: 'edit' | 'delete' | 'back' | 'view';
}) {
  const variants = {
    edit: 'bg-amber-100 text-amber-600 hover:bg-amber-200 shadow-[0_2px_0_#f59e0b]',
    delete: 'bg-rose-100 text-rose-600 hover:bg-rose-200 shadow-[0_2px_0_#ef4444]',
    back: 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-[0_2px_0_#94a3b8]',
    view: 'bg-blue-100 text-blue-600 hover:bg-blue-200 shadow-[0_2px_0_#3b82f6]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl border-2 border-transparent px-3 py-2 text-xs font-black transition-all active:translate-y-1 active:shadow-none ${variants[variant]}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function StatusBadge({ published }: { published?: boolean }) {
  if (published) {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-600">
        منتشر شده
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
      پیش‌نویس
    </span>
  );
}

export default function AdminContentManager() {
  const [activeSection, setActiveSection] =
    useState<AdminSection>('course');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [courses, setCourses] = useState<AdminCourseOption[]>([]);
  const [lessons, setLessons] = useState<AdminLessonOption[]>([]);
  const [blocks, setBlocks] = useState<AdminLessonBlockOption[]>([]);
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

  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'course' | 'lesson' | 'block';
    id: number;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<number | null>(null);
  const [selectedLessonForBlocks, setSelectedLessonForBlocks] = useState<number | null>(null);
  const [lessonBlocksLoading, setLessonBlocksLoading] = useState(false);
  const [courseDetail, setCourseDetail] = useState<{ id: number; title: string; lessons: { id: number; title: string }[] } | null>(null);

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
      const nextLessons = (
        Array.isArray(lessonResponse.data) ? lessonResponse.data : []
      ).map((lesson) => ({
        ...lesson,
        courseId: lesson.courseId ?? lesson.course?.id,
      }));

      setCourses(nextCourses);
      setLessons(nextLessons);

      if (activeSection === 'course') {
        setLessonForm((form) => ({
          ...form,
          courseId: form.courseId || String(nextCourses[0]?.id ?? ''),
        }));
        setBlockForm((form) => ({
          ...form,
          courseId: form.courseId || String(nextCourses[0]?.id ?? ''),
          lessonId: form.lessonId || String(nextLessons[0]?.id ?? ''),
        }));
      }

      if (activeSection === 'lesson' && selectedCourseForLessons) {
        const courseLessons = nextLessons.filter(
          (l) => l.courseId === selectedCourseForLessons,
        );
        setLessons(courseLessons);
      }
    } catch (error) {
      setReferenceError(getErrorMessage(error));
    } finally {
      setReferencesLoading(false);
    }
  }, [activeSection, selectedCourseForLessons]);

  const loadBlocks = useCallback(async (lessonId: number) => {
    setLessonBlocksLoading(true);
    try {
      const response = await api.getLessonBlocks(lessonId);
      const data = Array.isArray(response.data) ? response.data : [];
      //@ts-ignore
      setBlocks(data);
    } catch {
      setBlocks([]);
    } finally {
      setLessonBlocksLoading(false);
    }
  }, []);

  const loadCourseLessons = useCallback(async (courseId: number) => {
    try {
      const response = await api.getCourse(courseId);
      const course = response.data;
      setCourseDetail(course);
      setSelectedCourseForLessons(courseId);
      setLessons(
        //@ts-ignore
        Array.isArray(course.lessons)
          ? course.lessons.map((l: Lesson) => ({
              id: l.id,
              title: l.title,
              courseId,
            }))
          : []
      );
    } catch {
      // fallback: use lessons already in state
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

  const filteredLessons = useMemo(() => {
    if (!selectedCourseForLessons) return lessons;
    return lessons.filter((l) => l.courseId === selectedCourseForLessons);
  }, [lessons, selectedCourseForLessons]);

  async function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCourseErrors({});
    setCourseStatus({ type: 'idle' });

    if (editingCourseId) {
      const parsed = courseUpdateSchema.safeParse(courseForm);
      if (!parsed.success) {
        setCourseErrors(getFieldErrors(parsed.error.issues));
        return;
      }
      setCourseStatus({ type: 'submitting' });
      try {
        const updatePayload: UpdateCourseInput = {};
        if (courseForm.title) updatePayload.title = courseForm.title;
        if (courseForm.description) updatePayload.description = courseForm.description;
        if (courseForm.cover) updatePayload.cover = courseForm.cover;
        updatePayload.order = parseInt(courseForm.order) || undefined;
        updatePayload.isPublished = courseForm.isPublished;

        await api.updateCourse(editingCourseId, updatePayload);
        setCourseStatus({
          type: 'success',
          message: 'دوره با موفقیت ویرایش شد.',
        });
        await loadReferences();
        setEditingCourseId(null);
        setViewMode('list');
        setCourseForm(initialCourseForm);
      } catch (error) {
        setCourseStatus({
          type: 'error',
          message: getErrorMessage(error),
        });
      }
      return;
    }

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
      setViewMode('list');
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

    if (editingLessonId) {
      if (!lessonForm.courseId) {
        setLessonErrors({ courseId: 'برای ویرایش، دوره والد باید مشخص باشد.' });
        return;
      }
      const parsed = lessonUpdateSchema.safeParse(lessonForm);
      if (!parsed.success) {
        setLessonErrors(getFieldErrors(parsed.error.issues));
        return;
      }
      setLessonStatus({ type: 'submitting' });
      try {
        const updatePayload: UpdateLessonInput = {};
        if (lessonForm.title) updatePayload.title = lessonForm.title;
        if (lessonForm.description) updatePayload.description = lessonForm.description;
        if (lessonForm.icon) updatePayload.icon = lessonForm.icon;
        updatePayload.sortOrder = parseInt(lessonForm.sortOrder) || undefined;
        updatePayload.order = parseInt(lessonForm.order) || undefined;
        updatePayload.rewardXp = parseInt(lessonForm.rewardXp) || undefined;
        updatePayload.rewardCoins = parseInt(lessonForm.rewardCoins) || undefined;
        updatePayload.courseId = parseInt(lessonForm.courseId);
        updatePayload.isPublished = lessonForm.isPublished;

        await api.updateLesson(editingLessonId, updatePayload);
        setLessonStatus({
          type: 'success',
          message: 'درس با موفقیت ویرایش شد.',
        });
        await loadReferences();
        setEditingLessonId(null);
        setViewMode('list');
        setLessonForm(initialLessonForm);
      } catch (error) {
        setLessonStatus({
          type: 'error',
          message: getErrorMessage(error),
        });
      }
      return;
    }

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
      setViewMode('list');
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

    const validatedPayload = validateBlockPayload(blockForm.type, payload);
    if (!validatedPayload.success) {
      setBlockErrors({
        payload: validatedPayload.error.issues[0]?.message ?? 'تنظیمات بازی معتبر نیست.',
      });
      return;
    }
    payload = validatedPayload.data;

    if (!blockForm.courseId) {
      setBlockErrors({ courseId: 'یک دوره انتخاب کنید.' });
      return;
    }

    if (editingBlockId) {
      if (!blockForm.lessonId) {
        setBlockErrors({ lessonId: 'برای ویرایش، درس والد باید مشخص باشد.' });
        return;
      }
      const parsed = lessonBlockUpdateSchema.safeParse({
        sortOrder: parseInt(blockForm.sortOrder) || undefined,
        pageNumber: parseInt(blockForm.pageNumber) || undefined,
        type: blockForm.type,
        payload,
        lessonId: parseInt(blockForm.lessonId),
      });
      if (!parsed.success) {
        setBlockErrors(getFieldErrors(parsed.error.issues));
        return;
      }
      setBlockStatus({ type: 'submitting' });
      try {
        const updatePayload: Partial<CreateLessonBlockInput> = {};
        if (blockForm.sortOrder) updatePayload.sortOrder = parseInt(blockForm.sortOrder);
        if (blockForm.pageNumber) updatePayload.pageNumber = parseInt(blockForm.pageNumber);
        updatePayload.type = blockForm.type;
        updatePayload.payload = payload as Record<string, unknown>;
        updatePayload.lessonId = parseInt(blockForm.lessonId);

        await api.updateLessonBlock(editingBlockId, updatePayload);
        setBlockStatus({
          type: 'success',
          message: 'بلاک با موفقیت ویرایش شد.',
        });
        if (selectedLessonForBlocks) {
          await loadBlocks(selectedLessonForBlocks);
        }
        setEditingBlockId(null);
        setViewMode('list');
        setBlockForm(initialBlockForm);
      } catch (error) {
        setBlockStatus({
          type: 'error',
          message: getErrorMessage(error),
        });
      }
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
      if (selectedLessonForBlocks) {
        await loadBlocks(selectedLessonForBlocks);
      }
    } catch (error) {
      setBlockStatus({
        type: 'error',
        message: getErrorMessage(error),
      });
    }
  }

  function startCreateCourse() {
    setEditingCourseId(null);
    setCourseForm(initialCourseForm);
    setCourseErrors({});
    setCourseStatus({ type: 'idle' });
    setViewMode('create');
  }

  function startCreateLesson() {
    setEditingLessonId(null);
    setLessonForm({
      ...initialLessonForm,
      courseId: String(selectedCourseForLessons || courses[0]?.id || ''),
    });
    setLessonErrors({});
    setLessonStatus({ type: 'idle' });
    setViewMode('create');
  }

  function startCreateBlock() {
    setEditingBlockId(null);
    setBlockForm({
      ...initialBlockForm,
      courseId: String(selectedCourseForLessons || courses[0]?.id || ''),
      lessonId: String(selectedLessonForBlocks || lessons[0]?.id || ''),
    });
    setBlockErrors({});
    setBlockStatus({ type: 'idle' });
    setViewMode('create');
  }

  function editCourse(course: AdminCourseOption) {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      cover: course.cover || '',
      order: String(course.order || 1),
      isPublished: course.isPublished ?? true,
    });
    setCourseErrors({});
    setCourseStatus({ type: 'idle' });
    setViewMode('edit');
  }

  function editLesson(lesson: AdminLessonOption) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      courseId: String(
        lesson.courseId ?? lesson.course?.id ?? courses[0]?.id ?? '',
      ),
      title: lesson.title || '',
      description: lesson.description || '',
      icon: lesson.icon || '',
      sortOrder: String(lesson.order || 1),
      order: String(lesson.order || 1),
      rewardXp: String(lesson.rewardXp ?? 20),
      rewardCoins: String(lesson.rewardCoins ?? 5),
      isPublished: lesson.isPublished ?? true,
    });
    setLessonErrors({});
    setLessonStatus({ type: 'idle' });
    setViewMode('edit');
  }

  async function editBlock(block: AdminLessonBlockOption) {
    const lessonId = block.lessonId ?? block.lesson?.id;
    const parentLesson = lessons.find((lesson) => lesson.id === lessonId);
    const courseId =
      parentLesson?.courseId ??
      parentLesson?.course?.id ??
      block.lesson?.courseId ??
      courses[0]?.id;

    setEditingBlockId(block.id);
    setBlockForm({
      courseId: String(courseId ?? ''),
      lessonId: String(lessonId ?? ''),
      sortOrder: String(block.sortOrder || 1),
      pageNumber: String(block.pageNumber || 1),
      type: block.type,
      payload: JSON.stringify(block.payload, null, 2),
    });
    setBlockErrors({});
    setBlockStatus({ type: 'idle' });
    setViewMode('edit');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'course') {
        await api.deleteCourse(deleteTarget.id);
        setCourseStatus({
          type: 'success',
          message: `دوره "${deleteTarget.title}" با موفقیت حذف شد.`,
        });
      } else if (deleteTarget.type === 'lesson') {
        await api.deleteLesson(deleteTarget.id);
        setLessonStatus({
          type: 'success',
          message: `درس "${deleteTarget.title}" با موفقیت حذف شد.`,
        });
      } else if (deleteTarget.type === 'block') {
        await api.deleteLessonBlock(deleteTarget.id);
        setBlockStatus({
          type: 'success',
          message: `بلاک با موفقیت حذف شد.`,
        });
        if (selectedLessonForBlocks) {
          await loadBlocks(selectedLessonForBlocks);
        }
      }
      await loadReferences();
      setDeleteTarget(null);
    } catch (error) {
      const msg = getErrorMessage(error);
      if (deleteTarget.type === 'course') setCourseStatus({ type: 'error', message: msg });
      else if (deleteTarget.type === 'lesson') setLessonStatus({ type: 'error', message: msg });
      else setBlockStatus({ type: 'error', message: msg });
    } finally {
      setDeleteLoading(false);
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

  function resetView() {
    setViewMode('list');
    setEditingCourseId(null);
    setEditingLessonId(null);
    setEditingBlockId(null);
    setCourseErrors({});
    setLessonErrors({});
    setBlockErrors({});
    setCourseStatus({ type: 'idle' });
    setLessonStatus({ type: 'idle' });
    setBlockStatus({ type: 'idle' });
  }

  function handleSectionChange(section: AdminSection) {
    setActiveSection(section);
    resetView();
    if (section === 'lesson') {
      loadReferences();
    }
    if (section === 'block') {
      loadReferences();
    }
  }

  function handleCourseSelectForLessons(courseId: number) {
    setSelectedCourseForLessons(courseId);
    setSelectedLessonForBlocks(null);
    setBlocks([]);
    loadCourseLessons(courseId);
  }

  function handleLessonSelectForBlocks(lessonId: number) {
    setSelectedLessonForBlocks(lessonId);
    loadBlocks(lessonId);
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
                {viewMode === 'list' ? (
                  <Layers3 size={28} strokeWidth={3} />
                ) : (
                  <Plus size={28} strokeWidth={3} />
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-black text-[#58b759]">
                  {viewMode === 'list' ? 'مدیریت' : viewMode === 'create' ? 'ایجاد جدید' : 'ویرایش'}
                </p>
                <h1 className="text-2xl font-black leading-9 text-slate-800 sm:text-3xl">
                  {viewMode === 'list'
                    ? activeDefinition.listTitle
                    : viewMode === 'create'
                    ? activeDefinition.title
                    : `ویرایش ${
                        activeSection === 'course'
                          ? 'دوره'
                          : activeSection === 'lesson'
                          ? 'درس'
                          : 'بلاک'
                      }`}
                </h1>
              </div>
            </div>
            <p className="text-sm font-medium leading-7 text-slate-500 sm:text-base">
              {viewMode === 'list'
                ? 'لیست موارد موجود. برای ویرایش یا حذف روی دکمه‌ها کلیک کنید.'
                : activeSection === 'course'
                ? 'اطلاعات اصلی مسیر آموزشی را تعریف کنید.'
                : activeSection === 'lesson'
                ? 'محتوای هر درس را به صورت مرحله‌ای مدیریت کنید.'
                : 'نوع و محتوای بلاک آموزشی را مشخص کنید.'}
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <nav className="rounded-[28px] border-2 border-white bg-white/95 p-3 shadow-[0_14px_45px_rgba(38,61,89,0.1)]">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionChange(section.id)}
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
                        {section.title}
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
            {/* List View */}
            {viewMode === 'list' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`grid size-10 place-items-center rounded-xl text-white ${activeDefinition.color}`}
                    >
                      <ActiveIcon size={20} strokeWidth={2.7} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800">
                      {activeDefinition.listTitle}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      activeSection === 'course'
                        ? startCreateCourse()
                        : activeSection === 'lesson'
                        ? startCreateLesson()
                        : startCreateBlock()
                    }
                    className="flex items-center gap-2 rounded-2xl bg-[#58cc59] px-4 py-2.5 text-xs font-black text-white shadow-[0_3px_0_#3da83e] transition-all active:translate-y-1 active:shadow-none"
                  >
                    <Plus size={16} />
                    {activeSection === 'course'
                      ? 'دوره جدید'
                      : activeSection === 'lesson'
                      ? 'درس جدید'
                      : 'بلاک جدید'}
                  </button>
                </div>

                {activeSection === 'course' && (
                  <div className="space-y-3">
                    {courses.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                        <School size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-bold text-slate-400">
                          هنوز دوره‌ای ساخته نشده
                        </p>
                        <button
                          type="button"
                          onClick={startCreateCourse}
                          className="mt-3 text-xs font-black text-[#7c5cff] hover:underline"
                        >
                          اولین دوره را بسازید ←
                        </button>
                      </div>
                    ) : (
                      courses
                        .sort((a, b) => a.order - b.order)
                        .map((course) => (
                          <div
                            key={course.id}
                            className="group rounded-2xl border-2 border-slate-100 bg-white p-4 transition-all hover:border-[#7c5cff]/30 hover:shadow-md"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f1edff] text-[#7c5cff]">
                                  <School size={18} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-slate-800 truncate">
                                    {course.title}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {course.description?.slice(0, 60)}
                                    {course.description?.length > 60 ? '...' : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <StatusBadge published={course.isPublished} />
                                <span className="text-[10px] font-black text-slate-300">
                                  #{course.order}
                                </span>
                                <ActionButton
                                  onClick={() => editCourse(course)}
                                  icon={Pencil}
                                  label="ویرایش"
                                  variant="edit"
                                />
                                <ActionButton
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: 'course',
                                      id: course.id,
                                      title: course.title,
                                    })
                                  }
                                  icon={Trash2}
                                  label="حذف"
                                  variant="delete"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {activeSection === 'lesson' && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-black text-slate-700">
                        فیلتر بر اساس دوره
                      </label>
                      <select
                        value={selectedCourseForLessons || ''}
                        onChange={(e) =>
                          handleCourseSelectForLessons(Number(e.target.value))
                        }
                        className={inputClassName}
                      >
                        <option value="">همه دوره‌ها</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {filteredLessons.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                        <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-bold text-slate-400">
                          هنوز درسی وجود ندارد
                        </p>
                        <button
                          type="button"
                          onClick={startCreateLesson}
                          className="mt-3 text-xs font-black text-[#16b8a6] hover:underline"
                        >
                          اولین درس را بسازید ←
                        </button>
                      </div>
                    ) : (
                      filteredLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="group rounded-2xl border-2 border-slate-100 bg-white p-4 transition-all hover:border-[#16b8a6]/30 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eafffb] text-[#16b8a6]">
                                <BookOpen size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-slate-400">
                                  دوره #{lesson.courseId}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <ActionButton
                                onClick={() => editLesson(lesson)}
                                icon={Pencil}
                                label="ویرایش"
                                variant="edit"
                              />
                              <ActionButton
                                onClick={() =>
                                  setDeleteTarget({
                                    type: 'lesson',
                                    id: lesson.id,
                                    title: lesson.title,
                                  })
                                }
                                icon={Trash2}
                                label="حذف"
                                variant="delete"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeSection === 'block' && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          دوره
                        </label>
                        <select
                          value={selectedCourseForLessons || ''}
                          onChange={(e) =>
                            handleCourseSelectForLessons(Number(e.target.value))
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
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black text-slate-700">
                          درس
                        </label>
                        <select
                          value={selectedLessonForBlocks || ''}
                          onChange={(e) =>
                            handleLessonSelectForBlocks(Number(e.target.value))
                          }
                          className={inputClassName}
                          disabled={!selectedCourseForLessons}
                        >
                          <option value="">انتخاب درس</option>
                          {filteredLessons.map((lesson) => (
                            <option key={lesson.id} value={lesson.id}>
                              {lesson.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {lessonBlocksLoading ? (
                      <div className="flex justify-center py-12">
                        <LoaderCircle size={32} className="animate-spin text-[#ff8a55]" />
                      </div>
                    ) : blocks.length === 0 && selectedLessonForBlocks ? (
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                        <Boxes size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-bold text-slate-400">
                          هنوز بلاکی برای این درس وجود ندارد
                        </p>
                        <button
                          type="button"
                          onClick={startCreateBlock}
                          className="mt-3 text-xs font-black text-[#ff8a55] hover:underline"
                        >
                          اولین بلاک را بسازید ←
                        </button>
                      </div>
                    ) : blocks.length === 0 && !selectedLessonForBlocks ? (
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
                        <Boxes size={32} className="mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-bold text-slate-400">
                          دوره و درس را انتخاب کنید
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {blocks
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((block) => (
                            <div
                              key={block.id}
                              className="group rounded-2xl border-2 border-slate-100 bg-white p-4 transition-all hover:border-[#ff8a55]/30 hover:shadow-md"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0e9] text-[#ff8a55]">
                                    <Boxes size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800">
                                      {blockTypeLabels[block.type] || block.type}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      صفحه {block.pageNumber} · ترتیب {block.sortOrder}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <ActionButton
                                    onClick={() => editBlock(block)}
                                    icon={Pencil}
                                    label="ویرایش"
                                    variant="edit"
                                  />
                                  <ActionButton
                                    onClick={() =>
                                      setDeleteTarget({
                                        type: 'block',
                                        id: block.id,
                                        title: `${blockTypeLabels[block.type] || block.type} #${block.sortOrder}`,
                                      })
                                    }
                                    icon={Trash2}
                                    label="حذف"
                                    variant="delete"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Form View (Create / Edit) */}
            {viewMode !== 'list' && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetView}
                    className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-[0_2px_0_#e2e8f0] transition-all hover:bg-slate-50 active:translate-y-1 active:shadow-none"
                  >
                    <ArrowLeft size={14} />
                    بازگشت به لیست
                  </button>
                  <div
                    className={`grid size-10 shrink-0 place-items-center rounded-xl text-white ${activeDefinition.color} ${activeDefinition.shadow}`}
                  >
                    <ActiveIcon size={20} strokeWidth={2.7} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">
                      {viewMode === 'create'
                        ? activeDefinition.title
                        : `ویرایش ${
                            activeSection === 'course'
                              ? 'دوره'
                              : activeSection === 'lesson'
                              ? 'درس'
                              : 'بلاک'
                          }`}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {viewMode === 'create'
                        ? activeDefinition.subtitle
                        : activeDefinition.subtitle}
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
                      label={
                        editingCourseId
                          ? 'ذخیره تغییرات دوره'
                          : 'ساخت دوره و ادامه'
                      }
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
                      label={
                        editingLessonId
                          ? 'ذخیره تغییرات درس'
                          : 'ساخت درس و ادامه'
                      }
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
                      <FormField
                        label="شماره صفحه"
                        hint="شماره صفحه‌ای که این بلوک در آن نمایش داده می‌شود."
                        error={blockErrors.pageNumber}
                      >
                        <input
                          type="number"
                          min={1}
                          value={blockForm.pageNumber}
                          onChange={(event) =>
                            setBlockForm((form) => ({ ...form, pageNumber: event.target.value }))
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
                      label={
                        editingBlockId
                          ? 'ذخیره تغییرات بلاک'
                          : 'افزودن بلاک به درس'
                      }
                    />
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDelete
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </main>
  );
}
