'use client';

import { ArrowLeft, BookOpenText, Sparkles } from 'lucide-react';
import type { StoryPayload } from '@/types/lesson';

interface Props {
  payload: StoryPayload;
  onNext: () => void;
}

export default function StoryBlock({ payload, onNext }: Props) {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center p-5 sm:p-8">
      <div className="mb-5 grid size-20 place-items-center rounded-[24px] bg-[#fff1dc] text-[#f08a32] shadow-[0_6px_0_#f4c68e]">
        <BookOpenText size={38} strokeWidth={2.5} />
      </div>

      <article className="relative mb-7 w-full max-w-lg overflow-hidden rounded-[26px] border-2 border-[#eadfff] bg-gradient-to-b from-[#fbf9ff] to-white px-5 py-6 shadow-[0_6px_0_#d8c9f8] sm:px-8">
        <Sparkles className="absolute end-5 top-5 text-[#b9a4ff]" size={22} />
        {payload.title && (
          <h2 className="mb-4 pe-8 text-xl font-black text-[#6748df] sm:text-2xl">
            {payload.title}
          </h2>
        )}
        <p className="whitespace-pre-line text-base font-bold leading-9 text-slate-700 sm:text-lg sm:leading-10">
          {payload.text}
        </p>
      </article>

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#7c5cff] text-base font-black text-white shadow-[0_6px_0_#6245dc] transition-all hover:bg-[#8769ff] active:translate-y-1 active:shadow-[0_2px_0_#6245dc]"
      >
        ادامه داستان
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
