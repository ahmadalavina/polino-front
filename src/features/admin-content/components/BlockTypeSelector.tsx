import type { BlockType } from '@/types/lesson';

export const blockTypeLabels: Record<string, string> = {
  dialog: 'گفت‌وگو',
  image: 'تصویر',
  quiz: 'آزمون',
  story: 'داستان',
  reward: 'جایزه',
  animation: 'انیمیشن',
  video: 'ویدیو',
  drag_drop: 'کشیدن و رها کردن',
  drop_down: 'انتخاب گزینه',
  question_block: 'بلوک سوال',
  film_and_image: 'فیلم و تصویر',
  coin_hunt: 'شکار سکه',
  memory_financial: 'حافظه مالی',
  decision_tree: 'درخت تصمیم',
  basket_game: 'بازی سبد',
};

export function BlockTypeSelector({
  selectedType,
  onChange,
}: {
  selectedType: BlockType;
  onChange: (type: BlockType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Object.entries(blockTypeLabels).map(([type, label]) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type as BlockType)}
          className={`rounded-2xl border-2 px-3 py-3 text-xs font-black transition-all ${
            selectedType === type
              ? 'border-[#ff8a55] bg-[#fff0e9] text-[#d65f2f] shadow-[0_3px_0_#ff8a55]'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
