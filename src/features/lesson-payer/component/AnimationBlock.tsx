'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, Clapperboard, Sparkles } from 'lucide-react';
import lottie from 'lottie-web';
import { resolveMediaUrl } from '@/lib/media';
import type { MediaPayload } from '@/types/lesson';

interface Props {
  payload: MediaPayload;
  onNext: () => void;
}

const videoPattern = /\.(mp4|webm|ogg)(?:\?.*)?$/i;
const imagePattern = /\.(gif|webp|png|jpe?g|svg)(?:\?.*)?$/i;
const lottiePattern = /\.json(?:\?.*)?$/i;

export default function AnimationBlock({ payload, onNext }: Props) {
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const animationUrl = resolveMediaUrl(payload.url);
  const isVideo = videoPattern.test(animationUrl);
  const isImage = imagePattern.test(animationUrl);
  const isLottie = lottiePattern.test(animationUrl);

  useEffect(() => {
    if (!isLottie || !animationUrl || !lottieContainerRef.current) return;

    const animation = lottie.loadAnimation({
      container: lottieContainerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: animationUrl,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    return () => animation.destroy();
  }, [animationUrl, isLottie]);

  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center p-5 sm:p-8">
      <div className="relative mb-5 flex aspect-video w-full max-w-xl items-center justify-center overflow-hidden rounded-[26px] border-4 border-brand-soft bg-gradient-to-br from-brand-soft to-warning-soft shadow-[0_7px_0_var(--brand-soft)]">
        {isVideo && (
          <video
            className="absolute inset-0 h-full w-full object-contain"
            autoPlay
            loop
            muted
            playsInline
            src={animationUrl}
          />
        )}
        {isImage && (
          <img
            src={animationUrl}
            alt={payload.caption ?? 'انیمیشن آموزشی'}
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
        {isLottie && (
          <div
            ref={lottieContainerRef}
            className="absolute inset-0 h-full w-full"
            aria-label={payload.caption ?? 'انیمیشن آموزشی'}
          />
        )}
        {!isVideo && !isImage && !isLottie && (
          <div className="relative grid size-28 animate-bounce place-items-center rounded-full bg-surface/80 text-brand shadow-lg">
            <Clapperboard size={54} strokeWidth={2.3} />
            <Sparkles className="absolute -end-2 -top-2 text-warning-strong" size={28} />
          </div>
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
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-brand text-base font-black text-brand-foreground shadow-[0_6px_0_var(--brand-strong)] transition-all hover:bg-brand-hover active:translate-y-1 active:shadow-[0_2px_0_var(--brand-strong)]"
      >
        ادامه درس
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
