'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Coins,
  Landmark,
  PiggyBank,
  ShoppingBasket,
  Sparkles,
  Star,
  Target,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Lesson } from '@/types/lesson';

interface Props {
  lesson: Lesson;
  index: number;
}

type LessonTheme = {
  icon: LucideIcon;
  iconClassName: string;
  iconShadow: string;
  badgeClassName: string;
};

const lessonThemes: LessonTheme[] = [
  {
    icon: WalletCards,
    iconClassName: 'bg-brand text-brand-foreground',
    iconShadow: 'shadow-[0_6px_0_var(--brand-strong)]',
    badgeClassName: 'bg-brand-soft text-brand-soft-foreground',
  },
  {
    icon: PiggyBank,
    iconClassName: 'bg-accent text-accent-foreground',
    iconShadow: 'shadow-[0_6px_0_var(--accent-strong)]',
    badgeClassName: 'bg-accent-soft text-accent-soft-foreground',
  },
  {
    icon: Landmark,
    iconClassName: 'bg-info text-info-foreground',
    iconShadow: 'shadow-[0_6px_0_var(--info-strong)]',
    badgeClassName: 'bg-info-soft text-info-soft-foreground',
  },
  {
    icon: ShoppingBasket,
    iconClassName: 'bg-warning text-warning-foreground',
    iconShadow: 'shadow-[0_6px_0_var(--warning-strong)]',
    badgeClassName: 'bg-warning-soft text-warning-soft-foreground',
  },
  {
    icon: Target,
    iconClassName: 'bg-success text-success-foreground',
    iconShadow: 'shadow-[0_6px_0_var(--success-strong)]',
    badgeClassName: 'bg-success-soft text-success-soft-foreground',
  },
  {
    icon: Star,
    iconClassName: 'bg-pink text-pink-foreground',
    iconShadow: 'shadow-[0_6px_0_var(--pink-strong)]',
    badgeClassName: 'bg-pink-soft text-pink-soft-foreground',
  },
];

export default function LessonNode({ lesson, index }: Props) {
  const router = useRouter();
  const theme = lessonThemes[index % lessonThemes.length];
  const LessonIcon = theme.icon;
  const lessonNumber = lesson.order || index + 1;

  return (
    <motion.div
      className="relative z-10 flex items-center gap-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        type: 'spring',
        stiffness: 180,
        damping: 18,
      }}
    >
      <div
        className={`grid size-16 shrink-0 place-items-center rounded-[22px] ${theme.iconClassName} ${theme.iconShadow}`}
      >
        <LessonIcon size={30} strokeWidth={2.6} />
      </div>

      <motion.button
        type="button"
        onClick={() => router.push(`/lesson/${lesson.id}`)}
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ y: 2, scale: 0.99 }}
        className="group min-w-0 flex-1 rounded-[24px] border-2 border-border bg-surface p-4 text-start shadow-[0_8px_25px_rgba(42,60,90,0.1)] transition-colors hover:border-info-soft sm:p-5"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${theme.badgeClassName}`}
            >
              مرحله {lessonNumber}
            </span>
            <h3 className="text-base font-black leading-7 text-foreground sm:text-lg">
              {lesson.title}
            </h3>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-info-soft text-info transition-transform group-hover:-translate-x-1">
            <ArrowLeft size={19} strokeWidth={3} />
          </span>
        </div>

        {lesson.description && (
          <p className="mb-3 line-clamp-2 text-sm font-medium leading-6 text-muted">
            {lesson.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t-2 border-dashed border-border pt-3">
          <span className="flex items-center gap-1.5 text-xs font-black text-info">
            <Sparkles size={15} />
            شروع درس
          </span>
          {lesson.rewardXp !== undefined && (
            <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand-soft-foreground">
              <Sparkles size={13} />
              {lesson.rewardXp} امتیاز
            </span>
          )}
          {lesson.rewardCoins !== undefined && (
            <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-black text-warning-soft-foreground">
              <Coins size={13} className="fill-current text-warning-strong" />
              {lesson.rewardCoins} سکه
            </span>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}
