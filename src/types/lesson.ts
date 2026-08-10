// src/types/lesson.ts

export type BlockType =
  | 'dialog'
  | 'image'
  | 'quiz'
  | 'story'
  | 'reward'
  | 'animation'
  | 'video'
  | 'drag_drop';

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

export interface StoryPayload {
  title?: string;
  text: string;
}

export interface RewardPayload {
  xp: number;
  coins: number;
  message?: string;
}

export interface MediaPayload {
  url: string;
  caption?: string;
}

export interface DragDropPayload {
  items: string[];
  targets: string[];
  instruction?: string;
}

export type LessonBlockPayload =
  | DialogPayload
  | ImagePayload
  | QuizPayload
  | StoryPayload
  | RewardPayload
  | MediaPayload
  | DragDropPayload;

export interface LessonBlock {
  id: number;
  sortOrder?: number;
  type: BlockType;
  payload: LessonBlockPayload;
}

export interface LessonData {
  id: number;
  title: string;
  description?: string;
  rewardXp?: number;
  rewardCoins?: number;
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
