import type {
  AdminCourseOption,
  AdminLessonOption,
  CreateCourseInput,
  CreateLessonBlockInput,
  CreateLessonInput,
  UpdateCourseInput,
  UpdateLessonInput,
  UpdateLessonBlockInput,
} from '@/types/admin';
import type {
  BasketGameCompletionRequest,
  CourseDetail,
  DragDropCompletionRequest,
  LessonData,
  Lesson,
  LessonBlock,
  WordSearchCompletionRequest,
  WordSearchSelection,
} from '@/types/lesson';
import { useAuthStore } from '@/store/authStore';

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
  const state = useAuthStore.getState();
  const localToken =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return state.token || localToken || process.env.NEXT_PUBLIC_MOCK_JWT || '';
}

function getRefreshToken() {
  const state = useAuthStore.getState();
  const localRefreshToken =
    typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  return state.refreshToken || localRefreshToken || '';
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

export type TokenPairResponse = {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  user: {
    id: number;
    mobileNumber: string;
    role: 'child' | 'admin';
  };
};

let refreshPromise: Promise<string> | null = null;

async function rotateRefreshToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new ApiError('نشست شما به پایان رسیده است.', 401);

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Accept-Language': 'fa',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new ApiError('امکان تمدید نشست وجود ندارد.', response.status);
    }

    const responseBody = (await response.json()) as
      | TokenPairResponse
      | { data: TokenPairResponse };
    const tokenPair = unwrapData<TokenPairResponse>(responseBody);

    if (!tokenPair.accessToken || !tokenPair.refreshToken) {
      throw new ApiError('پاسخ تمدید نشست معتبر نیست.', 401);
    }

    useAuthStore.getState().setToken(
      tokenPair.accessToken,
      tokenPair.refreshToken,
    );
    return tokenPair.accessToken;
  })().catch((error) => {
    useAuthStore.getState().logout();
    throw error;
  }).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  authenticated = true,
  hasRetried = false,
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

  if (response.status === 401 && authenticated && !hasRetried) {
    const accessToken = await rotateRefreshToken();
    const retryHeaders = new Headers(init?.headers);
    retryHeaders.set('Authorization', `Bearer ${accessToken}`);
    return request<T>(path, { ...init, headers: retryHeaders }, true, true);
  }

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
  role?: 'child' | 'admin';
  xp?: number;
  coins?: number;
  gems?: number;
  level?: number;
  experience?: number;
  streak?: number;
};

export type CompleteGameDto =
  | BasketGameCompletionRequest
  | WordSearchCompletionRequest
  | DragDropCompletionRequest
  | {
      gameType: 'coin_hunt' | 'memory_financial' | 'basket_game' | 'auction';
      collectedItemIds?: string[];
      matchedPairIds?: string[];
      decisionTreeMatches?: string[];
      wordSearchFoundWords?: string[];
      wordSearchSelections?: WordSearchSelection[];
      auctionBidIds?: string[];
      attempts?: number;
      mistakes?: number;
      startedAt?: string;
      completedAt?: string;
    };

export type GameReward = {
  lessonId?: number;
  xp?: number;
  coins?: number;
  claimEndpoint?: string;
};

export type GameResultResponse = {
  blockId: number;
  gameType: string;
  score: number;
  completed: boolean;
  attempts: number;
  mistakes: number;
  result: Record<string, unknown>;
  reward?: GameReward | null;
  xp: number;
  coins?: number;
  balance?: {
    xp: number;
    coins: number;
    experience: number;
  };
};

export type RewardResponse = {
  id: number;
  lessonId: number;
  lessonTitle?: string;
  xp: number;
  coins: number;
  createdAt: string;
};

export const api = {
  requestOtp: (payload: { mobileNumber: string }) =>
    post<typeof payload, unknown>('/auth/otp/request', payload, false),
  verifyOtp: (payload: { mobileNumber: string; otp: string }) =>
    post<typeof payload, VerifyOtpResponse>('/auth/otp/verify', payload, false),
  refreshSession: () => rotateRefreshToken(),
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
  claimLessonReward: async (lessonId: number) =>
    unwrapData<RewardResponse>(
      await post<Record<string, never>, RewardResponse | { data: RewardResponse }>(
        `/rewards/lessons/${lessonId}/claim`,
        {},
      ),
    ),
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

  // Course CRUD
  updateCourse: (id: number, payload: Partial<UpdateCourseInput>) =>
    patch<Partial<UpdateCourseInput>, unknown>(`/courses/${id}`, payload),
  deleteCourse: (id: number) =>
    request<void>(`/courses/${id}`, { method: 'DELETE' }),

  // Lesson CRUD
  updateLesson: (id: number, payload: Partial<UpdateLessonInput>) =>
    patch<Partial<UpdateLessonInput>, unknown>(`/lessons/${id}`, payload),
  deleteLesson: (id: number) =>
    request<void>(`/lessons/${id}`, { method: 'DELETE' }),

  // Lesson Block CRUD
  getLessonBlocks: async (lessonId: number) => ({
    data: unwrapData<LessonBlock[]>(
      await get<LessonBlock[] | { data: LessonBlock[] }>(
        `/lesson-blocks?lessonId=${lessonId}`,
      ),
    ),
  }),
  deleteLessonBlock: (id: number) =>
    request<void>(`/lesson-blocks/${id}`, { method: 'DELETE' }),

  // Lesson detail with blocks
  getLessonDetail: async (id: number) => ({
    data: unwrapData<Lesson & { blocks: LessonBlock[] }>(
      await get<Lesson & { blocks: LessonBlock[] } | { data: Lesson & { blocks: LessonBlock[] } }>(
        `/lessons/${id}`,
      ),
    ),
  }),
};
