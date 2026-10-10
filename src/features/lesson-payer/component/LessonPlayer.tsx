'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Coins,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  DialogPayload,
  ImagePayload,
  LessonBlock,
  LessonData,
  LessonResult,
  MediaPayload,
  QuizPayload,
  RewardPayload,
  StoryPayload,
  DecisionTreePayload,
  BasketGamePayload,
  MemoryFinancialPayload,
  WordSearchPayload,
  AuctionPayload,
} from '@/types/lesson';
import { useGameStore } from '@/store/gameStore';
import AnimationBlock from './AnimationBlock';
import DecisionTreeBlock from './DecisionTreeBlock';
import BasketGame from './BasketGame';
import DialogBlock from './DialogBlock';
import DragDropBlock from './DragDropBlock';
import ImageBlock from './ImageBlock';
import QuizBlock from './QuizBlock';
import LessonResultScreen from './LessonResult';
import RewardBlock from './RewardBlock';
import StoryBlock from './StoryBlock';
import VideoBlock from './VideoBlock';
import { CoinHuntGame, MemoryFinancialGame } from './GameBlocks';
import WordSearchBlock from './WordSearchBlock';
import AuctionBlock from './AuctionBlock';

interface Props {
  lesson: LessonData;
  onExit?: () => void;
  onFinish?: () => void;
}

const blockLabels: Partial<Record<LessonBlock['type'], string>> = {
  dialog: 'گفت‌وگو',
  image: 'تصویر آموزشی',
  quiz: 'سؤال',
  story: 'داستان',
  reward: 'جایزه',
  animation: 'انیمیشن',
  video: 'ویدیو',
  drag_drop: 'بازی جورچین',
  decision_tree: 'درخت تصمیم',
  basket_game: 'بازی سبد',
  auction: 'بازی مزایده',
};

export default function LessonPlayer({ lesson, onExit, onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [activityResults, setActivityResults] = useState<
    Record<number, boolean>
  >({});
  const addXp = useGameStore((state) => state.addXp);
  const addCoins = useGameStore((state) => state.addCoins);

  const blocks = useMemo(() => {
    return lesson.blocks
      .map((block, originalIndex) => ({ block, originalIndex }))
      .sort(
        (first, second) =>
          (first.block.pageNumber ?? 1) - (second.block.pageNumber ?? 1) ||
          (first.block.sortOrder ?? first.originalIndex) -
          (second.block.sortOrder ?? second.originalIndex),
      )
      .map(({ block }) => block);
  }, [lesson.blocks]);

  const pages = useMemo(() => {
    const grouped = new Map<number, LessonBlock[]>();
    blocks.forEach((block) => {
      const page = block.pageNumber ?? 1;
      grouped.set(page, [...(grouped.get(page) ?? []), block]);
    });
    return [...grouped.entries()].map(([pageNumber, pageBlocks]) => ({ pageNumber, blocks: pageBlocks }));
  }, [blocks]);

  const rewards = useMemo(() => {
    const rewardBlocks = lesson.blocks.filter(
      (block) => block.type === 'reward',
    );

    if (rewardBlocks.length === 0) {
      return {
        xp: lesson.rewardXp ?? 0,
        coins: lesson.rewardCoins ?? 0,
      };
    }

    return rewardBlocks.reduce(
      (total, block) => {
        const payload = block.payload as RewardPayload;
        return {
          xp: total.xp + (payload.xp ?? 0),
          coins: total.coins + (payload.coins ?? 0),
        };
      },
      { xp: 0, coins: 0 },
    );
  }, [lesson.blocks, lesson.rewardCoins, lesson.rewardXp]);

  function handleNext() {
    if (currentIndex + 1 >= pages.length) {
      setDone(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function handlePrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function handleActivityNext(blockId: number, isCorrect: boolean) {
    setActivityResults((results) => ({ ...results, [blockId]: isCorrect }));
    handleNext();
  }

  function renderBlock(block: LessonBlock) {
    switch (block.type) {
      case 'dialog':
        return (
          <DialogBlock
            key={block.id}
            payload={block.payload as DialogPayload}
            onNext={handleNext}
          />
        );
      case 'image':
        return (
          <ImageBlock
            key={block.id}
            payload={block.payload as ImagePayload}
            onNext={handleNext}
          />
        );
      case 'quiz':
        return (
          <QuizBlock
            key={block.id}
            blockId={block.id}
            payload={block.payload as QuizPayload}
            onNext={handleNext}
          />
        );
      case 'story':
        return (
          <StoryBlock
            key={block.id}
            payload={block.payload as StoryPayload}
            onNext={handleNext}
          />
        );
      case 'reward':
        return (
          <RewardBlock
            key={block.id}
            payload={block.payload as RewardPayload}
            onNext={handleNext}
          />
        );
      case 'animation':
        return (
          <AnimationBlock
            key={block.id}
            payload={block.payload as MediaPayload}
            onNext={handleNext}
          />
        );
      case 'video':
        return (
          <VideoBlock
            key={block.id}
            payload={block.payload as MediaPayload}
            onNext={handleNext}
          />
        );
      case 'drag_drop':
        return (
          <DragDropBlock
            key={block.id}
            blockId={block.id}
            payload={block.payload}
            onNext={handleNext}
          />
        );
      case 'coin_hunt':
        return (
          <CoinHuntGame
            key={block.id}
            blockId={block.id}
            payload={block.payload as unknown as Record<string, unknown>}
            onNext={handleNext}
          />
        );
      case 'memory_financial':
        return (
          <MemoryFinancialGame
            key={block.id}
            blockId={block.id}
            payload={block.payload as MemoryFinancialPayload}
            onNext={handleNext}
          />
        );
      case 'decision_tree':
        return (
          <DecisionTreeBlock
            key={block.id}
            blockId={block.id}
            payload={block.payload as DecisionTreePayload}
            onNext={handleNext}
          />
        );
      case 'basket_game':
        return (
          <BasketGame
            key={block.id}
            blockId={block.id}
            payload={block.payload as BasketGamePayload}
            onNext={handleNext}
          />
        );
      case 'word_search':
        return (
          <WordSearchBlock
            key={block.id}
            blockId={block.id}
            payload={block.payload as WordSearchPayload}
            onNext={handleNext}
          />
        );
      case 'auction':
        return (
          <AuctionBlock

            key={block.id}
            blockId={block.id}
            payload={block.payload as AuctionPayload}
            onNext={handleNext}
          />
        );
      default:
        return (
          <div className="flex min-h-[430px] flex-col items-center justify-center px-5 py-10 text-center">
            <div className="mb-5 grid size-20 place-items-center rounded-[24px] bg-brand-soft text-brand">
              <BookOpen size={38} />
            </div>
            <h2 className="mb-2 text-xl font-black text-foreground">
              بخش بعدی آماده‌ست
            </h2>
            <p className="mb-7 text-sm font-medium text-muted">
              برای ادامه ماجراجویی روی دکمه بزن.
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-success font-black text-success-foreground shadow-[0_6px_0_var(--success-strong)] transition-all active:translate-y-1 active:shadow-[0_2px_0_var(--success-strong)]"
            >
              ادامه
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
          </div>
        );
    }
  }

  if (done) {
    const answers = Object.values(activityResults);
    const result: LessonResult = {
      xpEarned: rewards.xp,
      coinsEarned: rewards.coins,
      correctAnswers: answers.filter(Boolean).length,
      totalQuestions: answers.length,
    };

    addXp(result.xpEarned);
    addCoins(result.coinsEarned);

    return (
      <LessonResultScreen
        result={result}
        lessonTitle={lesson.title}
        onContinue={onFinish ?? (() => {})}
      />
    );
  }

  if (blocks.length === 0) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-background p-4"
        dir="rtl"
      >
        <section className="w-full max-w-md rounded-[30px] border-2 border-border bg-surface p-8 text-center shadow-[0_20px_65px_rgba(38,61,89,0.12)]">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-[24px] bg-warning-soft text-warning-strong">
            <BookOpen size={38} />
          </div>
          <h1 className="mb-2 text-xl font-black text-foreground">
            محتوای درس آماده نیست
          </h1>
          <p className="mb-6 text-sm font-medium text-muted">
            به‌زودی این درس پر از داستان و بازی می‌شه.
          </p>
          <button
            type="button"
            onClick={onFinish}
            className="h-13 w-full rounded-2xl bg-brand font-black text-brand-foreground shadow-[0_5px_0_var(--brand-strong)] transition-all active:translate-y-1 active:shadow-none"
          >
            برگشت به مسیر
          </button>
        </section>
      </main>
    );
  }

  const currentPage = pages[currentIndex];
  const currentBlock = currentPage?.blocks[0] ?? blocks[0];
  const progress = ((currentIndex + 1) / pages.length) * 100;

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-background text-foreground"
      dir="rtl"
    >
      <div className="pointer-events-none absolute -start-36 -top-36 size-96 rounded-full bg-info-soft" />
      <div className="pointer-events-none absolute -bottom-48 -end-32 size-[30rem] rounded-full bg-brand-soft" />
      <div className="pointer-events-none absolute end-[8%] top-[38%] hidden size-5 rotate-45 rounded bg-accent/35 lg:block" />

      <header className="relative mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
        <button
          type="button"
          onClick={onExit}
          aria-label="خروج از درس"
          className="grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-border bg-surface text-muted shadow-[0_3px_0_var(--border)] transition-all hover:text-foreground active:translate-y-1 active:shadow-none"
        >
          <X size={21} strokeWidth={3} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-black text-foreground sm:text-base">
            {lesson.title}
          </p>
          <p className="mt-0.5 text-[11px] font-bold text-subtle">
            {blockLabels[currentBlock.type] ?? 'مرحله آموزشی'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border-2 border-border bg-surface px-3 py-2 text-xs font-black text-brand shadow-sm sm:flex">
            <Sparkles size={16} />
            {rewards.xp}
          </div>
          <div className="flex items-center gap-1.5 rounded-full border-2 border-border bg-surface px-3 py-2 text-xs font-black text-warning-strong shadow-sm">
            <Coins size={16} className="fill-current text-warning-strong" />
            {rewards.coins}
          </div>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
        <div className="mb-5 rounded-2xl border-2 border-border bg-surface/90 p-3 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-xs font-black">
            <span className="text-success-soft-foreground">پیشرفت درس</span>
            <span className="text-subtle">
              {currentIndex + 1} از {blocks.length}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-gradient-to-l from-success to-success-hover transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-[30px] border-2 border-border bg-surface/95 shadow-[0_20px_65px_rgba(38,61,89,0.12)] backdrop-blur">
          {(pages[currentIndex]?.blocks ?? []).map((block, blockIndex, pageBlocks) => (
            <div key={block.id} className={blockIndex === pageBlocks.length - 1 ? undefined : '[&>div>button:last-child]:hidden'}>
              {renderBlock(block)}
            </div>
          ))}
          {currentIndex > 0 && (
            <div className="border-t-2 border-dashed border-border px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex h-12 items-center gap-2 rounded-2xl border-2 border-border bg-surface px-5 text-sm font-black text-muted shadow-[0_4px_0_var(--border)] transition-all hover:border-border-strong hover:text-foreground active:translate-y-1 active:shadow-none"
              >
                <ArrowRight size={18} strokeWidth={3} />
                بازگشت به مرحله قبل
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
