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
    accent: 'bg-[#7c5cff]',
  },
  {
    id: 'age',
    title: 'چند سالته؟',
    subtitle: 'سنت رو انتخاب کن تا تجربه‌ای مخصوص خودت بسازیم.',
    icon: CakeSlice,
    accent: 'bg-[#ff8a55]',
  },
  {
    id: 'grade',
    title: 'کلاس چندمی هستی؟',
    subtitle: 'تا تمرین‌ها و جایزه‌های مناسب خودت رو ببینی.',
    icon: GraduationCap,
    accent: 'bg-[#16b8a6]',
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
      <span className="mb-3 block text-sm font-bold text-slate-600">
        نام و نام خانوادگی
      </span>
      <div className="group relative">
        <UserRound
          aria-hidden="true"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#7c5cff]"
          size={22}
        />
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="مثلاً آوا محمدی"
          className="h-16 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pr-12 pl-4 text-lg font-bold text-slate-800 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-[#7c5cff] focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,92,255,0.12)]"
        />
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400">
        <Sparkles size={14} className="text-amber-400" />
        هر اسمی که دوست داری وارد کن
      </p>
    </label>
  );
}

function AgePicker({ value, onChange }: AgePickerProps) {
  const selectedAge = value ?? minimumAge;

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-4 text-center text-sm font-bold text-slate-500">
        سن خودت را با دکمه‌ها انتخاب کن
      </p>
      <div className="flex items-center justify-center gap-5" dir="ltr">
        <button
          type="button"
          onClick={() => onChange(Math.max(minimumAge, selectedAge - 1))}
          disabled={selectedAge <= minimumAge}
          aria-label="کم کردن سن"
          className="grid size-14 place-items-center rounded-2xl border-2 border-[#ff8a55] bg-white text-[#ff8a55] shadow-[0_5px_0_#e56f3d] transition-all active:translate-y-1 active:shadow-[0_1px_0_#e56f3d] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:shadow-[0_5px_0_#cbd5e1]"
        >
          <Minus size={26} strokeWidth={3.5} />
        </button>
        <div
          className="grid size-28 place-items-center rounded-[32px] border-4 border-[#ffb08b] bg-[#fff4ee] text-center shadow-[0_7px_0_#ff8a55]"
          aria-live="polite"
        >
          <span>
            <span className="block text-4xl font-black text-[#e76531]">
              {selectedAge}
            </span>
            <span className="mt-1 block text-sm font-black text-[#a94d2a]">
              سال
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(maximumAge, selectedAge + 1))}
          disabled={selectedAge >= maximumAge}
          aria-label="زیاد کردن سن"
          className="grid size-14 place-items-center rounded-2xl border-2 border-[#ff8a55] bg-white text-[#ff8a55] shadow-[0_5px_0_#e56f3d] transition-all active:translate-y-1 active:shadow-[0_1px_0_#e56f3d] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:shadow-[0_5px_0_#cbd5e1]"
        >
          <Plus size={26} strokeWidth={3.5} />
        </button>
      </div>
      <p className="mt-5 text-center text-xs font-bold text-slate-400">
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
                ? 'translate-y-[-2px] border-[#16b8a6] bg-[#eafffb] text-[#087d72] shadow-[0_5px_0_#16b8a6]'
                : 'border-slate-200 bg-white text-slate-600 shadow-[0_4px_0_#e2e8f0] hover:-translate-y-0.5 hover:border-[#72d9cd]'
            }`}
          >
            {isSelected && (
              <span className="absolute start-2 top-2 z-10 grid size-6 place-items-center rounded-full bg-[#16b8a6] text-white">
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
    <div className="flex items-center gap-1.5 rounded-full border-2 border-slate-100 bg-white px-3 py-2 text-sm font-black text-slate-600 shadow-sm">
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
      <div className="relative grid size-20 shrink-0 place-items-center rounded-[28px] bg-gradient-to-br from-[#ffd94a] to-[#ffaf36] text-4xl shadow-[0_7px_0_#e99320] sm:size-24 sm:text-5xl">
        🪙
        <Star
          className="absolute -left-2 -top-2 fill-[#7c5cff] text-[#7c5cff]"
          size={24}
        />
      </div>
      <div className="relative rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-7 text-slate-600 shadow-sm sm:text-base">
        <span className="absolute -right-2 top-7 size-4 rotate-45 border-r-2 border-t-2 border-slate-200 bg-white" />
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
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5fbff] p-4 text-slate-800"
        dir="rtl"
      >
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-[#dff9f2]" />
        <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-[#eee9ff]" />
        <section className="relative w-full max-w-lg rounded-[32px] border-2 border-white bg-white/90 p-7 text-center shadow-[0_24px_70px_rgba(42,60,90,0.14)] backdrop-blur sm:p-10">
          <div className="mx-auto mb-6 grid size-28 place-items-center rounded-full bg-gradient-to-br from-[#ffe56b] to-[#ffb33f] shadow-[0_8px_0_#e89b2e]">
            <Trophy size={58} className="text-white drop-shadow" strokeWidth={2.5} />
          </div>
          <div className="mb-3 flex items-center justify-center gap-2 text-[#7c5cff]">
            <PartyPopper size={22} />
            <span className="text-sm font-black">مرحله آشنایی کامل شد!</span>
          </div>
          <h1 className="mb-3 text-3xl font-black text-slate-800 sm:text-4xl">
            آفرین {formData.name.split(' ')[0]}!
          </h1>
          <p className="mx-auto mb-7 max-w-sm font-medium leading-8 text-slate-500">
            حساب تو آماده‌ست. وقتشه با بازی و جایزه، مدیریت پول رو یاد بگیری.
          </p>
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e]"
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
      className="relative min-h-screen overflow-hidden bg-[#f5fbff] text-slate-800"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -right-36 -top-36 size-96 rounded-full bg-[#ddf8ef]" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-[#ece7ff]" />
      <div className="pointer-events-none absolute left-[8%] top-[20%] hidden size-4 rotate-12 rounded bg-amber-300 lg:block" />
      <div className="pointer-events-none absolute right-[10%] top-[48%] hidden size-5 rotate-45 rounded bg-[#ff8a55]/40 lg:block" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#58cc59] text-xl shadow-[0_4px_0_#3da83e]">
            🪙
          </div>
          <div>
            <p className="text-xl font-black text-slate-800">پولینو</p>
            <p className="text-[10px] font-bold text-slate-400">قهرمان پول‌های من</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatPill
            icon={<Heart size={18} className="fill-current" />}
            value="۵"
            color="text-rose-400"
          />
          <StatPill
            icon={<Coins size={18} className="fill-current" />}
            value="۰"
            color="text-amber-400"
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
              className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
            >
              <ArrowLeft className="rotate-180" size={20} strokeWidth={3} />
            </button>
          ) : (
            <div className="size-10 shrink-0" />
          )}
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#58cc59] to-[#8cdf58] transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="w-10 text-center text-xs font-black text-slate-400">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        <Mascot step={currentStep} />

        <section className="rounded-[28px] border-2 border-white bg-white/95 p-5 shadow-[0_18px_60px_rgba(38,61,89,0.12)] backdrop-blur sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div
              className={`grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-md ${currentStepData.accent}`}
            >
              <CurrentIcon size={25} strokeWidth={2.6} />
            </div>
            <div>
              <p className="mb-1 text-xs font-black text-[#58b759]">
                مرحله {currentStep + 1} از {steps.length}
              </p>
              <h1 className="text-xl font-black leading-8 text-slate-800 sm:text-2xl">
                {currentStepData.title}
              </h1>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
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

          <div className="mt-7 border-t-2 border-dashed border-slate-100 pt-5">
            <button
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-[0_6px_0_#cbd5e1]"
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

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-bold text-slate-400">
          <Star size={14} className="fill-amber-300 text-amber-300" />
          با کامل کردن پروفایلت ۲۰ سکه جایزه می‌گیری
        </p>
      </div>
    </main>
  );
}
