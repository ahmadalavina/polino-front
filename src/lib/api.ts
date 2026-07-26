// src/lib/api.ts

import { LessonData } from "../types/lesson";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Accept-Language': 'fa',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  });
  console.log("this is get course",res.ok)
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

export const api = {
  getLessonPlay: (id: number) => get<LessonData>(`/game/lessons/${id}/play`),
  getCourse: (id: number) => get<LessonData>(`/courses/${id}`),
  getCourses:()=>get('/courses')
};


