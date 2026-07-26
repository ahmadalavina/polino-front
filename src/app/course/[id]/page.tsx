"use client";

import { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
import LessonTree from '@/features/lesson-tree/LessonTree';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (id) api.getCourse(id).then(setCourse);
  }, [id]);

  if (!course) return <div className="flex justify-center items-center h-screen text-xl">⏳ در حال بارگذاری...</div>;

  return <LessonTree lessons={course.data.lessons} courseTitle={course.data.title} />;
}
