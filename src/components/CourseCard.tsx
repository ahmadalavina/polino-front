// src/components/CourseCard.tsx
'use client';

import { motion } from 'framer-motion';
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
    <motion.div
      onClick={() => router.push(`/course/${course.id}`)}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="cursor-pointer bg-white rounded-3xl shadow-md overflow-hidden border-2 border-yellow-200 hover:border-yellow-400 transition-colors"
    >
      <div className="relative h-36 bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
        <img
          src={`${COVER_BASE_URL}/${course.cover}`}
          alt={course.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="absolute top-2 left-2 bg-white/80 text-xs font-bold px-2 py-1 rounded-full text-orange-600">
          درس {course.order}
        </span>
      </div>

      <div className="p-4 text-right" dir="rtl">
        <h3 className="text-lg font-extrabold text-gray-800 mb-1">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">
          {course.description}
        </p>
      </div>
    </motion.div>
  );
}
