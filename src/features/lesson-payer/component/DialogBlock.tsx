'use client';

import { ArrowLeft, MessageCircle } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import type { DialogPayload } from '@/types/lesson';

interface Props {
  payload: DialogPayload;
  onNext: () => void;
}

const characterEmoji: Record<string, string> = {
  fox: '🦊',
  owl: '🦉',
  bear: '🐻',
  default: '🧑‍🏫',
};

export default function DialogBlock({ payload, onNext }: Props) {
  const avatarUrl = resolveMediaUrl(payload.avatarUrl);
  const avatar =
    characterEmoji[payload.character.toLocaleLowerCase()] ??
    characterEmoji.default;

  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center p-5 sm:p-8">
      <div className="mb-6 flex items-end justify-center gap-4 sm:gap-6">
        <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-[30px] bg-gradient-to-br from-warning to-accent text-6xl shadow-[0_7px_0_var(--warning-strong)] sm:size-28">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={payload.character}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            avatar
          )}
          <span className="absolute bottom-2 end-2 grid size-7 place-items-center rounded-full bg-surface text-brand shadow">
            <MessageCircle size={15} className="fill-current" />
          </span>
        </div>
      </div>

      <div className="relative mb-7 w-full max-w-lg rounded-[24px] border-2 border-warning-soft bg-warning-soft p-5 shadow-[0_5px_0_var(--warning-soft)] sm:p-6">
        <span className="absolute -top-3 start-12 size-6 rotate-45 border-s-2 border-t-2 border-warning-soft bg-warning-soft" />
        <p className="text-base font-bold leading-8 text-foreground sm:text-lg sm:leading-9">
          {payload.text}
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-success text-base font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all hover:bg-success-hover active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)]"
      >
        ادامه داستان
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
