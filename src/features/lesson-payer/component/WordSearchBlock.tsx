'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins, Gift, RotateCcw, Search, Trophy, X } from 'lucide-react';
import { api, type GameResultResponse } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import type { WordSearchCell, WordSearchPayload, WordSearchSelection } from '@/types/lesson';
import {
  createWordSearchCompletionRequest,
  createWordSearchSelection,
  normalizeWordSearchWord,
  parseWordSearchPayload,
  readWordSearchLine,
  tryBeginWordSearchSubmission,
} from '@/features/word-search-game/wordSearchGame';

type Props = {
  blockId: number;
  payload: WordSearchPayload;
  onNext: () => void;
};

function sameCell(a: WordSearchCell | null, b: WordSearchCell | null) {
  return Boolean(a && b && a.row === b.row && a.col === b.col);
}

function cellKey(cell: WordSearchCell) {
  return `${cell.row}-${cell.col}`;
}

export default function WordSearchBlock({ blockId, payload, onNext }: Props) {
  const config = useMemo(() => {
    const parsed = parseWordSearchPayload(payload);
    return parsed.success ? parsed.data : null;
  }, [payload]);

  const [selections, setSelections] = useState<WordSearchSelection[]>([]);
  const [anchor, setAnchor] = useState<WordSearchCell | null>(null);
  const [cursor, setCursor] = useState<WordSearchCell | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<GameResultResponse | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimError, setClaimError] = useState('');
  const startedAt = useRef(new Date().toISOString());
  const submitGuard = useRef(false);
  const dragRef = useRef(false);

  const grid = config?.grid ?? [];
  const words = config?.words ?? [];
  const allowReverse = config?.allowReverse ?? true;

  useEffect(() => {
    api.getGameResult(blockId).then(setResult).catch(() => undefined);
  }, [blockId]);

  const foundWords = useMemo(
    () => new Set(selections.map((selection) => normalizeWordSearchWord(selection.word))),
    [selections],
  );

  const foundCells = useMemo(() => {
    const set = new Set<string>();
    selections.forEach((selection) => {
      const line = readWordSearchLine(grid, selection.start, selection.end);
      line?.cells.forEach((cell) => set.add(cellKey(cell)));
    });
    return set;
  }, [grid, selections]);

  const tentativeLine = useMemo(() => {
    if (!anchor || !cursor || sameCell(anchor, cursor)) return null;
    return readWordSearchLine(grid, anchor, cursor);
  }, [anchor, cursor, grid]);

  const tentativeCells = useMemo(() => {
    const set = new Set<string>();
    tentativeLine?.cells.forEach((cell) => set.add(cellKey(cell)));
    return set;
  }, [tentativeLine]);

  const allFound = words.length > 0 && words.every((word) => foundWords.has(normalizeWordSearchWord(word)));

  useEffect(() => {
    if (!config || !allFound || result || submitting) return;
    if (!tryBeginWordSearchSubmission(submitGuard)) return;
    setSubmitting(true);
    const dto = createWordSearchCompletionRequest(
      selections,
      startedAt.current,
      new Date().toISOString(),
    );
    api
      .completeGame(blockId, dto)
      .then((res) => {
        setResult(res);
        if (res.balance) useGameStore.getState().setBalance(res.balance);
      })
      .catch((e) => {
        submitGuard.current = false;
        setError(e instanceof Error ? e.message : 'ثبت نتیجه ناموفق بود.');
      })
      .finally(() => setSubmitting(false));
  }, [allFound, blockId, config, result, selections, submitting]);

  function commitSelection(start: WordSearchCell, end: WordSearchCell) {
    const line = readWordSearchLine(grid, start, end);
    if (!line) return;
    const normalized = normalizeWordSearchWord(line.text);
    const isRealWord = words.some((word) => {
      const target = normalizeWordSearchWord(word);
      if (target === normalized) return true;
      return allowReverse && Array.from(target).reverse().join('') === normalized;
    });
    if (!isRealWord) return;
    const alreadyFound = foundWords.has(normalized);
    if (alreadyFound) return;
    const selection = createWordSearchSelection(grid, start, end);
    if (!selection) return;
    setSelections((current) => [...current, selection]);
  }

  const endDrag = () => {
    if (dragRef.current && anchor && cursor && !sameCell(anchor, cursor)) {
      commitSelection(anchor, cursor);
      setAnchor(null);
      setCursor(null);
    }
    dragRef.current = false;
    setDragging(false);
  };

  useEffect(() => {
    const handleUp = () => endDrag();
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  });

  function handlePointerDown(cell: WordSearchCell) {
    if (result) return;
    if (anchor && !sameCell(anchor, cell)) {
      commitSelection(anchor, cell);
      setAnchor(null);
      setCursor(null);
      return;
    }
    setAnchor(cell);
    setCursor(cell);
    dragRef.current = true;
    setDragging(true);
  }

  function handlePointerEnter(cell: WordSearchCell) {
    if (!dragging) return;
    setCursor(cell);
  }

  function reset() {
    setSelections([]);
    setAnchor(null);
    setCursor(null);
    setError('');
    startedAt.current = new Date().toISOString();
    submitGuard.current = false;
  }

  async function handleClaim() {
    const lessonId = result?.reward?.lessonId;
    if (!lessonId || claiming || claimed) return;
    setClaiming(true);
    setClaimError('');
    try {
      await api.claimLessonReward(lessonId);
      setClaimed(true);
    } catch (e) {
      setClaimError(e instanceof Error ? e.message : 'دریافت جایزه ناموفق بود.');
    } finally {
      setClaiming(false);
    }
  }

  if (!config || grid.length === 0 || words.length === 0) {
    return (
      <div className="p-8 text-center font-bold text-rose-500">
        جدول کلمات کامل نیست.
      </div>
    );
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center sm:p-10"
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto mb-5 grid size-24 place-items-center rounded-[30px] bg-gradient-to-br from-[#ffe56b] to-[#ffb23f] text-white shadow-[0_8px_0_#e89b2e]"
        >
          <Trophy size={48} />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-800">آفرین قهرمان!</h2>
        <p className="mt-2 text-sm font-bold text-slate-500">
          همه کلمه‌ها را پیدا کردی.
        </p>
        <div className="my-6 flex justify-center gap-3">
          <span className="rounded-full bg-teal-50 px-4 py-2 font-black text-teal-600">
            امتیاز {result.score}
          </span>
          <span className="rounded-full bg-amber-50 px-4 py-2 font-black text-amber-600">
            <Coins size={16} className="inline" /> {result.xp} XP
          </span>
        </div>
        {result.reward?.lessonId && (
          <button
            onClick={handleClaim}
            disabled={claiming || claimed}
            className={`mb-3 flex h-13 w-full items-center justify-center gap-2 rounded-2xl font-black text-white shadow-[0_5px_0_var(--gift-shadow)] transition-transform active:translate-y-1 disabled:opacity-70 ${
              claimed
                ? 'bg-emerald-500 [--gift-shadow:#059669]'
                : 'bg-amber-500 [--gift-shadow:#d97706]'
            }`}
          >
            <Gift size={18} />
            {claimed ? 'جایزه دریافت شد' : claiming ? 'در حال دریافت...' : 'دریافت جایزه'}
          </button>
        )}
        {claimError && (
          <p className="mb-3 text-xs font-bold text-rose-500">{claimError}</p>
        )}
        <button
          onClick={onNext}
          className="h-13 w-full rounded-2xl bg-[#58cc59] font-black text-white shadow-[0_5px_0_#3da83e] transition-transform active:translate-y-1"
        >
          ادامه درس
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden p-5 sm:p-8" dir="rtl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-600">
            <Search size={15} /> جدول کلمات
          </div>
          <h2 className="text-2xl font-black text-slate-800">کلمه‌ها را پیدا کن!</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
            با کشیدن یا دو کلیک، ابتدا و انتهای هر کلمه را انتخاب کن.
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-100 text-3xl shadow-[0_5px_0_#7fd6cb]"
        >
          🔠
        </motion.div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {words.map((word) => {
          const done = foundWords.has(normalizeWordSearchWord(word));
          return (
            <span
              key={word}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-all ${
                done ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {done && <Check size={14} strokeWidth={3} />}
              {word}
            </span>
          );
        })}
      </div>

      <div className="mx-auto w-fit rounded-3xl border-2 border-teal-100 bg-teal-50/40 p-3">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, minmax(0, 1fr))` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((char, colIndex) => {
              const cell = { row: rowIndex, col: colIndex };
              const key = cellKey(cell);
              const isFound = foundCells.has(key);
              const isTentative = tentativeCells.has(key);
              const isAnchor = sameCell(anchor, cell);
              return (
                <button
                  key={key}
                  type="button"
                  onPointerDown={() => handlePointerDown(cell)}
                  onPointerEnter={() => handlePointerEnter(cell)}
                  className={`grid size-9 place-items-center rounded-lg border-2 text-lg font-black transition-all sm:size-11 sm:text-xl ${
                    isFound
                      ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                      : isTentative
                        ? 'border-teal-400 bg-teal-100 text-teal-800'
                        : isAnchor
                          ? 'border-teal-400 bg-white text-teal-700'
                          : 'border-teal-100 bg-white text-slate-700 hover:border-teal-300'
                  }`}
                  style={{ touchAction: 'none' }}
                >
                  {char}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm font-black">
        <span className="text-teal-600">
          پیدا شده: {foundWords.size} از {words.length}
        </span>
        <span className="text-slate-500">همه کلمه‌ها را کامل کن ⭐</span>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {submitting && (
        <p className="mt-4 text-center text-xs font-bold text-slate-400">
          در حال ثبت نتیجه...
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="mx-auto mt-5 flex items-center gap-2 text-xs font-black text-slate-400 hover:text-teal-600"
      >
        <RotateCcw size={15} /> شروع دوباره
      </button>
    </div>
  );
}
