import type {
  AdminCourseOption,
  AdminLessonOption,
  CreateCourseInput,
  CreateLessonBlockInput,
  CreateLessonInput,
} from '@/types/admin';
import type { CourseDetail, LessonData } from '@/types/lesson';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

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

async function request<T>(
  path: string,
  init?: RequestInit,
  authenticated = true,
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Accept-Language', 'fa');
  if (authenticated) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
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

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function get<T>(path: string) {
  return request<T>(path);
}

function post<TPayload, TResponse>(
  path: string,
  payload: TPayload,
  authenticated = true,
) {
  return request<TResponse>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, authenticated);
}

function patch<TPayload, TResponse>(path: string, payload: TPayload) {
  return request<TResponse>(path, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export type VerifyOtpResponse = {
  accessToken?: string;
  access_token?: string;
  token?: string;
  refreshToken?: string;
  refresh_token?: string;
  data?: VerifyOtpResponse;
};

export type UserProfile = {
  id?: number;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  birthDate?: string;
  grade?: number;
  avatarId?: number;
};

export type CompleteGameDto = {
  gameType: 'coin_hunt' | 'memory_financial';
  collectedItemIds?: string[];
  matchedPairIds?: string[];
  attempts?: number;
  mistakes?: number;
  startedAt?: string;
  completedAt?: string;
};

export type GameResultResponse = {
  blockId: number;
  gameType: string;
  score: number;
  completed: boolean;
  attempts: number;
  mistakes: number;
  result: Record<string, unknown>;
  reward?: Record<string, unknown> | null;
  xp: number;
  coins?: number;
};

export const api = {
  requestOtp: (payload: { mobileNumber: string }) =>
    post<typeof payload, unknown>('/auth/otp/request', payload, false),
  verifyOtp: (payload: { mobileNumber: string; otp: string }) =>
    post<typeof payload, VerifyOtpResponse>('/auth/otp/verify', payload, false),
  getMyProfile: async () =>
    unwrapData<UserProfile | null>(
      await get<UserProfile | null | { data: UserProfile | null }>('/users/me'),
    ),
  updateMyProfile: (payload: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    grade?: number;
    avatarId?: number;
  }) => patch<typeof payload, UserProfile>('/users/me', payload),
  completeGame: (blockId: number, payload: CompleteGameDto) =>
    post<CompleteGameDto, GameResultResponse>(
      `/game/blocks/${blockId}/complete`,
      payload,
    ),
  getGameResult: (blockId: number) =>
    get<GameResultResponse>(`/game/blocks/${blockId}/result`),
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
  updateLessonBlock: (id: number, payload: Partial<CreateLessonBlockInput>) =>
    patch<Partial<CreateLessonBlockInput>, unknown>(`/lesson-blocks/${id}`, payload),
};
