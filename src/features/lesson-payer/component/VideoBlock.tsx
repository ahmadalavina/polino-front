'use client';

import { ArrowLeft, Film } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import type { MediaPayload } from '@/types/lesson';

interface Props {
  payload: MediaPayload;
  onNext: () => void;
}

export default function VideoBlock({ payload, onNext }: Props) {
  const videoUrl = resolveMediaUrl(payload.url);

  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center p-5 sm:p-8">
      <div className="relative mb-5 flex aspect-video w-full max-w-xl items-center justify-center overflow-hidden rounded-[26px] border-4 border-[#cdece8] bg-[#effcf9] shadow-[0_7px_0_#9ed9d0]">
        <Film className="text-[#16a394]/30" size={58} />
        {videoUrl && (
          <video
            className="absolute inset-0 h-full w-full bg-slate-900 object-contain"
            controls
            playsInline
            preload="metadata"
            src={videoUrl}
          >
            مرورگر شما پخش ویدیو را پشتیبانی نمی‌کند.
          </video>
        )}
      </div>

      {payload.caption && (
        <p className="mb-7 max-w-lg text-center text-sm font-bold leading-7 text-slate-600 sm:text-base">
          {payload.caption}
        </p>
      )}

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#16a394] text-base font-black text-white shadow-[0_6px_0_#087d72] transition-all hover:bg-[#1aaf9f] active:translate-y-1 active:shadow-[0_2px_0_#087d72]"
      >
        ادامه درس
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
