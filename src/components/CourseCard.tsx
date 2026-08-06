// src/components/CourseCard.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  title: string;
  description: string;
  cover: string;
  order: number;
}

const COVER_BASE_URL = process.env.NEXT_PUBLIC_ASSET_URL || 'http://localhost:3021';

export default function CourseCard({ course }: { course: Course }) {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => router.push(`/course/${course.id}`)}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group w-full overflow-hidden rounded-[28px] border-2 border-white bg-white text-start shadow-[0_12px_35px_rgba(42,60,90,0.1)] transition-colors hover:border-[#b9eee8]"
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff3c4] via-[#fff8dd] to-[#eafffb]">
        <BookOpen
          aria-hidden="true"
          className="text-[#ffb33f]/45"
          size={58}
          strokeWidth={2}
        />
        {course.cover && (
          <img
            src={`${COVER_BASE_URL}/${course.cover}`}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        )}
        <span className="absolute start-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-black text-[#e76531] shadow-sm backdrop-blur">
          دوره {course.order}
        </span>
        <span className="absolute bottom-3 end-3 grid size-10 place-items-center rounded-full bg-[#58cc59] text-white shadow-[0_4px_0_#3da83e]">
          <Play size={18} className="fill-current" />
        </span>
      </div>

      <div className="p-5" dir="rtl">
        <h3 className="mb-2 text-lg font-black leading-7 text-slate-800">
          {course.title}
        </h3>
        <p className="line-clamp-2 min-h-12 text-sm font-medium leading-6 text-slate-500">
          {course.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-slate-100 pt-4">
          <span className="text-sm font-black text-[#16a394]">شروع دوره</span>
          <span className="grid size-8 place-items-center rounded-xl bg-[#eafffb] text-[#16a394] transition-transform group-hover:-translate-x-1">
            <ArrowLeft size={18} strokeWidth={3} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
