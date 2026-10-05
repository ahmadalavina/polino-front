'use client';

import { ArrowLeft, Coins, Sparkles, Trophy } from 'lucide-react';
import type { RewardPayload } from '@/types/lesson';

interface Props {
  payload: RewardPayload;
  onNext: () => void;
}

export default function RewardBlock({ payload, onNext }: Props) {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center p-5 text-center sm:p-8">
      <div className="relative mb-6 grid size-28 place-items-center rounded-full bg-gradient-to-br from-warning-soft to-warning text-warning-foreground shadow-[0_8px_0_var(--warning-strong)]">
        <Trophy size={58} strokeWidth={2.5} />
        <Sparkles className="absolute -end-2 top-0 text-brand" size={27} />
      </div>

      <h2 className="mb-2 text-2xl font-black text-foreground">آفرین قهرمان!</h2>
      <p className="mb-6 max-w-md text-sm font-bold leading-7 text-muted sm:text-base">
        {payload.message ?? 'جایزه این مرحله رو با موفقیت گرفتی.'}
      </p>

      <div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-brand-soft p-4 text-brand-soft-foreground">
          <Sparkles className="mx-auto mb-2" size={25} />
          <p className="text-2xl font-black">+{payload.xp}</p>
          <p className="mt-1 text-xs font-bold text-muted">امتیاز تجربه</p>
        </div>
        <div className="rounded-[22px] bg-warning-soft p-4 text-warning-soft-foreground">
          <Coins className="mx-auto mb-2 fill-current text-warning-strong" size={25} />
          <p className="text-2xl font-black">+{payload.coins}</p>
          <p className="mt-1 text-xs font-bold text-muted">سکه پولینو</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-success text-base font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)]"
      >
        دریافت جایزه و ادامه
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
