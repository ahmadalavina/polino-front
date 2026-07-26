// src/features/lesson-player/components/DialogBlock.tsx
'use client';

import { DialogPayload } from '@/types/lesson';

interface Props {
  payload: DialogPayload;
  onNext: () => void;
}

const CHARACTER_EMOJI: Record<string, string> = {
  fox: '🦊',
  owl: '🦉',
  bear: '🐻',
  default: '🧑‍🏫',
};

export default function DialogBlock({ payload, onNext }: Props) {
  const avatar = CHARACTER_EMOJI[payload.character] ?? CHARACTER_EMOJI.default;

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-[60vh] justify-center">
      <div className="text-8xl animate-bounce">{avatar}</div>

      <div className="relative bg-white rounded-3xl shadow-lg p-6 max-w-sm w-full border-4 border-yellow-300">
        <div className="absolute -top-3 right-8 w-6 h-6 bg-white border-l-4 border-t-4 border-yellow-300 rotate-45" />
        <p className="text-xl text-gray-700 leading-relaxed text-right font-medium">
          {payload.text}
        </p>
      </div>

      <button
        onClick={onNext}
        className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-10 rounded-full text-xl shadow-md active:scale-95 transition-transform"
      >
        بعدی ➡️
      </button>
    </div>
  );
}
