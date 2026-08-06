// src/types/lesson.ts

export type BlockType = 'dialog' | 'image' | 'quiz' | 'story' | 'reward' | 'animation' | 'video' | 'drag_drop';

export interface DialogPayload {
  character: string;
  text: string;
  avatarUrl?: string;
}

export interface ImagePayload {
  url: string;
  caption?: string;
}

export interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuizPayload {
  quizId: number;
  question: string;
  description?: string;
  image?: string;
  options: QuestionOption[];
}

export interface LessonBlock {
  id: number;
  sortOrder: number;
  type: BlockType;
  payload: DialogPayload | ImagePayload | QuizPayload | Record<string, unknown>;
}

export interface LessonData {
  id: number;
  title: string;
  rewardXp: number;
  rewardCoins: number;
  blocks: LessonBlock[];
}

export interface LessonResult {
  xpEarned: number;
  coinsEarned: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface Lesson {
  id: number;
  title: string;
  order: number;
  description?: string;
  rewardXp?: number;
  rewardCoins?: number;
}

export interface CourseDetail {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}
