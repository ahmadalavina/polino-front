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
      <div className="relative mb-6 grid size-28 place-items-center rounded-full bg-gradient-to-br from-[#ffe66b] to-[#ffad3d] text-white shadow-[0_8px_0_#e89529]">
        <Trophy size={58} strokeWidth={2.5} />
        <Sparkles className="absolute -end-2 top-0 text-[#7c5cff]" size={27} />
      </div>

      <h2 className="mb-2 text-2xl font-black text-slate-800">آفرین قهرمان!</h2>
      <p className="mb-6 max-w-md text-sm font-bold leading-7 text-slate-500 sm:text-base">
        {payload.message ?? 'جایزه این مرحله رو با موفقیت گرفتی.'}
      </p>

      <div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-3">
        <div className="rounded-[22px] bg-[#f1edff] p-4 text-[#6748df]">
          <Sparkles className="mx-auto mb-2" size={25} />
          <p className="text-2xl font-black">+{payload.xp}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">امتیاز تجربه</p>
        </div>
        <div className="rounded-[22px] bg-[#fff7d6] p-4 text-[#c78300]">
          <Coins className="mx-auto mb-2 fill-current text-amber-400" size={25} />
          <p className="text-2xl font-black">+{payload.coins}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">سکه پولینو</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#58cc59] text-base font-black text-white shadow-[0_6px_0_#3da83e] transition-all hover:bg-[#61d562] active:translate-y-1 active:shadow-[0_2px_0_#3da83e]"
      >
        دریافت جایزه و ادامه
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
