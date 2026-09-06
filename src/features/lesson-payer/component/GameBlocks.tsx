'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Coins, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import { api, type CompleteGameDto, type GameResultResponse } from '@/lib/api';

type Props = { blockId: number; payload: Record<string, unknown>; onNext: () => void };

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function Result({ result, onNext }: { result: GameResultResponse; onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden p-8 text-center sm:p-10">
      <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto mb-5 grid size-24 place-items-center rounded-[30px] bg-gradient-to-br from-[#ffe56b] to-[#ffb23f] text-white shadow-[0_8px_0_#e89b2e]">
        <Trophy size={48} />
      </motion.div>
      <h2 className="text-2xl font-black text-slate-800">آفرین قهرمان!</h2>
      <p className="mt-2 text-sm font-bold text-slate-500">بازی را با موفقیت تمام کردی.</p>
      <div className="my-6 flex justify-center gap-3">
        <span className="rounded-full bg-violet-50 px-4 py-2 font-black text-violet-600">امتیاز {result.score}</span>
        <span className="rounded-full bg-amber-50 px-4 py-2 font-black text-amber-600"><Coins size={16} className="inline" /> {result.xp} XP</span>
      </div>
      <button onClick={onNext} className="h-13 w-full rounded-2xl bg-[#58cc59] font-black text-white shadow-[0_5px_0_#3da83e] transition-transform active:translate-y-1">ادامه درس</button>
    </motion.div>
  );
}

function SparkleField() {
  return <div className="pointer-events-none absolute inset-0 overflow-hidden">{Array.from({ length: 9 }, (_, index) => <motion.span key={index} className="absolute text-amber-300" style={{ left: `${8 + (index * 17) % 88}%`, top: `${10 + (index * 29) % 78}%` }} animate={{ y: [0, -12, 0], opacity: [0.25, 0.8, 0.25], rotate: [0, 20, 0] }} transition={{ duration: 2.2 + index * 0.18, repeat: Infinity, delay: index * 0.15 }}>✦</motion.span>)}</div>;
}

export function CoinHuntGame({ blockId, payload, onNext }: Props) {
  const raw = Array.isArray(payload.items) ? payload.items : [];
  const items = raw.map((item, index) => { const value = item as Record<string, unknown>; return { id: text(value.id ?? value.itemId, `item-${index}`), value: Number(value.value ?? 0) }; });
  const target = (payload.target ?? {}) as Record<string, unknown>;
  const targetType = text(target.type, 'count');
  const targetValue = Number(target.value ?? 1);
  const [collected, setCollected] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<GameResultResponse | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(new Date().toISOString());
  const score = useMemo(() => collected.reduce((sum, id) => sum + (items.find((item) => item.id === id)?.value ?? 0), 0), [collected, items]);
  const completed = targetType === 'amount' ? score >= targetValue : targetType === 'item_value' ? items.some((item) => collected.includes(item.id) && item.value === targetValue) : collected.length >= targetValue;
  const progress = targetType === 'amount' ? Math.min(100, (score / targetValue) * 100) : Math.min(100, (collected.length / targetValue) * 100);

  useEffect(() => { api.getGameResult(blockId).then(setResult).catch(() => undefined); }, [blockId]);
  useEffect(() => {
    if (!items.length || !completed || result || submitting) return;
    const dto: CompleteGameDto = { gameType: 'coin_hunt', collectedItemIds: collected, attempts, mistakes: 0, startedAt: startedAt.current, completedAt: new Date().toISOString() };
    setSubmitting(true); api.completeGame(blockId, dto).then(setResult).catch((e) => setError(e instanceof Error ? e.message : 'ثبت نتیجه ناموفق بود.')).finally(() => setSubmitting(false));
  }, [attempts, blockId, collected, completed, items.length, result, submitting]);

  if (result) return <Result result={result} onNext={onNext} />;
  if (!items.length) return <div className="p-8 text-center font-bold text-rose-500">محتوای بازی کامل نیست.</div>;
  return <div className="relative overflow-hidden p-5 sm:p-8"><SparkleField />
    <div className="relative z-10">
      <div className="mb-5 flex items-start justify-between gap-3"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600"><Coins size={15} /> مأموریت سکه‌ای</div><h2 className="text-2xl font-black text-slate-800">{text(payload.title, 'شکار سکه‌ها')}</h2><p className="mt-1 text-sm font-bold leading-6 text-slate-500">{text(payload.introduction, 'سکه‌های درست را پیدا کن و گنجت را کامل کن!')}</p></div><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-100 text-3xl shadow-[0_5px_0_#f2c14e]">🪙</motion.div></div>
      <div className="mb-6 rounded-2xl bg-slate-50 p-3"><div className="mb-2 flex justify-between text-xs font-black text-slate-500"><span>{targetType === 'amount' ? `هدف: ${targetValue} سکه` : `هدف: ${targetValue} سکه`}</span><span>{Math.round(progress)}٪</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-200"><motion.div animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-l from-[#ffb52e] to-[#ffe064]" /></div></div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{items.map((item, index) => { const isCollected = collected.includes(item.id); return <motion.button key={item.id} type="button" disabled={isCollected || submitting} onClick={() => { setAttempts((n) => n + 1); setCollected((ids) => ids.includes(item.id) ? ids : [...ids, item.id]); }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={!isCollected ? { y: -6, rotate: index % 2 ? 2 : -2 } : undefined} whileTap={!isCollected ? { scale: 0.92 } : undefined} className={`relative min-h-28 overflow-hidden rounded-3xl border-2 p-4 text-center transition-all ${isCollected ? 'border-emerald-200 bg-emerald-50 opacity-60' : 'border-amber-200 bg-gradient-to-br from-[#fffaf0] to-[#fff0c8] shadow-[0_6px_0_#f2b84b]'}`}><AnimatePresence mode="wait">{isCollected ? <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="mx-auto text-emerald-500" size={32} /></motion.div> : <motion.div key="coin" animate={{ y: [0, -5, 0], rotateY: [0, 180, 360] }} transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.12 }} className="text-4xl">🪙</motion.div>}</AnimatePresence><span className="mt-2 block text-lg font-black text-slate-700">{item.value}</span></motion.button>; })}</div>
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm font-black"><span className="text-amber-600">امتیاز: {score}</span><span className="text-slate-500">جمع‌شده: {collected.length} / {targetValue}</span></div>
      {error && <div className="mt-4 flex items-center justify-between rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600"><span>{error}</span><button onClick={() => setError('')}><X size={16} /></button></div>}{submitting && <p className="mt-4 text-center text-xs font-bold text-slate-400">در حال ثبت نتیجه...</p>}
    </div></div>;
}

export function MemoryFinancialGame({ blockId, payload, onNext }: Props) {
  const raw = Array.isArray(payload.pairs) ? payload.pairs : [];
  const cards = raw.flatMap((pair, index) => { const value = pair as Record<string, unknown>; const id = text(value.id ?? value.pairId, `pair-${index}`); const first = value.first as Record<string, unknown> | undefined; const second = value.second as Record<string, unknown> | undefined; return [{ id: `${id}-a`, pairId: id, label: text(first?.type, 'کارت اول') }, { id: `${id}-b`, pairId: id, label: text(second?.type, 'کارت دوم') }]; });
  const [flipped, setFlipped] = useState<string[]>([]); const [matched, setMatched] = useState<string[]>([]); const [attempts, setAttempts] = useState(0); const [result, setResult] = useState<GameResultResponse | null>(null); const [error, setError] = useState(''); const startedAt = useRef(new Date().toISOString()); const lock = flipped.length === 2;
  useEffect(() => { api.getGameResult(blockId).then(setResult).catch(() => undefined); }, [blockId]);
  useEffect(() => { if (flipped.length !== 2) return; const [first, second] = flipped.map((id) => cards.find((card) => card.id === id)!); const timer = window.setTimeout(() => { setMatched((current) => first.pairId === second.pairId ? [...current, first.pairId] : current); setFlipped([]); }, 800); return () => window.clearTimeout(timer); }, [cards, flipped]);
  useEffect(() => { if (!raw.length || matched.length !== raw.length || result) return; const dto: CompleteGameDto = { gameType: 'memory_financial', matchedPairIds: matched, attempts, mistakes: Math.max(0, attempts - matched.length), startedAt: startedAt.current, completedAt: new Date().toISOString() }; api.completeGame(blockId, dto).then(setResult).catch((e) => setError(e instanceof Error ? e.message : 'ثبت نتیجه ناموفق بود.')); }, [attempts, blockId, matched, raw.length, result]);
  if (result) return <Result result={result} onNext={onNext} />;
  if (cards.length < 2) return <div className="p-8 text-center font-bold text-rose-500">کارت‌های بازی کامل نیستند.</div>;
  return <div className="relative overflow-hidden p-5 sm:p-8"><SparkleField /><div className="relative z-10"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-600"><Sparkles size={15} /> تمرین حافظه</div><h2 className="text-2xl font-black text-slate-800">{text(payload.title, 'حافظه مالی')}</h2><p className="mt-1 text-sm font-bold leading-6 text-slate-500">{text(payload.introduction, 'کارت‌های مرتبط را پیدا کن و جفت‌ها را کامل کن!')}</p></div><motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-3xl shadow-[0_5px_0_#b9a7ff]">🧠</motion.div></div>
    <div className="mb-5 flex items-center justify-between rounded-2xl bg-violet-50 p-3 text-xs font-black text-violet-700"><span>جفت‌های پیدا شده</span><span>{matched.length} از {raw.length}</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{cards.map((card, index) => { const open = flipped.includes(card.id) || matched.includes(card.pairId); const isMatched = matched.includes(card.pairId); return <motion.button key={card.id} type="button" disabled={open || lock} onClick={() => { setAttempts((n) => n + 1); setFlipped((current) => [...current, card.id]); }} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1, rotateY: open ? 0 : 180 }} transition={{ delay: index * 0.05, rotateY: { duration: 0.45 } }} whileHover={!open && !lock ? { y: -5 } : undefined} className={`relative min-h-32 rounded-2xl border-2 p-3 text-center font-black [transform-style:preserve-3d] ${isMatched ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_5px_0_#9fe3b1]' : open ? 'border-violet-300 bg-white text-violet-700 shadow-[0_5px_0_#d7ccff]' : 'border-violet-300 bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_5px_0_#6549cb]'}`}><span className="absolute inset-0 grid place-items-center text-4xl">{open ? (isMatched ? '✅' : card.label) : '✦'}</span></motion.button>; })}</div><div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm font-black"><span className="text-violet-600">تلاش‌ها: {attempts}</span><span className="text-slate-500">هر جفت = یک ستاره ⭐</span></div>{error && <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600"><X size={16} />{error}</div>}<button type="button" onClick={() => { setFlipped([]); setMatched([]); setAttempts(0); setError(''); }} className="mx-auto mt-5 flex items-center gap-2 text-xs font-black text-slate-400 hover:text-violet-600"><RotateCcw size={15} /> شروع دوباره</button></div></div>;
}
