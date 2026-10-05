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
      className="relative overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-success-soft to-white p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] sm:p-8"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mx-auto mb-5 grid size-24 place-items-center rounded-[30px] bg-gradient-to-br from-warning to-accent text-warning-foreground shadow-[0_8px_0_var(--warning-strong)]"
      >
        <Coins size={48} />
      </motion.div>
      <h2 className="mb-2 text-center text-2xl font-black text-foreground">
        {result.completed ? 'آفرین!' : 'تلاش خوبی بود!'}
      </h2>
      <p className="mb-6 text-center text-sm font-bold text-muted">
        {result.completed
          ? 'تو تونستی بهتر از سیستم قیمت بذاری!'
          : 'دفعه بعد سعی کن کمتر پیشنهاد بدی!'}
      </p>
      {details && details.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="mb-3 flex items-center justify-center gap-2 rounded-full bg-warning-soft px-4 py-2 text-sm font-black text-warning-soft-foreground">
            <span>امتیاز: {result.score}</span>
            <span className="text-warning-strong">|</span>
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
                  ? 'border-success-soft bg-success-soft'
                  : 'border-danger-soft bg-danger-soft'
              }`}
            >
              <span className="font-black text-foreground">{item.itemName}</span>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-muted">
                  پیشنهاد: {formatNumber(item.playerBid)}
                </span>
                <span className="text-subtle">|</span>
                <span className="text-muted">
                  سیستم: {formatNumber(item.systemPrice)}
                </span>
                {item.outcome === 'win' ? (
                  <span className="text-success">✅</span>
                ) : (
                  <span className="text-danger">❌</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <button
        onClick={onNext}
        className="h-14 w-full rounded-2xl bg-success font-black text-success-foreground shadow-[0_5px_0_var(--success-strong)] transition-transform active:translate-y-1"
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
      <div className="p-8 text-center font-bold text-danger">
        محتوای بازی کامل نیست.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-surface/95 p-6 shadow-[0_20px_65px_rgba(38,61,89,0.12)] sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-black text-accent-soft-foreground">
            <span className="text-sm">🏷️</span>
            مزایده
          </div>
          <h2 className="text-2xl font-black text-foreground">بازی مزایده</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-muted">
            بودجه‌ات رو بین آیتم‌ها تقسیم کن و پیشنهاد بده. سعی کن کمتر از قیمت سیستم پیشنهاد بدی!
          </p>
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-soft text-3xl shadow-[0_5px_0_var(--warning-strong)]"
        >
          🏷️
        </motion.div>
      </div>

      {/* Budget bar */}
      <div className="mb-6 rounded-2xl bg-surface-muted p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-black">
          <span className="text-accent-soft-foreground">💰 بودجه باقی‌مانده</span>
          <span className={remainingBudget < 0 ? 'text-danger' : 'text-success'}>
            {formatNumber(remainingBudget)} تومان
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-border">
          <motion.div
            animate={{ width: `${Math.min(100, (totalBid / totalBudget) * 100)}%` }}
            className={`h-full rounded-full transition-all ${
              remainingBudget < 0
                ? 'bg-gradient-to-l from-danger to-danger-hover'
                : 'bg-gradient-to-l from-accent to-warning'
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
            className="overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-surface-muted to-white shadow-[0_4px_0_var(--border)]"
          >
            {item.imageUrl && (
              <div className="aspect-square w-full overflow-hidden bg-surface-muted">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-3">
              <h3 className="mb-2 text-sm font-black text-foreground">{item.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-subtle">ارزش تقریبی:</span>
                <span className="text-xs font-black text-muted">
                  {formatNumber(item.basePrice)} تومان
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-bold text-muted">پیشنهاد تو:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bids[item.id] ?? 0}
                  onChange={(e) => updateBid(item.id, e.target.value)}
                  className="w-full rounded-xl border-2 border-border bg-surface px-3 py-2 text-center text-sm font-black text-foreground outline-none transition-colors focus:border-accent"
                  placeholder="مبلغ"
                />
                <span className="text-xs font-bold text-subtle shrink-0">تومان</span>
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
          className="text-sm font-black text-accent underline-offset-4 hover:underline"
        >
          تقسیم خودکار بودجه
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || remainingBudget < 0}
          className="h-14 w-full flex-1 rounded-2xl bg-gradient-to-l from-accent to-warning font-black text-foreground shadow-[0_5px_0_var(--warning-strong)] transition-transform disabled:opacity-50 disabled:shadow-none active:translate-y-1"
        >
          {isSubmitting ? 'در حال ثبت...' : 'ثبت پیشنهادها'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-danger-soft p-3 text-xs font-bold text-danger-soft-foreground">
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
