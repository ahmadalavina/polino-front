// src/lib/api.ts

import type { CourseDetail, LessonData } from '../types/lesson';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Accept-Language': 'fa',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

export const api = {
  getLessonPlay: (id: number) =>
    get<{ data: LessonData }>(`/game/lessons/${id}/play`),
  getCourse: (id: number | string) =>
    get<{ data: CourseDetail }>(`/courses/${id}`),
  getCourses: () => get('/courses'),
};


