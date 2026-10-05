'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, ArrowLeft } from 'lucide-react';
import { api, type CompleteGameDto } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import type { DecisionTreePayload } from '@/types/lesson';

type Props = {
  blockId: number;
  payload: DecisionTreePayload;
  onNext: () => void;
};

export default function DecisionTreeBlock({ blockId, payload, onNext }: Props) {
  const [orderedSteps, setOrderedSteps] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [submitError, setSubmitError] = useState('');

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
    if (orderedSteps.includes(stepId)) return;
    setOrderedSteps((prev) => [...prev, stepId]);
  }

  function handleRemoveStep(stepId: string) {
    setOrderedSteps((prev) => prev.filter((id) => id !== stepId));
  }

  const handleCheck = useCallback(async () => {
    if (!isComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');
    const dto: CompleteGameDto = {
      //@ts-ignore
      gameType: 'decision_tree',
      decisionTreeMatches: orderedSteps,
      attempts: 1,
      mistakes: 0,
    };
    try {
      const response = await api.completeGame(blockId, dto);
      if (response.balance) {
        useGameStore.getState().setBalance(response.balance);
      }
      setResult(response.completed ? 'correct' : 'wrong');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'ثبت نتیجه ناموفق بود.');
      setResult('wrong');
    } finally {
      setIsSubmitting(false);
    }
  }, [isComplete, isSubmitting, orderedSteps, blockId]);

  const stepsById = useMemo(() => {
    const map = new Map<string, typeof allSteps[0]>();
    allSteps.forEach((step) => map.set(step.id, step));
    return map;
  }, [allSteps]);

  return (
    <div className="relative flex min-h-[500px] flex-col overflow-hidden p-5 sm:p-8" dir="rtl">
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-brand-soft/50" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-warning-soft/50" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">ترتیب درست رو بچین!</h2>
            <p className="mt-1 text-sm font-medium text-muted">
              ترتیب رو بدرستی بچین تا جایزه بگیری
            </p>
          </div>
        </header>

        <div className="mb-6 flex-1 overflow-hidden">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-muted">
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
                  className="flex items-start gap-3 rounded-2xl border-2 border-brand-soft bg-surface p-4 text-start transition-all hover:border-brand hover:shadow-[0_4px_0_var(--brand-soft)]"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-black text-brand-soft-foreground">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">{step.question}</p>
                    <p className="mt-0.5 text-xs text-subtle">کلیک کن و به پایین اضافه کن</p>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-black text-warning-soft-foreground">
                <Sparkles size={16} />
                ترتیب تصمیمات
              </h3>
              <div className="min-h-[200px] space-y-3 rounded-2xl border-2 border-dashed border-warning-soft bg-warning-soft/50 p-3">
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
                        className="flex items-center justify-between rounded-xl border-2 border-warning-soft bg-surface p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning-soft text-sm font-black text-warning-soft-foreground">
                            {index + 1}
                          </div>
                          <p className="text-sm font-bold text-foreground">{step.question}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(stepId)}
                          disabled={isSubmitting}
                          className="grid size-8 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger transition-all hover:bg-danger-soft disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {orderedSteps.length === 0 && (
                  <div className="flex min-h-[200px] items-center justify-center text-center">
                    <p className="text-sm font-medium text-subtle">
                      از سمت راست، گزینه‌ها رو به اینجا بکش
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 rounded-2xl border-2 border-border bg-surface p-4">
          <div className="flex items-center gap-4">
            <div className="text-sm font-black text-muted">
              <span className="text-warning-soft-foreground">{orderedSteps.length}</span> از{' '}
              <span className="text-foreground">{allSteps.length}</span> مرحله
            </div>
          </div>
          <div className="flex items-center gap-3">
            {result === 'correct' && (
              <div className="flex items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-black text-success-soft-foreground">
                <Check size={16} />
                عالی بود!
              </div>
            )}
            {result === 'wrong' && (
              <div className="flex items-center gap-2 rounded-full bg-danger-soft px-4 py-2 text-sm font-black text-danger-soft-foreground">
                <X size={16} />
                دوباره تلاش کن
              </div>
            )}
            {!isComplete ? (
              <div className="text-sm font-medium text-subtle">
                همه مراحل رو اضافه کن
              </div>
            ) : result === 'idle' ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-2xl bg-success px-6 py-3 text-sm font-black text-success-foreground shadow-[0_5px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)] disabled:cursor-wait disabled:bg-border-strong disabled:shadow-none"
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, repeatType: 'loop' }}>
                    <Check size={18} />
                  </motion.div>
                ) : (
                  <Check size={18} />
                )}
                {isSubmitting ? 'در حال ثبت...' : 'بررسی ترتیب'}
              </button>
            ) : result === 'correct' ? (
              <button
                type="button"
                onClick={onNext}
                className="flex items-center gap-2 rounded-2xl bg-success px-6 py-3 text-sm font-black text-success-foreground shadow-[0_5px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)]"
              >
                <ArrowLeft size={18} />
                ادامه
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOrderedSteps([]);
                  setResult('idle');
                  setSubmitError('');
                }}
                className="flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 text-sm font-black text-muted shadow-[0_4px_0_var(--border)] transition-all hover:bg-surface-muted active:translate-y-1 active:shadow-none"
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
            className="mt-4 rounded-2xl border-2 border-warning-soft bg-warning-soft p-4"
          >
            <p className="mb-2 text-sm font-black text-warning-soft-foreground">
              ⚠️ ترتیب درست نیست!
            </p>
            <p className="text-xs font-medium text-warning-soft-foreground">
              مسیر را پاک کن و بلوک‌های تصمیم را دوباره به ترتیب درست بچین.
            </p>
            {submitError && (
              <p className="mt-2 text-xs font-bold text-danger">{submitError}</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
