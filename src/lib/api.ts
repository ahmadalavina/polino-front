import type {
  AdminCourseOption,
  AdminLessonOption,
  CreateCourseInput,
  CreateLessonBlockInput,
  CreateLessonInput,
} from '@/types/admin';
import type { CourseDetail, LessonData } from '@/types/lesson';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function getAuthToken() {
  const storedToken =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return storedToken || process.env.NEXT_PUBLIC_MOCK_JWT || '';
}

function unwrapData<T>(response: unknown): T {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response
  ) {
    return (response as { data: T }).data;
  }

  return response as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Accept-Language', 'fa');
  headers.set('Authorization', `Bearer ${getAuthToken()}`);
  if (init?.body) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = `خطای API با کد ${response.status}`;
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;

    if (Array.isArray(errorBody?.message)) {
      message = errorBody.message.join('، ');
    } else if (errorBody?.message) {
      message = errorBody.message;
    }

    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function get<T>(path: string) {
  return request<T>(path);
}

function post<TPayload, TResponse>(path: string, payload: TPayload) {
  return request<TResponse>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const api = {
  getLessonPlay: async (id: number) => ({
    data: unwrapData<LessonData>(
      await get<LessonData | { data: LessonData }>(
        `/game/lessons/${id}/play`,
      ),
    ),
  }),
  getCourse: async (id: number | string) => ({
    data: unwrapData<CourseDetail>(
      await get<CourseDetail | { data: CourseDetail }>(`/courses/${id}`),
    ),
  }),
  getCourses: async () => ({
    data: unwrapData<AdminCourseOption[]>(
      await get<AdminCourseOption[] | { data: AdminCourseOption[] }>(
        '/courses',
      ),
    ),
  }),
  getLessons: async () => ({
    data: unwrapData<AdminLessonOption[]>(
      await get<AdminLessonOption[] | { data: AdminLessonOption[] }>(
        '/lessons',
      ),
    ),
  }),
  createCourse: (payload: CreateCourseInput) =>
    post<CreateCourseInput, unknown>('/courses', payload),
  createLesson: (payload: CreateLessonInput) =>
    post<CreateLessonInput, unknown>('/lessons', payload),
  createLessonBlock: (payload: CreateLessonBlockInput) =>
    post<CreateLessonBlockInput, unknown>('/lesson-blocks', payload),
};
