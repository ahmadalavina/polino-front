// src/app/course/page.tsx
'use client';

import { useEffect, useState } from 'react';
import CourseCard from '@/components/CourseCard';
import { api } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  description: string;
  cover: string;
  order: number;
}

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourses()
      .then((res) => setCourses(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        در حال بارگذاری کورس‌ها...
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🌟 دوره‌های آموزشی
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
