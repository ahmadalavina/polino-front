// src/app/lesson/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LessonData } from '@/types/lesson';
import LessonPlayer from '../../../features/lesson-payer/component/LessonPlayer';
import { useParams } from 'next/navigation';

export default function LessonPage() {
  
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    api.getLessonPlay(lessonId)
      .then(x=>{
        setLesson(x.data)
      })
      .catch(() => setError(true));
  }, [lessonId]);
  console.log("this is lesson",lesson)
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" dir="rtl">
      <span className="text-5xl">😕</span>
      <p className="text-xl text-gray-600">مشکلی پیش اومد!</p>
      <button onClick={() => router.back()} className="bg-blue-400 text-white py-3 px-8 rounded-full">
        برگشت
      </button>
    </div>
  );

  if (!lesson) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-6xl animate-spin">⭐</div>
    </div>
  );

  return <LessonPlayer lesson={lesson} onFinish={() => router.push('/')} />;
}
