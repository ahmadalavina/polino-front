"use client";

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Lesson } from '@/types/lesson';
import { useRouter } from 'next/navigation';
// import { useRouter } from 'next/router';

const ICONS = ['🏠', '💰', '🏦', '🛒', '🎯', '⭐', '🌟', '🏆'];

interface Props {
  lesson: Lesson;
  index: number;
}

export default function LessonNode({ lesson, index }: Props) {
  const navigate = useRouter();
  const icon = ICONS[index % ICONS.length];
  const isRight = index % 2 === 0;

  return (
    <motion.div
      className={`flex items-center gap-3 ${isRight ? 'flex-row' : 'flex-row-reverse'}`}
      initial={{ opacity: 0, x: isRight ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
    >
      <motion.button
        onClick={() => navigate.push(`/lesson/${lesson.id}`)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-yellow-400 shadow-lg border-4 border-yellow-500 text-3xl cursor-pointer"
      >
        {icon}
      </motion.button>
      <div className="text-sm font-bold text-gray-700 max-w-[120px] text-center">
        {lesson.title}
      </div>
    </motion.div>
  );
}
