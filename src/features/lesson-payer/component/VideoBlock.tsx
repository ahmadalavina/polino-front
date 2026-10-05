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
      <div className="relative mb-5 flex aspect-video w-full max-w-xl items-center justify-center overflow-hidden rounded-[26px] border-4 border-info-soft bg-info-soft shadow-[0_7px_0_var(--info-soft)]">
        <Film className="text-info/30" size={58} />
        {videoUrl && (
          <video
            className="absolute inset-0 h-full w-full bg-media-backdrop object-contain"
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
        <p className="mb-7 max-w-lg text-center text-sm font-bold leading-7 text-muted sm:text-base">
          {payload.caption}
        </p>
      )}

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-info text-base font-black text-info-foreground shadow-[0_6px_0_var(--info-soft-foreground)] transition-all hover:bg-info-hover active:translate-y-1 active:shadow-[0_2px_0_var(--info-soft-foreground)]"
      >
        ادامه درس
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
