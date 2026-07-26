"use client";

import { motion } from 'framer-motion';
import LessonNode from './LessonNode';
import type { Lesson } from '@/types/lesson';

interface Props {
  lessons: Lesson[];
  courseTitle: string;
}

export default function LessonTree({ lessons, courseTitle }: Props) {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-200 flex flex-col items-center py-8 px-4" dir="rtl">
      <motion.h1
        className="text-2xl font-extrabold text-white drop-shadow mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🏙️ {courseTitle}
      </motion.h1>

      <div className="flex flex-col items-center gap-0 w-full max-w-xs">
        {sorted.map((lesson, i) => (
          <div key={lesson.id} className="flex flex-col items-center w-full">
            <LessonNode lesson={lesson} index={i} />
            {i < sorted.length - 1 && (
              <motion.div
                className="w-1 bg-yellow-400 rounded"
                initial={{ height: 0 }}
                animate={{ height: 32 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
