'use client';

import { useMemo } from 'react';
import { ArrowLeft, BookOpenText, Sparkles } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media';
import { parseStoryPayload } from '@/features/story-block/storyContent';
import type { StoryContentAlign, StoryPayload } from '@/types/lesson';

interface Props {
  payload: StoryPayload;
  onNext: () => void;
}

const alignClass: Record<StoryContentAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

function StoryText({ value }: { value: string }) {
  return (
    <p className="whitespace-pre-line text-base font-bold leading-9 text-foreground sm:text-lg sm:leading-10">
      {value}
    </p>
  );
}

function StoryImage({
  url,
  alt,
  caption,
  width,
  align,
}: {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  align?: StoryContentAlign;
}) {
  const imageUrl = resolveMediaUrl(url);

  return (
    <figure
      className={`flex w-full flex-col ${alignClass[align ?? 'center']}`}
    >
      <div
        className="relative flex max-w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-brand-soft bg-brand-soft"
        style={width ? { width, maxWidth: '100%' } : undefined}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={alt ?? caption ?? 'تصویر داستان'}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 max-w-full text-center text-sm font-bold leading-7 text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function StoryBlock({ payload, onNext }: Props) {
  const story = useMemo(() => {
    const parsed = parseStoryPayload(payload);
    return parsed.success ? parsed.data : { title: undefined, content: [] };
  }, [payload]);

  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center p-5 sm:p-8">
      <div className="mb-5 grid size-20 place-items-center rounded-[24px] bg-warning-soft text-accent-soft-foreground shadow-[0_6px_0_var(--warning-soft)]">
        <BookOpenText size={38} strokeWidth={2.5} />
      </div>

      <article className="relative mb-7 w-full max-w-lg overflow-hidden rounded-[26px] border-2 border-brand-soft bg-gradient-to-b from-brand-soft to-surface px-5 py-6 shadow-[0_6px_0_var(--brand-soft)] sm:px-8">
        <Sparkles
          className="absolute end-5 top-5 text-brand-soft-foreground"
          size={22}
        />
        {story.title && (
          <h2 className="mb-4 pe-8 text-xl font-black text-brand-soft-foreground sm:text-2xl">
            {story.title}
          </h2>
        )}

        <div className="space-y-4">
          {story.content.map((item, index) =>
            item.type === 'image' ? (
              <StoryImage
                key={`image-${index}`}
                url={item.url}
                alt={item.alt}
                caption={item.caption}
                width={item.width}
                align={item.align}
              />
            ) : (
              <StoryText key={`text-${index}`} value={item.value} />
            ),
          )}
        </div>
      </article>

      <button
        type="button"
        onClick={onNext}
        className="flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-brand text-base font-black text-brand-foreground shadow-[0_6px_0_var(--brand-strong)] transition-all hover:bg-brand-hover active:translate-y-1 active:shadow-[0_2px_0_var(--brand-strong)]"
      >
        ادامه داستان
        <ArrowLeft size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
