'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, LoaderCircle, Pause, Play } from 'lucide-react';
import { api, type GameResultResponse } from '@/lib/api';
import {
  createBasketCompletionRequest,
  cancelBasketAnimationFrame,
  getBasketLocalScore,
  parseBasketGamePayload,
  tryBeginBasketSubmission,
} from '@/features/basket-game/basketGame';
import type { BasketGamePayload } from '@/types/lesson';

type GameState = 'ready' | 'playing' | 'paused' | 'submitting' | 'finished' | 'error';
type FallingItem = { id: number; type: 'coin' | 'bomb'; x: number; y: number };
type Effect = { id: number; kind: 'coin' | 'bomb' } | null;

const ITEM_SIZE = 42;
const PLAYER_WIDTH = 86;
const PLAYER_HEIGHT = 58;
const PLAYER_BOTTOM = 12;

export default function BasketGame({
  blockId,
  payload,
  onNext,
}: {
  blockId: number;
  payload: BasketGamePayload;
  onNext: () => void;
}) {
  const parsedPayload = useMemo(() => parseBasketGamePayload(payload), [payload]);
  const config = parsedPayload.success ? parsedPayload.data : null;
  const areaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const spawnElapsedRef = useRef(0);
  const elapsedMsRef = useRef(0);
  const coinsRef = useRef(0);
  const bombsRef = useRef(0);
  const penaltyRef = useRef(0);
  const playerXRef = useRef(0);
  const itemsRef = useRef<FallingItem[]>([]);
  const keysRef = useRef({ left: false, right: false });
  const itemIdRef = useRef(0);
  const effectIdRef = useRef(0);
  const submittedRef = useRef(false);
  const mountedRef = useRef(true);

  const [gameState, setGameState] = useState<GameState>('ready');
  const [remainingSeconds, setRemainingSeconds] = useState(config?.durationSeconds ?? 0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [bombsHit, setBombsHit] = useState(0);
  const [playerX, setPlayerX] = useState(0);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [effect, setEffect] = useState<Effect>(null);
  const [result, setResult] = useState<GameResultResponse | null>(null);
  const [error, setError] = useState('');

  const localScore = config
    ? getBasketLocalScore(coinsCollected, config.scoring.coinsPerPoint)
    : 0;

  const submitResult = useCallback(async () => {
    if (!tryBeginBasketSubmission(submittedRef)) return;
    setGameState('submitting');
    setError('');
    const body = createBasketCompletionRequest(
      coinsRef.current,
      bombsRef.current,
      elapsedMsRef.current / 1000,
    );
    try {
      const response = await api.completeGame(blockId, body);
      if (!mountedRef.current) return;
      setResult(response);
      setGameState('finished');
    } catch (requestError) {
      if (!mountedRef.current) return;
      submittedRef.current = false;
      setError(requestError instanceof Error ? requestError.message : 'ثبت نتیجه بازی ناموفق بود.');
      setGameState('error');
    }
  }, [blockId]);

  const finishGame = useCallback(() => {
    cancelBasketAnimationFrame(frameRef, cancelAnimationFrame);
    keysRef.current = { left: false, right: false };
    itemsRef.current = [];
    setItems([]);
    setRemainingSeconds(0);
    void submitResult();
  }, [submitResult]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelBasketAnimationFrame(frameRef, cancelAnimationFrame);
      keysRef.current = { left: false, right: false };
      itemsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || !config) return;

    function animate(timestamp: number) {
      const area = areaRef.current;
      if (!area || !config) return;
      const deltaMs = lastFrameRef.current ? Math.min(50, timestamp - lastFrameRef.current) : 0;
      lastFrameRef.current = timestamp;
      elapsedMsRef.current += deltaMs;
      spawnElapsedRef.current += deltaMs;

      const width = area.clientWidth;
      const height = area.clientHeight;
      const direction = Number(keysRef.current.right) - Number(keysRef.current.left);
      if (direction) {
        playerXRef.current = Math.max(0, Math.min(width - PLAYER_WIDTH, playerXRef.current + direction * config.difficulty.playerSpeed * deltaMs / 1000));
        setPlayerX(playerXRef.current);
      }

      if (spawnElapsedRef.current >= config.difficulty.spawnIntervalMs) {
        spawnElapsedRef.current %= config.difficulty.spawnIntervalMs;
        itemsRef.current.push({
          id: ++itemIdRef.current,
          type: Math.random() < config.difficulty.bombChance ? 'bomb' : 'coin',
          x: Math.random() * Math.max(1, width - ITEM_SIZE),
          y: -ITEM_SIZE,
        });
      }

      const playerTop = height - PLAYER_BOTTOM - PLAYER_HEIGHT;
      const nextItems: FallingItem[] = [];
      for (const item of itemsRef.current) {
        const moved = { ...item, y: item.y + config.difficulty.fallingSpeed * deltaMs / 1000 };
        const caught =
          moved.y + ITEM_SIZE >= playerTop &&
          moved.y <= playerTop + PLAYER_HEIGHT &&
          moved.x + ITEM_SIZE >= playerXRef.current &&
          moved.x <= playerXRef.current + PLAYER_WIDTH;
        if (caught) {
          const effectId = ++effectIdRef.current;
          if (moved.type === 'coin') {
            coinsRef.current += 1;
            setCoinsCollected(coinsRef.current);
            setEffect({ id: effectId, kind: 'coin' });
          } else {
            bombsRef.current += 1;
            penaltyRef.current += config.scoring.bombTimePenaltySeconds;
            setBombsHit(bombsRef.current);
            setEffect({ id: effectId, kind: 'bomb' });
          }
          continue;
        }
        if (moved.y <= height) nextItems.push(moved);
      }
      itemsRef.current = nextItems;
      setItems(nextItems);

      const elapsedSeconds = elapsedMsRef.current / 1000;
      const remaining = Math.max(0, config.durationSeconds - elapsedSeconds - penaltyRef.current);
      setRemainingSeconds(Math.ceil(remaining));
      if (remaining <= 0) {
        finishGame();
        return;
      }
      frameRef.current = requestAnimationFrame(animate);
    }

    lastFrameRef.current = 0;
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelBasketAnimationFrame(frameRef, cancelAnimationFrame);
    };
  }, [config, finishGame, gameState]);

  useEffect(() => {
    if (!effect) return;
    const timer = window.setTimeout(() => setEffect(null), 850);
    return () => window.clearTimeout(timer);
  }, [effect]);

  useEffect(() => {
    function updateKey(event: KeyboardEvent, pressed: boolean) {
      if (event.key === 'ArrowLeft') keysRef.current.left = pressed;
      if (event.key === 'ArrowRight') keysRef.current.right = pressed;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault();
    }
    const down = (event: KeyboardEvent) => updateKey(event, true);
    const up = (event: KeyboardEvent) => updateKey(event, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  function moveFromPointer(clientX: number) {
    if (gameState !== 'playing') return;
    const area = areaRef.current;
    if (!area) return;
    const bounds = area.getBoundingClientRect();
    const next = Math.max(0, Math.min(bounds.width - PLAYER_WIDTH, clientX - bounds.left - PLAYER_WIDTH / 2));
    playerXRef.current = next;
    setPlayerX(next);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (gameState !== 'playing') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveFromPointer(event.clientX);
  }

  function startGame() {
    if (!config) return;
    const width = areaRef.current?.clientWidth ?? 320;
    playerXRef.current = Math.max(0, (width - PLAYER_WIDTH) / 2);
    elapsedMsRef.current = 0;
    penaltyRef.current = 0;
    coinsRef.current = 0;
    bombsRef.current = 0;
    itemsRef.current = [];
    submittedRef.current = false;
    setPlayerX(playerXRef.current);
    setRemainingSeconds(config.durationSeconds);
    setCoinsCollected(0);
    setBombsHit(0);
    setItems([]);
    setResult(null);
    setError('');
    setGameState('playing');
  }

  if (!config) {
    return <div className="p-8 text-center font-bold text-rose-600">تنظیمات بازی سبد ناقص یا نامعتبر است.</div>;
  }

  return (
    <div className="p-4 sm:p-6" dir="rtl" data-testid="basket-game">
      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs font-black sm:text-sm">
        <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">زمان باقی‌مانده<br /><span className="text-lg">{remainingSeconds}</span></div>
        <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">سکه‌ها<br /><span className="text-lg">{coinsCollected}</span></div>
        <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">امتیاز<br /><span className="text-lg">{localScore}</span></div>
      </div>

      <div
        ref={areaRef}
        className={`relative h-[430px] touch-none overflow-hidden rounded-[28px] border-2 border-sky-100 bg-gradient-to-b from-sky-200 via-sky-50 to-emerald-100 ${effect?.kind === 'bomb' ? 'animate-pulse ring-4 ring-rose-300' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveFromPointer(event.clientX); }}
      >
        <div className="absolute inset-x-0 top-4 text-center text-sm font-black text-sky-700">سکه‌ها را بگیر و از بمب‌ها دوری کن!</div>
        {items.map((item) => (
          <div key={item.id} className="absolute grid size-[42px] place-items-center text-4xl drop-shadow" style={{ transform: `translate3d(${item.x}px, ${item.y}px, 0)` }}>
            {item.type === 'coin' ? '🪙' : '💣'}
          </div>
        ))}
        <div className="absolute grid h-[58px] w-[86px] place-items-center text-6xl drop-shadow-lg" style={{ bottom: PLAYER_BOTTOM, transform: `translate3d(${playerX}px, 0, 0)` }}>🧺</div>

        {effect && (
          <div key={effect.id} className={`absolute inset-x-4 top-16 rounded-2xl p-3 text-center text-sm font-black shadow-lg ${effect.kind === 'coin' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
            {effect.kind === 'coin' ? 'آفرین! یک سکه گرفتی ✨' : `بمب خوردی! ${config.scoring.bombTimePenaltySeconds} ثانیه از زمان کم شد.`}
          </div>
        )}

        {gameState === 'ready' && <Overlay title="تشخیص خوب از بد" text="با کشیدن سبد یا کلیدهای چپ و راست، سکه‌ها را بگیر و از بمب‌ها دوری کن!" action="شروع بازی" onAction={startGame} />}
        {gameState === 'paused' && <Overlay title="بازی متوقف شده" text="هر وقت آماده بودی بازی را ادامه بده." action="ادامه بازی" onAction={() => setGameState('playing')} />}
        {gameState === 'submitting' && <Overlay title="پایان بازی" text="در حال ثبت نتیجه بازی..." loading />}
        {gameState === 'error' && <Overlay title="ثبت نتیجه ناموفق بود" text={error} action="تلاش دوباره" onAction={() => void submitResult()} />}
        {gameState === 'finished' && <Overlay title="پایان بازی" text={`امتیاز نهایی: ${result?.score ?? localScore}`} action="ادامه درس" onAction={onNext} success />}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-400">بمب‌های برخوردکرده: {bombsHit}</span>
        {gameState === 'playing' && (
          <button type="button" onClick={() => setGameState('paused')} className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-xs font-black text-slate-600"><Pause size={16} /> توقف</button>
        )}
      </div>
    </div>
  );
}

function Overlay({ title, text, action, onAction, loading, success }: { title: string; text: string; action?: string; onAction?: () => void; loading?: boolean; success?: boolean }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-slate-900/35 p-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[26px] bg-white p-6 text-center shadow-2xl">
        {loading ? <LoaderCircle className="mx-auto mb-3 animate-spin text-violet-500" size={42} /> : success ? <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={46} /> : <AlertTriangle className="mx-auto mb-3 text-amber-500" size={42} />}
        <h2 className="text-xl font-black text-slate-800">{title}</h2>
        <p className="mt-2 text-sm font-bold leading-7 text-slate-500">{text}</p>
        {action && onAction && <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onAction} className="mx-auto mt-5 flex items-center gap-2 rounded-2xl bg-[#58cc59] px-6 py-3 text-sm font-black text-white shadow-[0_5px_0_#3da83e]"><Play size={17} />{action}</button>}
      </div>
    </div>
  );
}
