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
      <div className="relative mb-5 flex min-h-64 w-full max-w-lg items-center justify-center overflow-hidden rounded-[26px] border-4 border-brand-soft bg-brand-soft shadow-[0_7px_0_var(--brand-soft-foreground)]">
        <ImageIcon
          aria-hidden="true"
          className="text-brand/30"
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
        <div className="mb-7 w-full max-w-lg rounded-2xl bg-surface-muted px-5 py-4 text-center">
          <p className="text-sm font-bold leading-7 text-muted sm:text-base">
            {payload.caption}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-brand text-base font-black text-brand-foreground shadow-[0_6px_0_var(--brand-strong)] transition-all hover:bg-brand-hover active:translate-y-1 active:shadow-[0_2px_0_var(--brand-strong)]"
      >
        فهمیدم
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
