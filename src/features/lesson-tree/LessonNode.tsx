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
    iconClassName: 'bg-[#7c5cff] text-white',
    iconShadow: 'shadow-[0_6px_0_#6245dc]',
    badgeClassName: 'bg-[#f1edff] text-[#6748df]',
  },
  {
    icon: PiggyBank,
    iconClassName: 'bg-[#ff8a55] text-white',
    iconShadow: 'shadow-[0_6px_0_#e56f3d]',
    badgeClassName: 'bg-[#fff0e9] text-[#d65f2f]',
  },
  {
    icon: Landmark,
    iconClassName: 'bg-[#16b8a6] text-white',
    iconShadow: 'shadow-[0_6px_0_#0c9082]',
    badgeClassName: 'bg-[#eafffb] text-[#087d72]',
  },
  {
    icon: ShoppingBasket,
    iconClassName: 'bg-[#ffbe3d] text-white',
    iconShadow: 'shadow-[0_6px_0_#d99a00]',
    badgeClassName: 'bg-[#fff7d6] text-[#a56b00]',
  },
  {
    icon: Target,
    iconClassName: 'bg-[#58cc59] text-white',
    iconShadow: 'shadow-[0_6px_0_#3da83e]',
    badgeClassName: 'bg-[#edffed] text-[#278f2b]',
  },
  {
    icon: Star,
    iconClassName: 'bg-[#ef6aa8] text-white',
    iconShadow: 'shadow-[0_6px_0_#ca4384]',
    badgeClassName: 'bg-[#fff0f7] text-[#b83d79]',
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
        className="group min-w-0 flex-1 rounded-[24px] border-2 border-white bg-white p-4 text-start shadow-[0_8px_25px_rgba(42,60,90,0.1)] transition-colors hover:border-[#b9eee8] sm:p-5"
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${theme.badgeClassName}`}
            >
              مرحله {lessonNumber}
            </span>
            <h3 className="text-base font-black leading-7 text-slate-800 sm:text-lg">
              {lesson.title}
            </h3>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#eafffb] text-[#16a394] transition-transform group-hover:-translate-x-1">
            <ArrowLeft size={19} strokeWidth={3} />
          </span>
        </div>

        {lesson.description && (
          <p className="mb-3 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
            {lesson.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t-2 border-dashed border-slate-100 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-black text-[#16a394]">
            <Sparkles size={15} />
            شروع درس
          </span>
          {lesson.rewardXp !== undefined && (
            <span className="flex items-center gap-1 rounded-full bg-[#f1edff] px-2.5 py-1 text-[11px] font-black text-[#6748df]">
              <Sparkles size={13} />
              {lesson.rewardXp} امتیاز
            </span>
          )}
          {lesson.rewardCoins !== undefined && (
            <span className="flex items-center gap-1 rounded-full bg-[#fff7d6] px-2.5 py-1 text-[11px] font-black text-[#a56b00]">
              <Coins size={13} className="fill-current text-amber-400" />
              {lesson.rewardCoins} سکه
            </span>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}
