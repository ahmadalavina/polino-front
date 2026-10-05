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
  word_search: 'جدول کلمات',
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
              ? 'border-accent bg-accent-soft text-accent-soft-foreground shadow-[0_3px_0_var(--accent)]'
              : 'border-border bg-surface text-muted hover:border-border-strong'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
