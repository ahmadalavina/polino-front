import type { BlockType } from './lesson';

export interface AdminCourseOption {
  id: number;
  title: string;
  description: string;
  cover: string;
  order: number;
  isPublished?: boolean;
}

export interface AdminLessonOption {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  courseId?: number;
  rewardXp: number;
  rewardCoins: number;
  isPublished: boolean;
}

export interface AdminLessonBlockOption {
  id: number;
  sortOrder: number;
  pageNumber?: number;
  type: BlockType;
  payload: Record<string, unknown>;
  lessonId: number;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  cover?: string;
  order: number;
  isPublished: boolean;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  cover?: string;
  order?: number;
  isPublished?: boolean;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  rewardXp: number;
  rewardCoins: number;
  order: number;
  courseId: number;
  isPublished: boolean;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  rewardXp?: number;
  rewardCoins?: number;
  order?: number;
  courseId?: number;
  isPublished?: boolean;
}

export interface CreateLessonBlockInput {
  sortOrder: number;
  pageNumber: number;
  type: BlockType;
  payload: Record<string, unknown>;
  lessonId: number;
}

export interface UpdateLessonBlockInput {
  sortOrder?: number;
  pageNumber?: number;
  type?: BlockType;
  payload?: Record<string, unknown>;
  lessonId?: number;
}
