// src/features/lesson-player/components/ImageBlock.tsx
'use client';

import Image from 'next/image';
import { ImagePayload } from '@/types/lesson';

interface Props {
  payload: ImagePayload;
  onNext: () => void;
}

export default function ImageBlock({ payload, onNext }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-[60vh] justify-center">
      <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-purple-300 w-full max-w-sm">
        <Image
          src={payload.url}
          alt={payload.caption ?? ''}
          width={400}
          height={300}
          className="w-full object-cover"
        />
      </div>

      {payload.caption && (
        <p className="text-lg text-gray-600 text-center font-medium">{payload.caption}</p>
      )}

      <button
        onClick={onNext}
        className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-full text-xl shadow-md active:scale-95 transition-transform"
      >
        فهمیدم! ✅
      </button>
    </div>
  );
}
