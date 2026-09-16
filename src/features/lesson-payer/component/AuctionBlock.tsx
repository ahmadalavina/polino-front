'use client';

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins, X } from 'lucide-react';
import { api, type CompleteGameDto, type GameResultResponse } from '@/lib/api';
import { useGameStore } from '@/store/gameStore';
import type { AuctionPayload } from '@/types/lesson';

type Props = { blockId: number; payload: AuctionPayload; onNext: () => void };

function formatNumber(num: number): string {
  return num.toLocaleString('fa-IR');
}

function Result({ result, onNext }: { result: GameResultResponse; onNext: () => void }) {
  const details = (result.result as Record<string, unknown>)?.details as Array<{
    itemId: number;
    itemName: string;
    playerBid: number;
    systemPrice: number;
    outcome: 'win' | 'lose';
  }> | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] sm:p-8"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mx-auto mb-5 grid size-24 place-items-center rounded-[30px] bg-gradient-to-br from-[#ffe56b] to-[#ffb23f] text-white shadow-[0_8px_0_#e89b2e]"
      >
        <Coins size={48} />
      </motion.div>
      <h2 className="mb-2 text-center text-2xl font-black text-slate-800">
        {result.completed ? 'آفرین!' : 'تلاش خوبی بود!'}
      </h2>
      <p className="mb-6 text-center text-sm font-bold text-slate-500">
        {result.completed
          ? 'تو تونستی بهتر از سیستم قیمت بذاری!'
          : 'دفعه بعد سعی کن کمتر پیشنهاد بدی!'}
      </p>
      {details && details.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="mb-3 flex items-center justify-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-600">
            <span>امتیاز: {result.score}</span>
            <span className="text-amber-400">|</span>
            <span>پیشنهاد: {formatNumber((result.result as Record<string, unknown>)?.totalBid as number ?? 0)} تومان</span>
          </div>
          {details.map((item, index) => (
            <motion.div
              key={item.itemId}
              initial={{ opacity: 0, x: item.outcome === 'win' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between rounded-2xl border-2 p-3 ${
                item.outcome === 'win'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-rose-200 bg-rose-50'
              }`}
            >
              <span className="font-black text-slate-700">{item.itemName}</span>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-slate-500">
                  پیشنهاد: {formatNumber(item.playerBid)}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">
                  سیستم: {formatNumber(item.systemPrice)}
                </span>
                {item.outcome === 'win' ? (
                  <span className="text-emerald-500">✅</span>
                ) : (
                  <span className="text-rose-500">❌</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <button
        onClick={onNext}
        className="h-14 w-full rounded-2xl bg-[#58cc59] font-black text-white shadow-[0_5px_0_#3da83e] transition-transform active:translate-y-1"
      >
        ادامه درس
      </button>
    </motion.div>
  );
}

export default function AuctionBlock({ blockId, payload, onNext }: Props) {
  const items = payload.items ?? [];
  const totalBudget = payload.totalBudget ?? 0;
  const minBid = payload.minBidPerItem ?? 1000;

  const [bids, setBids] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    items.forEach((item) => {
      initial[item.id] = 0;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<GameResultResponse | null>(null);
  const [error, setError] = useState('');
  const startedAt = useRef(new Date().toISOString());

  const remainingBudget = useMemo(
    () => totalBudget - Object.values(bids).reduce((sum, bid) => sum + bid, 0),
    [bids, totalBudget],
  );

  const totalBid = useMemo(
    () => Object.values(bids).reduce((sum, bid) => sum + bid, 0),
    [bids],
  );

  const hasValidBids = useMemo(
    () => Object.values(bids).some((bid) => bid > 0),
    [bids],
  );

  function updateBid(itemId: number, value: string) {
    const num = parseInt(value.replace(/[^\d]/g, '') || '0', 10);
    setBids((prev) => ({ ...prev, [itemId]: Math.max(0, num) }));
  }

  function handleAutoFill() {
    const avgBid = Math.floor(totalBudget / items.length);
    const newBids: Record<number, number> = {};
    items.forEach((item, index) => {
      newBids[item.id] = index === items.length - 1
        ? totalBudget - (items.length - 1) * avgBid
        : avgBid;
    });
    setBids(newBids);
  }

  async function handleSubmit() {
    if (totalBid > totalBudget) {
      setError('مجموع پیشنهاد‌ها از بودجه بیشتر است!');
      return;
    }
    if (!hasValidBids) {
      setError('حداقل برای یک آیتم پیشنهاد بده!');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const auctionBidIds = Object.entries(bids)
      .filter(([, bid]) => bid > 0)
      .map(([itemId, bid]) => `${itemId}:${bid}`);

    if (auctionBidIds.length === 0) {
      setError('حداقل برای یک آیتم پیشنهاد بده!');
      setIsSubmitting(false);
      return;
    }

    const dto: CompleteGameDto = {
      gameType: 'auction',
      auctionBidIds,
      attempts: 1,
      mistakes: 0,
      startedAt: startedAt.current,
      completedAt: new Date().toISOString(),
    };

    try {
      const response = await api.completeGame(blockId, dto);
      setResult(response);
      if (response.balance) {
        useGameStore.getState().setBalance(response.balance);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت نتیجه ناموفق بود.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return <Result result={result} onNext={onNext} />;
  }

  if (!items.length) {
    return (
      <div className="p-8 text-center font-bold text-rose-500">
        محتوای بازی کامل نیست.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-white bg-white/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
            <span className="text-sm">🏷️</span>
            مزایده
          </div>
          <h2 className="text-2xl font-black text-slate-800">بازی مزایده</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
            بودجه‌ات رو بین آیتم‌ها تقسیم کن و پیشنهاد بده. سعی کن کمتر از قیمت سیستم پیشنهاد بدی!
          </p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-orange-100 text-3xl shadow-[0_5px_0_#f2b84b]"
        >
          🏷️
        </motion.div>
      </div>

      {/* Budget bar */}
      <div className="mb-6 rounded-2xl bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-black">
          <span className="text-orange-600">💰 بودجه باقی‌مانده</span>
          <span className={remainingBudget < 0 ? 'text-rose-500' : 'text-emerald-500'}>
            {formatNumber(remainingBudget)} تومان
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            animate={{ width: `${Math.min(100, (totalBid / totalBudget) * 100)}%` }}
            className={`h-full rounded-full transition-all ${
              remainingBudget < 0
                ? 'bg-gradient-to-l from-rose-400 to-rose-300'
                : 'bg-gradient-to-l from-orange-400 to-amber-300'
            }`}
          />
        </div>
      </div>

      {/* Items grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-white shadow-[0_4px_0_#e2e8f0]"
          >
            {item.imageUrl && (
              <div className="aspect-square w-full overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <h3 className="mb-2 text-sm font-black text-slate-700">{item.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">ارزش تقریبی:</span>
                <span className="text-xs font-black text-slate-500">
                  {formatNumber(item.basePrice)} تومان
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">پیشنهاد تو:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bids[item.id] ?? 0}
                  onChange={(e) => updateBid(item.id, e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-center text-sm font-black text-slate-700 outline-none transition-colors focus:border-orange-300"
                  placeholder="مبلغ"
                />
                <span className="text-xs font-bold text-slate-400 shrink-0">تومان</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleAutoFill}
          className="text-sm font-black text-orange-500 underline-offset-4 hover:underline"
        >
          تقسیم خودکار بودجه
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || remainingBudget < 0}
          className="h-14 w-full flex-1 rounded-2xl bg-gradient-to-l from-[#ffb52e] to-[#ffe064] font-black text-slate-800 shadow-[0_5px_0_#e89b2e] transition-transform disabled:opacity-50 disabled:shadow-none active:translate-y-1"
        >
          {isSubmitting ? 'در حال ثبت...' : 'ثبت پیشنهادها'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
