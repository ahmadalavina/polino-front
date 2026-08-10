'use client';

import { ArrowLeft, ImageIcon } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import type { ImagePayload } from '@/types/lesson';

interface Props {
  payload: ImagePayload;
  onNext: () => void;
}

export default function ImageBlock({ payload, onNext }: Props) {
  const imageUrl = resolveMediaUrl(payload.url);

  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center p-5 sm:p-8">
      <div className="relative mb-5 flex min-h-64 w-full max-w-lg items-center justify-center overflow-hidden rounded-[26px] border-4 border-[#d9d0ff] bg-[#f7f5ff] shadow-[0_7px_0_#b9a8ff]">
        <ImageIcon
          aria-hidden="true"
          className="text-[#7c5cff]/30"
          size={58}
        />
        {imageUrl && (
          <img
            src={imageUrl}
            alt={payload.caption ?? 'تصویر درس'}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {payload.caption && (
        <div className="mb-7 w-full max-w-lg rounded-2xl bg-slate-50 px-5 py-4 text-center">
          <p className="text-sm font-bold leading-7 text-slate-600 sm:text-base">
            {payload.caption}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#7c5cff] text-base font-black text-white shadow-[0_6px_0_#6245dc] transition-all hover:bg-[#8769ff] active:translate-y-1 active:shadow-[0_2px_0_#6245dc]"
      >
        فهمیدم
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
