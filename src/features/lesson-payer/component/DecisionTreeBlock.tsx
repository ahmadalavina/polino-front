'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, ArrowLeft } from 'lucide-react';
import type { DecisionTreePayload } from '@/types/lesson';

type Props = {
  payload: DecisionTreePayload;
  onNext: (isCorrect: boolean) => void;
};

export default function DecisionTreeBlock({ payload, onNext }: Props) {
  const [orderedSteps, setOrderedSteps] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const allSteps = useMemo(() => payload.steps, [payload.steps]);
  const usedSteps = useMemo(() => orderedSteps, [orderedSteps]);
  const availableSteps = useMemo(
    () => allSteps.filter((step) => !usedSteps.includes(step.id)),
    [allSteps, usedSteps]
  );

  const isComplete = orderedSteps.length === allSteps.length;

  const correctOrder = payload.correctOrder.steps;
  const isCorrectOrder = useMemo(() => {
    if (orderedSteps.length !== correctOrder.length) return false;
    return orderedSteps.every((step, index) => step === correctOrder[index]);
  }, [orderedSteps, correctOrder]);

  function handleAddStep(stepId: string) {
    if (isChecking || orderedSteps.includes(stepId)) return;
    setOrderedSteps((prev) => [...prev, stepId]);
  }

  function handleRemoveStep(stepId: string) {
    if (isChecking) return;
    setOrderedSteps((prev) => prev.filter((id) => id !== stepId));
  }

  function handleCheck() {
    if (!isComplete || isChecking) return;
    setIsChecking(true);
    setResult(isCorrectOrder ? 'correct' : 'wrong');
  }

  function handleReset() {
    setOrderedSteps([]);
    setIsChecking(false);
    setResult('idle');
  }

  const stepsById = useMemo(() => {
    const map = new Map<string, typeof allSteps[0]>();
    allSteps.forEach((step) => map.set(step.id, step));
    return map;
  }, [allSteps]);

  return (
    <div className="relative flex min-h-[500px] flex-col overflow-hidden p-5 sm:p-8" dir="rtl">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-violet-50/50" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-amber-50/50" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-600">

            </div>
            <h2 className="text-2xl font-black text-slate-800">ترتیب درست رو بچین!</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              ترتیب رو بدرستی بچین تا جایزه بگیری
            </p>
          </div>
        </header>

        <div className="mb-6 flex-1 overflow-hidden">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-slate-600">
                <ArrowLeft size={16} />
                گزینه‌های موجود
              </h3>
              {availableSteps.map((step, index) => (
                <motion.button
                  key={step.id}
                  type="button"
                  onClick={() => handleAddStep(step.id)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(124, 92, 255, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 text-start transition-all hover:border-violet-300 hover:shadow-[0_4px_0_#d7ccff]"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{step.question}</p>
                    <p className="mt-0.5 text-xs text-slate-400">کلیک کن و به پایین اضافه کن</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-amber-600">
                <Sparkles size={16} />
                ترتیب تصمیمات
              </h3>
              <div className="min-h-[200px] space-y-3 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-3">
                <AnimatePresence mode="popLayout">
                  {orderedSteps.map((stepId, index) => {
                    const step = stepsById.get(stepId);
                    if (!step) return null;
                    return (
                      <motion.div
                        key={stepId}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="flex items-center justify-between rounded-xl border-2 border-amber-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-sm font-black text-amber-600">
                            {index + 1}
                          </div>
                          <p className="text-sm font-bold text-slate-700">{step.question}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(stepId)}
                          disabled={isChecking}
                          className="grid size-8 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-500 transition-all hover:bg-rose-100 disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {orderedSteps.length === 0 && (
                  <div className="flex min-h-[200px] items-center justify-center text-center">
                    <p className="text-sm font-medium text-slate-400">
                      از سمت راست، گزینه‌ها رو به اینجا بکش
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border-2 border-slate-100 bg-white p-4">
          <div className="flex items-center gap-4">
            <div className="text-sm font-black text-slate-500">
              <span className="text-amber-600">{orderedSteps.length}</span> از{' '}
              <span className="text-slate-700">{allSteps.length}</span> مرحله
            </div>
          </div>
          <div className="flex items-center gap-3">
            {result === 'correct' && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-600">
                <Check size={16} />
                عالی بود!
              </div>
            )}
            {result === 'wrong' && (
              <div className="flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-black text-rose-600">
                <X size={16} />
                دوباره تلاش کن
              </div>
            )}
            {!isComplete ? (
              <div className="text-sm font-medium text-slate-400">
                همه مراحل رو اضافه کن
              </div>
            ) : result === 'idle' ? (
              <button
                type="button"
                onClick={handleCheck}
                className="flex items-center gap-2 rounded-2xl bg-[#58cc59] px-6 py-3 text-sm font-black text-white shadow-[0_5px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e]"
              >
                <Check size={18} />
                بررسی ترتیب
              </button>
            ) : result === 'correct' ? (
              <button
                type="button"
                onClick={() => onNext(true)}
                className="flex items-center gap-2 rounded-2xl bg-[#58cc59] px-6 py-3 text-sm font-black text-white shadow-[0_5px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e]"
              >
                <ArrowLeft size={18} />
                ادامه
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-600 shadow-[0_4px_0_#e2e8f0] transition-all hover:bg-slate-50 active:translate-y-1 active:shadow-none"
              >
                <ArrowLeft size={18} />
                شروع مجدد
              </button>
            )}
          </div>
        </div>

        {result === 'wrong' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"
          >
            <p className="mb-2 text-sm font-black text-amber-700">
              ⚠️ ترتیب درست نیست!
            </p>
            <p className="text-xs font-medium text-amber-600">
              مسیر را پاک کن و بلوک‌های تصمیم را دوباره به ترتیب درست بچین.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
