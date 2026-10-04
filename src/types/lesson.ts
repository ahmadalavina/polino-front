// src/types/lesson.ts

export type BlockType =
  | 'dialog'
  | 'image'
  | 'quiz'
  | 'story'
  | 'reward'
  | 'animation'
  | 'video'
  | 'drag_drop'
  | 'drop_down'
  | 'question_block'
  | 'film_and_image'
  | 'coin_hunt'
  | 'memory_financial'
  | 'decision_tree'
  | 'basket_game'
  | 'word_search'
  | 'auction';

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

export interface CoinHuntPayload {
  introduction?: string;
  title?: string;
  items?: Array<Record<string, unknown>>;
}

export interface MemoryFinancialCardSide {
  type: string;
}

export interface MemoryFinancialPair {
  id?: string;
  first: MemoryFinancialCardSide;
  second: MemoryFinancialCardSide;
}

export interface MemoryFinancialPayload {
  introduction?: string;
  title?: string;
  maxAttempts?: number;
  pairs?: MemoryFinancialPair[];
}

export type WordSearchDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal_down'
  | 'diagonal_up';

export interface WordSearchCell {
  row: number;
  col: number;
}

export interface WordSearchWordConfig {
  word: string;
  start?: WordSearchCell;
  direction?: WordSearchDirection;
}

export interface WordSearchScoring {
  perWord?: number;
  maxScore?: number;
}

export interface WordSearchPayload {
  grid?: string[][];
  words?: Array<string | WordSearchWordConfig>;
  allowReverse?: boolean;
  scoring?: WordSearchScoring;
}

export interface WordSearchSelection {
  word: string;
  start: WordSearchCell;
  end: WordSearchCell;
}

export interface WordSearchCompletionRequest {
  gameType: 'word_search';
  wordSearchSelections: WordSearchSelection[];
  startedAt?: string;
  completedAt?: string;
}

export interface LessonBlock {
  id: number;
  pageNumber?: number;
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

export interface DecisionTreePayload {
  steps: Array<{
    id: string;
    question: string;
  }>;
  correctOrder: {
    steps: string[];
  };
  scoring: {
    correct: number;
  };
}

export interface BasketGamePayload {
  durationSeconds: number;
  difficulty: {
    spawnIntervalMs: number;
    fallingSpeed: number;
    playerSpeed: number;
    bombChance: number;
  };
  scoring: {
    coinsPerPoint: number;
    bombTimePenaltySeconds: number;
  };
}

export interface AuctionPayload {
  items: Array<{
    id: number;
    name: string;
    imageUrl: string;
    basePrice: number;
    priceRange: {
      min: number;
      max: number;
    };
  }>;
  totalBudget: number;
  minBidPerItem?: number;
}

export interface BasketGameCompletionRequest {
  gameType: 'basket_game';
  basketCoinsCollected: number;
  basketBombsHit: number;
  basketElapsedSeconds: number;
}

export type LessonBlockPayload =
  | DialogPayload
  | ImagePayload
  | QuizPayload
  | StoryPayload
  | RewardPayload
  | MediaPayload
  | DragDropPayload
  | CoinHuntPayload
  | MemoryFinancialPayload
  | DecisionTreePayload
  | BasketGamePayload
  | WordSearchPayload
  | AuctionPayload;

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
