import { z } from 'zod';
import type {
  WordSearchCell,
  WordSearchCompletionRequest,
  WordSearchDirection,
  WordSearchPayload,
  WordSearchSelection,
} from '../../types/lesson.ts';

export const wordSearchDirections: WordSearchDirection[] = [
  'horizontal',
  'vertical',
  'diagonal_down',
  'diagonal_up',
];

const cellSchema = z.object({
  row: z.number().int().nonnegative('شماره سطر نمی‌تواند منفی باشد.'),
  col: z.number().int().nonnegative('شماره ستون نمی‌تواند منفی باشد.'),
});

const wordConfigSchema = z.object({
  word: z.string().trim().min(1, 'متن کلمه نمی‌تواند خالی باشد.'),
  start: cellSchema.optional(),
  direction: z.enum(wordSearchDirections).optional(),
});

export const wordSearchPayloadSchema = z
  .object({
    grid: z
      .array(z.union([z.string(), z.array(z.string())]))
      .min(1, 'جدول کلمات نمی‌تواند خالی باشد.'),
    words: z
      .array(z.union([z.string().trim().min(1), wordConfigSchema]))
      .min(1, 'حداقل یک کلمه لازم است.'),
    allowReverse: z.boolean().optional(),
    scoring: z
      .object({
        perWord: z.number().int().positive('امتیاز هر کلمه باید عددی مثبت باشد.').optional(),
        maxScore: z.number().int().nonnegative('سقف امتیاز نمی‌تواند منفی باشد.').optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    const rows = normalizeGrid(value.grid);
    const width = rows[0]?.length ?? 0;
    const rectangular = rows.every((row) => row.length === width);
    if (!rectangular) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['grid'],
        message: 'همه ردیف‌های جدول باید هم‌طول باشند.',
      });
    }
  });

export function normalizeWordSearchWord(value: string) {
  return value.replace(/[\s\u200c]+/g, '');
}

function normalizeRow(row: unknown): string[] {
  if (Array.isArray(row)) {
    return Array.from(row.map((cell) => String(cell)).join('').replace(/\s+/g, ''));
  }
  if (typeof row === 'string') {
    return Array.from(row.replace(/\s+/g, ''));
  }
  return [];
}

export function normalizeGrid(grid: unknown): string[][] {
  if (!Array.isArray(grid)) return [];
  return grid.map((row) => normalizeRow(row));
}

export interface NormalizedWordSearch {
  grid: string[][];
  words: string[];
  allowReverse: boolean;
  scoring: { perWord: number; maxScore?: number };
}

export function parseWordSearchPayload(value: unknown) {
  const parsed = wordSearchPayloadSchema.safeParse(value);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const words = data.words
    .map((entry) => (typeof entry === 'string' ? entry : entry.word))
    .map(normalizeWordSearchWord)
    .filter(Boolean);
  const normalized: NormalizedWordSearch = {
    grid: normalizeGrid(data.grid),
    words,
    allowReverse: data.allowReverse ?? true,
    scoring: {
      perWord: data.scoring?.perWord ?? 10,
      maxScore: data.scoring?.maxScore,
    },
  };
  return { success: true as const, data: normalized };
}

export const wordSearchDefaults: WordSearchPayload = {
  grid: [
    ['ب', 'ا', 'ن', 'ک', 'خ'],
    ['د', 'ر', 'م', 'ب', 'ا'],
    ['س', 'ه', 'م', 'ج', 'ه'],
  ],
  words: [{ word: 'بانک', start: { row: 0, col: 0 }, direction: 'horizontal' }],
  allowReverse: true,
  scoring: { perWord: 10 },
};

function isStraightLine(
  start: WordSearchCell,
  end: WordSearchCell,
): WordSearchDirection | null {
  const dRow = end.row - start.row;
  const dCol = end.col - start.col;
  if (dRow === 0 && dCol === 0) return null;
  if (dRow === 0) return 'horizontal';
  if (dCol === 0) return 'vertical';
  if (Math.abs(dRow) === Math.abs(dCol)) {
    return dRow > 0 ? 'diagonal_down' : 'diagonal_up';
  }
  return null;
}

function inBounds(grid: string[][], cell: WordSearchCell) {
  return (
    cell.row >= 0 &&
    cell.col >= 0 &&
    cell.row < grid.length &&
    cell.col < (grid[cell.row]?.length ?? 0)
  );
}

export function readWordSearchLine(
  grid: string[][],
  start: WordSearchCell,
  end: WordSearchCell,
): { cells: WordSearchCell[]; text: string } | null {
  const direction = isStraightLine(start, end);
  if (!direction) return null;
  if (!inBounds(grid, start) || !inBounds(grid, end)) return null;

  const dRow = Math.sign(end.row - start.row);
  const dCol = Math.sign(end.col - start.col);
  const cells: WordSearchCell[] = [];
  const chars: string[] = [];

  let row = start.row;
  let col = start.col;
  while (true) {
    cells.push({ row, col });
    chars.push(grid[row][col]);
    if (row === end.row && col === end.col) break;
    row += dRow;
    col += dCol;
  }

  return { cells, text: chars.join('') };
}

export function doesSelectionMatchWord(
  selection: WordSearchSelection,
  words: string[],
  allowReverse: boolean,
) {
  const selected = normalizeWordSearchWord(selection.word);
  return words.some((word) => {
    const target = normalizeWordSearchWord(word);
    if (target === selected) return true;
    return allowReverse && reverseWord(target) === selected;
  });
}

function reverseWord(value: string) {
  return Array.from(value).reverse().join('');
}

export function createWordSearchSelection(
  grid: string[][],
  start: WordSearchCell,
  end: WordSearchCell,
): WordSearchSelection | null {
  const line = readWordSearchLine(grid, start, end);
  if (!line) return null;
  return { word: line.text, start, end };
}

export function tryBeginWordSearchSubmission(flag: { current: boolean }) {
  if (flag.current) return false;
  flag.current = true;
  return true;
}

export function createWordSearchCompletionRequest(
  selections: WordSearchSelection[],
  startedAt?: string,
  completedAt?: string,
): WordSearchCompletionRequest {
  return {
    gameType: 'word_search',
    wordSearchSelections: selections.map((selection) => ({
      word: selection.word,
      start: { row: selection.start.row, col: selection.start.col },
      end: { row: selection.end.row, col: selection.end.col },
    })),
    startedAt,
    completedAt,
  };
}
