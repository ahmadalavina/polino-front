'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CakeSlice,
  Check,
  Coins,
  GraduationCap,
  Heart,
  Minus,
  PartyPopper,
  Plus,
  Sparkles,
  Star,
  Trophy,
  UserRound,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

type FormData = {
  name: string;
  age: number | null;
  grade: number | null;
};

type StepId = 'name' | 'age' | 'grade';

type Step = {
  id: StepId;
  title: string;
  subtitle: string;
  icon: typeof UserRound;
  accent: string;
  accentForeground: string;
};

type NameInputProps = {
  value: string;
  onChange: (value: string) => void;
};

type AgePickerProps = {
  value: number | null;
  onChange: (value: number) => void;
};

type GradeSelectProps = {
  value: number | null;
  onChange: (value: number) => void;
};

const steps: Step[] = [
  {
    id: 'name',
    title: 'دوست داری چی صدات کنیم؟',
    subtitle: 'اسمت رو بنویس تا ماجراجویی‌مون رو شروع کنیم.',
    icon: UserRound,
    accent: 'bg-brand',
    accentForeground: 'text-brand-foreground',
  },
  {
    id: 'age',
    title: 'چند سالته؟',
    subtitle: 'سنت رو انتخاب کن تا تجربه‌ای مخصوص خودت بسازیم.',
    icon: CakeSlice,
    accent: 'bg-accent',
    accentForeground: 'text-accent-foreground',
  },
  {
    id: 'grade',
    title: 'کلاس چندمی هستی؟',
    subtitle: 'تا تمرین‌ها و جایزه‌های مناسب خودت رو ببینی.',
    icon: GraduationCap,
    accent: 'bg-info',
    accentForeground: 'text-info-foreground',
  },
];

const gradeLabels = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'];
const gradeIcons = gradeLabels.map(
  (_, index) => `/icons/ic_class${index + 1}.svg`,
);
const minimumAge = 7;
const maximumAge = 12;

function NameInput({ value, onChange }: NameInputProps) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm font-bold text-muted">
        نام و نام خانوادگی
      </span>
      <div className="group relative">
        <UserRound
          aria-hidden="true"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle transition-colors group-focus-within:text-brand"
          size={22}
        />
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="مثلاً آوا محمدی"
          className="h-16 w-full rounded-2xl border-2 border-border bg-surface-muted pr-12 pl-4 text-lg font-bold text-foreground outline-none transition-all placeholder:font-medium placeholder:text-subtle focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_rgba(124,92,255,0.12)]"
        />
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs font-medium text-subtle">
        <Sparkles size={14} className="text-warning-strong" />
        هر اسمی که دوست داری وارد کن
      </p>
    </label>
  );
}

function AgePicker({ value, onChange }: AgePickerProps) {
  const selectedAge = value ?? minimumAge;

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-4 text-center text-sm font-bold text-muted">
        سن خودت را با دکمه‌ها انتخاب کن
      </p>
      <div className="flex items-center justify-center gap-5" dir="ltr">
        <button
          type="button"
          onClick={() => onChange(Math.max(minimumAge, selectedAge - 1))}
          disabled={selectedAge <= minimumAge}
          aria-label="کم کردن سن"
          className="grid size-14 place-items-center rounded-2xl border-2 border-accent bg-surface text-accent shadow-[0_5px_0_var(--accent-strong)] transition-all active:translate-y-1 active:shadow-[0_1px_0_var(--accent-strong)] disabled:cursor-not-allowed disabled:border-border disabled:text-subtle disabled:shadow-[0_5px_0_var(--border-strong)]"
        >
          <Minus size={26} strokeWidth={3.5} />
        </button>
        <div
          className="grid size-28 place-items-center rounded-[32px] border-4 border-accent-soft bg-accent-soft text-center shadow-[0_7px_0_var(--accent)]"
          aria-live="polite"
        >
          <span>
            <span className="block text-4xl font-black text-accent-soft-foreground">
              {selectedAge}
            </span>
            <span className="mt-1 block text-sm font-black text-accent-soft-foreground">
              سال
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(maximumAge, selectedAge + 1))}
          disabled={selectedAge >= maximumAge}
          aria-label="زیاد کردن سن"
          className="grid size-14 place-items-center rounded-2xl border-2 border-accent bg-surface text-accent shadow-[0_5px_0_var(--accent-strong)] transition-all active:translate-y-1 active:shadow-[0_1px_0_var(--accent-strong)] disabled:cursor-not-allowed disabled:border-border disabled:text-subtle disabled:shadow-[0_5px_0_var(--border-strong)]"
        >
          <Plus size={26} strokeWidth={3.5} />
        </button>
      </div>
      <p className="mt-5 text-center text-xs font-bold text-subtle">
        مناسب برای بچه‌های {minimumAge} تا {maximumAge} سال
      </p>
    </div>
  );
}

function GradeSelect({ value, onChange }: GradeSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {gradeLabels.map((label, index) => {
        const grade = index + 1;
        const isSelected = value === grade;

        return (
          <button
            key={grade}
            type="button"
            onClick={() => onChange(grade)}
            aria-pressed={isSelected}
            className={`relative flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 px-3 py-4 font-black transition-all active:translate-y-1 ${
              isSelected
                ? 'translate-y-[-2px] border-info bg-info-soft text-info-soft-foreground shadow-[0_5px_0_var(--info)]'
                : 'border-border bg-surface text-muted shadow-[0_4px_0_var(--border)] hover:-translate-y-0.5 hover:border-info-soft'
            }`}
          >
            {isSelected && (
              <span className="absolute start-2 top-2 z-10 grid size-6 place-items-center rounded-full bg-info text-info-foreground">
                <Check size={15} strokeWidth={4} />
              </span>
            )}
            <Image
              src={gradeIcons[index]}
              alt=""
              width={96}
              height={104}
              className="mb-2 h-24 w-auto object-contain"
            />
            <span className="text-sm">کلاس {label}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatPill({
  icon,
  value,
  color,
}: {
  icon: ReactNode;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border-2 border-border bg-surface px-3 py-2 text-sm font-black text-muted shadow-sm">
      <span className={color}>{icon}</span>
      {value}
    </div>
  );
}

function Mascot({ step }: { step: number }) {
  const messages = [
    'سلام! آماده‌ای با هم پولدارِ باهوشی بشیم؟',
    'عالی پیش می‌ری! فقط یک قدم دیگه...',
    'انتخاب کن تا تمرین‌های مخصوصت آماده بشن!',
  ];

  return (
    <div className="relative mx-auto mb-6 flex max-w-md items-center justify-center gap-3 sm:gap-5">
      <div className="relative grid size-20 shrink-0 place-items-center rounded-[28px] bg-gradient-to-br from-warning to-accent text-4xl shadow-[0_7px_0_var(--warning-strong)] sm:size-24 sm:text-5xl">
        🪙
        <Star
          className="absolute -left-2 -top-2 fill-brand text-brand"
          size={24}
        />
      </div>
      <div className="relative rounded-2xl border-2 border-border bg-surface px-4 py-3 text-sm font-bold leading-7 text-muted shadow-sm sm:text-base">
        <span className="absolute -right-2 top-7 size-4 rotate-45 border-r-2 border-t-2 border-border bg-surface" />
        {messages[step]}
      </div>
    </div>
  );
}

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: minimumAge,
    grade: null,
  });
  const hearts = useGameStore((state) => state.hearts);
  const coins = useGameStore((state) => state.coins);

  const currentStepData = steps[currentStep];
  const CurrentIcon = currentStepData.icon;

  const isCurrentStepValid =
    currentStepData.id === 'name'
      ? formData.name.trim().length >= 2
      : currentStepData.id === 'age'
        ? formData.age !== null
        : formData.grade !== null;

  const handleNext = () => {
    if (!isCurrentStepValid) return;

    if (currentStep === steps.length - 1) {
      setIsComplete(true);
      return;
    }

    setCurrentStep((step) => step + 1);
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  if (isComplete) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 text-foreground"
        dir="rtl"
      >
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-info-soft" />
        <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-brand-soft" />
        <section className="relative w-full max-w-lg rounded-[32px] border-2 border-border bg-surface/90 p-7 text-center shadow-[0_24px_70px_rgba(42,60,90,0.14)] backdrop-blur sm:p-10">
          <div className="mx-auto mb-6 grid size-28 place-items-center rounded-full bg-gradient-to-br from-warning to-accent shadow-[0_8px_0_var(--warning-strong)]">
            <Trophy size={58} className="text-warning-foreground drop-shadow" strokeWidth={2.5} />
          </div>
          <div className="mb-3 flex items-center justify-center gap-2 text-brand">
            <PartyPopper size={22} />
            <span className="text-sm font-black">مرحله آشنایی کامل شد!</span>
          </div>
          <h1 className="mb-3 text-3xl font-black text-foreground sm:text-4xl">
            آفرین {formData.name.split(' ')[0]}!
          </h1>
          <p className="mx-auto mb-7 max-w-sm font-medium leading-8 text-muted">
            حساب تو آماده‌ست. وقتشه با بازی و جایزه، مدیریت پول رو یاد بگیری.
          </p>
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-success text-base font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)]"
          >
            بریم سراغ اولین مأموریت
            <ArrowLeft size={20} strokeWidth={3} />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -right-36 -top-36 size-96 rounded-full bg-info-soft" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-brand-soft" />
      <div className="pointer-events-none absolute left-[8%] top-[20%] hidden size-4 rotate-12 rounded bg-warning lg:block" />
      <div className="pointer-events-none absolute right-[10%] top-[48%] hidden size-5 rotate-45 rounded bg-accent/40 lg:block" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-success text-xl shadow-[0_4px_0_var(--success-strong)]">
            🪙
          </div>
          <div>
            <p className="text-xl font-black text-foreground">پولینو</p>
            <p className="text-[10px] font-bold text-subtle">قهرمان پول‌های من</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatPill
            icon={<Heart size={18} className="fill-current" />}
            value={String(hearts)}
            color="text-danger"
          />
          <StatPill
            icon={<Coins size={18} className="fill-current" />}
            value={String(coins)}
            color="text-warning-strong"
          />
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-xl flex-col px-4 pb-10 pt-2 sm:px-6 sm:pt-5">
        <div className="mb-6 flex items-center gap-3" dir="ltr">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="مرحله قبل"
              className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-foreground"
            >
              <ArrowLeft className="rotate-180" size={20} strokeWidth={3} />
            </button>
          ) : (
            <div className="size-10 shrink-0" />
          )}
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-l from-success to-success-hover transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="w-10 text-center text-xs font-black text-subtle">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        <Mascot step={currentStep} />

        <section className="rounded-[28px] border-2 border-border bg-surface/95 p-5 shadow-[0_18px_60px_rgba(38,61,89,0.12)] backdrop-blur sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div
              className={`grid size-12 shrink-0 place-items-center rounded-2xl shadow-md ${currentStepData.accent} ${currentStepData.accentForeground}`}
            >
              <CurrentIcon size={25} strokeWidth={2.6} />
            </div>
            <div>
              <p className="mb-1 text-xs font-black text-success-soft-foreground">
                مرحله {currentStep + 1} از {steps.length}
              </p>
              <h1 className="text-xl font-black leading-8 text-foreground sm:text-2xl">
                {currentStepData.title}
              </h1>
              <p className="mt-1 text-sm font-medium leading-6 text-muted">
                {currentStepData.subtitle}
              </p>
            </div>
          </div>

          <div className="min-h-44">
            {currentStepData.id === 'name' && (
              <NameInput
                value={formData.name}
                onChange={(name) => setFormData((data) => ({ ...data, name }))}
              />
            )}
            {currentStepData.id === 'age' && (
              <AgePicker
                value={formData.age}
                onChange={(age) =>
                  setFormData((data) => ({ ...data, age }))
                }
              />
            )}
            {currentStepData.id === 'grade' && (
              <GradeSelect
                value={formData.grade}
                onChange={(grade) =>
                  setFormData((data) => ({ ...data, grade }))
                }
              />
            )}
          </div>

          <div className="mt-7 border-t-2 border-dashed border-border pt-5">
            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-success text-base font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)] disabled:cursor-not-allowed disabled:bg-border disabled:text-subtle disabled:shadow-[0_6px_0_var(--border-strong)]"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  شروع ماجراجویی
                  <Sparkles size={20} />
                </>
              ) : (
                <>
                  ادامه می‌دم
                  <ArrowRight className="rotate-180" size={20} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </section>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-bold text-subtle">
          <Star size={14} className="fill-warning text-warning" />
          با کامل کردن پروفایلت ۲۰ سکه جایزه می‌گیری
        </p>
      </div>
    </main>
  );
}
