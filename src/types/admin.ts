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
  courseId?: number;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  cover?: string;
  order: number;
  isPublished: boolean;
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

export interface CreateLessonBlockInput {
  sortOrder: number;
  pageNumber: number;
  type: BlockType;
  payload: Record<string, unknown>;
  lessonId: number;
}
