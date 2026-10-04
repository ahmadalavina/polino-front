"use client";

import {
  AlertCircle,
  Eye,
  FileJson,
  FormInput,
  ImageIcon,
  MessageCircle,
  Plus,
  Star,
  Trash2,
  GripVertical,
  HelpCircle,
  BookOpen,
  Check,
  GitBranch,
  ArrowUp,
  ArrowDown,
  ShoppingBasket,
  Brain,
  Coins,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { BlockType } from "@/types/lesson";

type Props = {
  blockType: BlockType;
  payloadJson: string;
  onPayloadChange: (json: string) => void;
  errors: Record<string, string>;
};

type BlockMeta = {
  label: string;
  icon: LucideIcon;
  color: string;
};

const blockMeta: Partial<Record<BlockType, BlockMeta>> = {
  dialog: { label: "گفت‌وگو", icon: MessageCircle, color: "#7c5cff" },
  image: { label: "تصویر", icon: ImageIcon, color: "#16b8a6" },
  quiz: { label: "آزمون", icon: HelpCircle, color: "#ff8a55" },
  story: { label: "داستان", icon: BookOpen, color: "#f59e0b" },
  reward: { label: "جایزه", icon: Star, color: "#ec4899" },
  animation: { label: "انیمیشن", icon: Eye, color: "#8b5cf6" },
  video: { label: "ویدیو", icon: Eye, color: "#ef4444" },
  drag_drop: { label: "کشیدن و رها کردن", icon: GripVertical, color: "#06b6d4" },
  decision_tree: { label: "درخت تصمیم", icon: GitBranch, color: "#f59e0b" },
  basket_game: { label: "بازی سبد", icon: ShoppingBasket, color: "#f59e0b" },
  coin_hunt: { label: "شکار سکه", icon: Coins, color: "#f59e0b" },
  memory_financial: { label: "حافظه مالی", icon: Brain, color: "#7c5cff" },
};

function safeParse(json: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function isValidPayload(json: string) {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

const fieldClass =
  "h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-[#7c5cff] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,255,0.08)]";

const textareaClass =
  "w-full resize-y rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-[#7c5cff] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,255,0.08)]";

function FieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-1.5 block text-xs font-black text-slate-500">
      {children}
    </span>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={fieldClass}
        dir="ltr"
      />
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b-2 border-slate-100 pb-5 last:border-b-0 last:pb-0">
      <p className="mb-4 text-xs font-black text-slate-500">{title}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function OptionRow({
  index,
  text,
  isCorrect,
  onChangeText,
  onToggleCorrect,
  onRemove,
  canRemove,
}: {
  index: number;
  text: string;
  isCorrect: boolean;
  onChangeText: (v: string) => void;
  onToggleCorrect: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-center text-xs font-black text-slate-300">
        {index + 1}
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="متن گزینه"
        className={`flex-1 h-11 rounded-xl border-2 px-3 text-sm font-bold outline-none transition-all placeholder:font-medium placeholder:text-slate-400 ${
          isCorrect
            ? "border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
            : "border-slate-200 bg-slate-50 focus:border-[#7c5cff] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,92,255,0.08)]"
        }`}
      />
      <button
        type="button"
        onClick={onToggleCorrect}
        title={isCorrect ? "حذف پاسخ صحیح" : "تنظیم به\u200Cعنوان پاسخ صحیح"}
        className={`grid size-11 shrink-0 place-items-center rounded-xl border-2 transition-all ${
          isCorrect
            ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_3px_0_#059669]"
            : "border-slate-200 bg-white text-slate-300 hover:border-emerald-300 hover:text-emerald-500"
        }`}
      >
        <Check size={18} strokeWidth={3.5} />
      </button>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          title="حذف گزینه"
          className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-red-100 bg-white text-red-300 transition-all hover:border-red-300 hover:text-red-500"
        >
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );
}

function DialogForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  return (
    <Section title="تنظیمات گفت‌وگو">
      <label className="block">
        <FieldLabel>شخصیت</FieldLabel>
        <select
          value={String(payload.character ?? "fox")}
          onChange={(e) => onChange({ ...payload, character: e.target.value })}
          className={fieldClass}
        >
          <option value="fox">روباه</option>
          <option value="owl">جغد</option>
          <option value="bear">خرس</option>
        </select>
      </label>
      <label className="block">
        <FieldLabel>متن گفت‌وگو</FieldLabel>
        <textarea
          rows={3}
          value={String(payload.text ?? "")}
          onChange={(e) => onChange({ ...payload, text: e.target.value })}
          placeholder="متن گفت‌وگو را وارد کنید..."
          className={textareaClass}
        />
      </label>
      <TextInput
        label="آدرس تصویر شخصیت (اختیاری)"
        value={String(payload.avatarUrl ?? "")}
        onChange={(v) => onChange({ ...payload, avatarUrl: v || undefined })}
        placeholder="https://..."
        dir="ltr"
      />
    </Section>
  );
}

function ImageForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  return (
    <Section title="تنظیمات تصویر">
      <TextInput
        label="آدرس تصویر"
        value={String(payload.url ?? "")}
        onChange={(v) => onChange({ ...payload, url: v })}
        placeholder="lessons/example.png"
        dir="ltr"
      />
      <TextInput
        label="توضیح تصویر (اختیاری)"
        value={String(payload.caption ?? "")}
        onChange={(v) => onChange({ ...payload, caption: v || undefined })}
        placeholder="توضیح آموزشی تصویر..."
      />
    </Section>
  );
}

function QuizForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  const options = useMemo(
    () =>
      (Array.isArray(payload.options) ? payload.options : []) as Array<{
        id: number;
        text: string;
        isCorrect: boolean;
        sortOrder: number;
      }>,
    [payload.options],
  );

  function addOption() {
    const maxId = options.reduce((m, o) => Math.max(m, o.id ?? 0), 0);
    const nextSort = options.length + 1;
    onChange({
      ...payload,
      options: [
        ...options,
        { id: maxId + 1, text: "", isCorrect: false, sortOrder: nextSort },
      ],
    });
  }

  function updateOption(index: number, patch: Partial<(typeof options)[number]>) {
    const updated = options.map((option, optionIndex) => {
      if (patch.isCorrect && optionIndex !== index) {
        return { ...option, isCorrect: false };
      }

      return optionIndex === index ? { ...option, ...patch } : option;
    });
    onChange({ ...payload, options: updated });
  }

  function removeOption(index: number) {
    const updated = options
      .filter((_, optionIndex) => optionIndex !== index)
      .map((option, optionIndex) => ({ ...option, sortOrder: optionIndex + 1 }));
    onChange({ ...payload, options: updated });
  }

  return (
    <Section title="تنظیمات آزمون">
      <NumberInput
        label="شناسه آزمون (quizId)"
        value={Number(payload.quizId ?? 1)}
        onChange={(v) => onChange({ ...payload, quizId: v })}
        min={1}
      />
      <TextInput
        label="سوال"
        value={String(payload.question ?? "")}
        onChange={(v) => onChange({ ...payload, question: v })}
        placeholder="متن سوال را وارد کنید..."
      />
      <TextInput
        label="توضیحات (اختیاری)"
        value={String(payload.description ?? "")}
        onChange={(v) => onChange({ ...payload, description: v || undefined })}
        placeholder="راهنمایی یا توضیح اضافه..."
      />
      <TextInput
        label="تصویر سوال (اختیاری)"
        value={String(payload.image ?? "")}
        onChange={(v) => onChange({ ...payload, image: v || undefined })}
        placeholder="https://..."
        dir="ltr"
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-500">گزینه‌ها</span>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 rounded-xl border-2 border-dashed border-slate-200 px-3 py-1.5 text-xs font-black text-slate-400 transition-all hover:border-[#7c5cff] hover:text-[#7c5cff]"
          >
            <Plus size={14} />
            افزودن گزینه
          </button>
        </div>
        {options.length === 0 && (
          <p className="py-4 text-center text-xs font-medium text-slate-400">
            هنوز گزینه‌ای اضافه نشده است.
          </p>
        )}
        <div className="space-y-2">
          {options.map((option, index) => (
            <OptionRow
              key={index}
              index={index}
              text={option.text}
              isCorrect={option.isCorrect}
              onChangeText={(text) => updateOption(index, { text })}
              onToggleCorrect={() =>
                updateOption(index, { isCorrect: !option.isCorrect })
              }
              onRemove={() => removeOption(index)}
              canRemove={options.length > 2}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

function StoryForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  return (
    <Section title="تنظیمات داستان">
      <TextInput
        label="عنوان داستان"
        value={String(payload.title ?? "")}
        onChange={(v) => onChange({ ...payload, title: v })}
        placeholder="عنوان داستان"
      />
      <label className="block">
        <FieldLabel>متن داستان</FieldLabel>
        <textarea
          rows={4}
          value={String(payload.text ?? "")}
          onChange={(e) => onChange({ ...payload, text: e.target.value })}
          placeholder="متن داستان را اینجا وارد کنید..."
          className={textareaClass}
        />
      </label>
    </Section>
  );
}

function RewardForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  return (
    <Section title="تنظیمات جایزه">
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="امتیاز (XP)"
          value={Number(payload.xp ?? 0)}
          onChange={(v) => onChange({ ...payload, xp: v })}
          min={0}
        />
        <NumberInput
          label="سکه"
          value={Number(payload.coins ?? 0)}
          onChange={(v) => onChange({ ...payload, coins: v })}
          min={0}
        />
      </div>
      <label className="block">
        <FieldLabel>پیام جایزه</FieldLabel>
        <textarea
          rows={2}
          value={String(payload.message ?? "")}
          onChange={(e) => onChange({ ...payload, message: e.target.value })}
          placeholder="آفرین! جایزه این مرحله را گرفتی."
          className={textareaClass}
        />
      </label>
    </Section>
  );
}

function MediaForm({
  payload,
  onChange,
  mediaType,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
  mediaType: "animation" | "video";
}) {
  const label = mediaType === "animation" ? "انیمیشن" : "ویدیو";
  const placeholder =
    mediaType === "animation" ? "animations/example.json" : "videos/example.mp4";
  return (
    <Section title={`تنظیمات ${label}`}>
      <TextInput
        label={`آدرس ${label}`}
        value={String(payload.url ?? "")}
        onChange={(v) => onChange({ ...payload, url: v })}
        placeholder={placeholder}
        dir="ltr"
      />
      <TextInput
        label="توضیح (اختیاری)"
        value={String(payload.caption ?? "")}
        onChange={(v) => onChange({ ...payload, caption: v || undefined })}
        placeholder="توضیح کوتاه..."
      />
    </Section>
  );
}

function DragDropForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  const items = useMemo(
    () => (Array.isArray(payload.items) ? payload.items : []) as string[],
    [payload.items],
  );
  const targets = useMemo(
    () => (Array.isArray(payload.targets) ? payload.targets : []) as string[],
    [payload.targets],
  );

  function addItem() {
    onChange({ ...payload, items: [...items, ""] });
  }
  function updateItem(index: number, value: string) {
    const updated = items.map((item, i) => (i === index ? value : item));
    onChange({ ...payload, items: updated });
  }
  function removeItem(index: number) {
    onChange({ ...payload, items: items.filter((_, i) => i !== index) });
  }

  function addTarget() {
    onChange({ ...payload, targets: [...targets, ""] });
  }
  function updateTarget(index: number, value: string) {
    const updated = targets.map((t, i) => (i === index ? value : t));
    onChange({ ...payload, targets: updated });
  }
  function removeTarget(index: number) {
    onChange({ ...payload, targets: targets.filter((_, i) => i !== index) });
  }

  return (
    <Section title="تنظیمات کشیدن و رها کردن">
      <label className="block">
        <FieldLabel>راهنما</FieldLabel>
        <textarea
          rows={2}
          value={String(payload.instruction ?? "")}
          onChange={(e) =>
            onChange({ ...payload, instruction: e.target.value })
          }
          placeholder="هر گزینه را در جای درست قرار بده."
          className={textareaClass}
        />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-500">
            گزینه‌های قابل کشیدن
          </span>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 rounded-xl border-2 border-dashed border-slate-200 px-3 py-1.5 text-xs font-black text-slate-400 transition-all hover:border-[#06b6d4] hover:text-[#06b6d4]"
          >
            <Plus size={14} />
            افزودن گزینه
          </button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical size={16} className="text-slate-300" />
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`گزینه ${i + 1}`}
              className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition-all focus:border-[#06b6d4] focus:bg-white"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-red-100 bg-white text-red-300 transition-all hover:border-red-300 hover:text-red-500"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-500">
            اهداف (مقصدها)
          </span>
          <button
            type="button"
            onClick={addTarget}
            className="flex items-center gap-1 rounded-xl border-2 border-dashed border-slate-200 px-3 py-1.5 text-xs font-black text-slate-400 transition-all hover:border-[#06b6d4] hover:text-[#06b6d4]"
          >
            <Plus size={14} />
            افزودن هدف
          </button>
        </div>
        {targets.map((target, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 text-center text-xs font-black text-slate-300">
              {i + 1}
            </span>
            <input
              type="text"
              value={target}
              onChange={(e) => updateTarget(i, e.target.value)}
              placeholder={`هدف ${i + 1}`}
              className="flex-1 h-11 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition-all focus:border-[#06b6d4] focus:bg-white"
            />
            <button
              type="button"
              onClick={() => removeTarget(i)}
              className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-red-100 bg-white text-red-300 transition-all hover:border-red-300 hover:text-red-500"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function BasketGameForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  const difficulty = (payload.difficulty ?? {}) as Record<string, unknown>;
  const scoring = (payload.scoring ?? {}) as Record<string, unknown>;

  function updateDifficulty(field: string, value: number) {
    onChange({ ...payload, difficulty: { ...difficulty, [field]: value } });
  }

  function updateScoring(field: string, value: number) {
    onChange({ ...payload, scoring: { ...scoring, [field]: value } });
  }

  function ConfigField({
    label,
    hint,
    value,
    onValueChange,
    min,
    max,
    step = 1,
  }: {
    label: string;
    hint: string;
    value: number;
    onValueChange: (value: number) => void;
    min: number;
    max?: number;
    step?: number;
  }) {
    return (
      <label className="block">
        <FieldLabel>{label}</FieldLabel>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onValueChange(Number(event.target.value))}
          className={fieldClass}
          dir="ltr"
        />
        <span className="mt-1.5 block text-xs font-medium leading-5 text-slate-400">
          {hint}
        </span>
      </label>
    );
  }

  return (
    <div className="space-y-5">
      <Section title="زمان‌بندی بازی">
        <ConfigField
          label="مدت بازی (ثانیه)"
          hint="مدت اولیه خط زمان؛ باید یک عدد صحیح بزرگ‌تر از صفر باشد."
          value={Number(payload.durationSeconds ?? 60)}
          onValueChange={(durationSeconds) => onChange({ ...payload, durationSeconds })}
          min={1}
        />
      </Section>
      <Section title="درجه سختی">
        <div className="grid gap-3 sm:grid-cols-2">
          <ConfigField label="فاصله ایجاد آیتم‌ها (میلی‌ثانیه)" hint="هرچه کمتر باشد، سکه و بمب سریع‌تر ظاهر می‌شوند." value={Number(difficulty.spawnIntervalMs ?? 800)} onValueChange={(value) => updateDifficulty('spawnIntervalMs', value)} min={1} />
          <ConfigField label="سرعت افتادن آیتم‌ها" hint="سرعت حرکت سکه‌ها و بمب‌ها به سمت پایین." value={Number(difficulty.fallingSpeed ?? 180)} onValueChange={(value) => updateDifficulty('fallingSpeed', value)} min={1} />
          <ConfigField label="سرعت حرکت بازیکن" hint="سرعت حرکت افقی سبد با کلیدهای جهت‌دار." value={Number(difficulty.playerSpeed ?? 300)} onValueChange={(value) => updateDifficulty('playerSpeed', value)} min={1} />
          <ConfigField label="احتمال نمایش بمب" hint="عددی بین صفر و یک؛ مثلاً ۰٫۲۵ یعنی ۲۵ درصد." value={Number(difficulty.bombChance ?? 0.25)} onValueChange={(value) => updateDifficulty('bombChance', value)} min={0} max={1} step={0.01} />
        </div>
      </Section>
      <Section title="امتیازدهی و جریمه">
        <div className="grid gap-3 sm:grid-cols-2">
          <ConfigField label="تعداد سکه برای هر امتیاز" hint="پس از جمع‌کردن این تعداد سکه، یک امتیاز ثبت می‌شود." value={Number(scoring.coinsPerPoint ?? 3)} onValueChange={(value) => updateScoring('coinsPerPoint', value)} min={1} />
          <ConfigField label="جریمه زمانی هر بمب (ثانیه)" hint="تعداد ثانیه‌ای که با گرفتن هر بمب از زمان کم می‌شود." value={Number(scoring.bombTimePenaltySeconds ?? 5)} onValueChange={(value) => updateScoring('bombTimePenaltySeconds', value)} min={0} />
        </div>
      </Section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Live Previews                                                     */
/* ------------------------------------------------------------------ */
const characterEmoji: Record<string, string> = {
  fox: "🦊",
  owl: "🦉",
  bear: "🐻",
  default: "🧑‍🏫",
};

function DialogPreview({ payload }: { payload: Record<string, unknown> }) {
  const avatar = characterEmoji[String(payload.character ?? "").toLowerCase()] ?? characterEmoji.default;
  const text = String(payload.text ?? "متن گفت‌وگو...");
  const hasAvatarUrl = !!payload.avatarUrl;

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative mb-4 grid size-20 shrink-0 place-items-center overflow-hidden rounded-[24px] bg-gradient-to-br from-[#ffd94a] to-[#ffaf36] text-5xl shadow-[0_5px_0_#e99320]">
        {hasAvatarUrl ? (
          <img
            src={String(payload.avatarUrl)}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          avatar
        )}
        <span className="absolute bottom-1.5 end-1.5 grid size-5 place-items-center rounded-full bg-white text-[#7c5cff] shadow">
          <MessageCircle size={11} className="fill-current" />
        </span>
      </div>
      <div className="relative w-full rounded-2xl border-2 border-[#ffe2a6] bg-[#fffaf0] p-3 shadow-[0_3px_0_#f4d48f]">
        <span className="absolute -top-2 start-10 size-4 rotate-45 border-s-2 border-t-2 border-[#ffe2a6] bg-[#fffaf0]" />
        <p className="text-sm font-bold leading-7 text-slate-700">{text}</p>
      </div>
    </div>
  );
}

function CoinHuntForm({ payload, onChange }: { payload: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const items = Array.isArray(payload.items) ? payload.items as Record<string, unknown>[] : [];
  const update = (index: number, key: string, value: unknown) => onChange({ ...payload, items: items.map((item, i) => i === index ? { ...item, [key]: value } : item) });
  const target = (payload.target ?? {}) as Record<string, unknown>;
  const scoring = (payload.scoring ?? {}) as Record<string, unknown>;
  return <Section title="تنظیمات شکار سکه">
    <TextInput label="عنوان بازی" value={String(payload.title ?? '')} onChange={(v) => onChange({ ...payload, title: v })} />
    <label className="block"><FieldLabel>راهنما</FieldLabel><textarea rows={2} value={String(payload.introduction ?? '')} onChange={(e) => onChange({ ...payload, introduction: e.target.value })} className={textareaClass} /></label>
    <div className="grid gap-3 sm:grid-cols-3">
      <NumberInput label="مدت (ثانیه)" value={Number(payload.duration ?? 60)} onChange={(v) => onChange({ ...payload, duration: v })} min={1} />
      <label className="block"><FieldLabel>نوع هدف</FieldLabel><select value={String(target.type ?? 'count')} onChange={(e) => onChange({ ...payload, target: { ...target, type: e.target.value } })} className={fieldClass}><option value="count">تعداد</option><option value="amount">مجموع ارزش</option><option value="item_value">ارزش آیتم</option></select></label>
      <NumberInput label="مقدار هدف" value={Number(target.value ?? 1)} onChange={(v) => onChange({ ...payload, target: { ...target, value: v } })} min={1} />
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <NumberInput label="امتیاز صحیح" value={Number(scoring.correct ?? 10)} onChange={(v) => onChange({ ...payload, scoring: { ...scoring, correct: v } })} />
      <NumberInput label="امتیاز اشتباه" value={Number(scoring.wrong ?? -2)} onChange={(v) => onChange({ ...payload, scoring: { ...scoring, wrong: v } })} />
    </div>
    <div className="space-y-3"><div className="flex items-center justify-between"><FieldLabel>آیتم‌ها</FieldLabel><button type="button" onClick={() => onChange({ ...payload, items: [...items, { id: `coin-${items.length + 1}`, value: 100, collectible: true }] })} className="text-xs font-black text-[#7c5cff]"><Plus size={14} className="inline" /> افزودن</button></div>
      {items.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border-2 border-slate-100 p-3 sm:grid-cols-[1fr_100px_auto]"><TextInput label="شناسه" value={String(item.id ?? '')} onChange={(v) => update(index, 'id', v)} dir="ltr" /><NumberInput label="ارزش" value={Number(item.value ?? 0)} onChange={(v) => update(index, 'value', v)} min={0} /><button type="button" aria-label="حذف آیتم" onClick={() => onChange({ ...payload, items: items.filter((_, i) => i !== index) })} className="self-end rounded-xl p-3 text-rose-500"><Trash2 size={17} /></button><label className="flex items-center gap-2 text-xs font-bold text-slate-500"><input type="checkbox" checked={item.collectible !== false} onChange={(e) => update(index, 'collectible', e.target.checked)} /> قابل جمع‌آوری</label></div>)}
    </div>
  </Section>;
}

function MemoryFinancialForm({ payload, onChange }: { payload: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }) {
  const pairs = Array.isArray(payload.pairs) ? payload.pairs as Record<string, unknown>[] : [];
  const update = (index: number, side: 'first' | 'second', value: string) => onChange({ ...payload, pairs: pairs.map((pair, i) => i === index ? { ...pair, [side]: { ...(pair[side] as Record<string, unknown> ?? {}), type: value } } : pair) });
  return <Section title="تنظیمات حافظه مالی">
    <TextInput label="عنوان بازی" value={String(payload.title ?? '')} onChange={(v) => onChange({ ...payload, title: v })} />
    <label className="block"><FieldLabel>راهنما</FieldLabel><textarea rows={2} value={String(payload.introduction ?? '')} onChange={(e) => onChange({ ...payload, introduction: e.target.value })} className={textareaClass} /></label>
    <NumberInput label="حداکثر تلاش (اختیاری)" value={Number(payload.maxAttempts ?? 0)} onChange={(v) => onChange({ ...payload, maxAttempts: v || undefined })} min={1} />
    <div className="space-y-3"><div className="flex items-center justify-between"><FieldLabel>جفت‌ها</FieldLabel><button type="button" onClick={() => onChange({ ...payload, pairs: [...pairs, { id: `pair-${pairs.length + 1}`, first: { type: '' }, second: { type: '' } }] })} className="text-xs font-black text-[#7c5cff]"><Plus size={14} className="inline" /> افزودن جفت</button></div>
      {pairs.map((pair, index) => <div key={index} className="grid gap-2 rounded-xl border-2 border-slate-100 p-3 sm:grid-cols-2"><TextInput label={`جفت ${index + 1} - کارت اول`} value={String((pair.first as Record<string, unknown> | undefined)?.type ?? '')} onChange={(v) => update(index, 'first', v)} /><TextInput label="کارت دوم" value={String((pair.second as Record<string, unknown> | undefined)?.type ?? '')} onChange={(v) => update(index, 'second', v)} /><button type="button" onClick={() => onChange({ ...payload, pairs: pairs.filter((_, i) => i !== index) })} className="text-start text-xs font-black text-rose-500"><Trash2 size={15} className="inline" /> حذف جفت</button></div>)}
    </div>
  </Section>;
}

type DecisionStep = {
  id: string;
  question: string;
};

function DecisionTreeForm({
  payload,
  onChange,
}: {
  payload: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
}) {
  const steps: DecisionStep[] = Array.isArray(payload.steps)
    ? payload.steps.map((item, index) => {
        const step = item as Record<string, unknown>;
        return {
          id: String(step.id ?? `step-${index + 1}`),
          question: String(step.question ?? ""),
        };
      })
    : [];
  const correctOrderRecord = (payload.correctOrder ?? {}) as Record<
    string,
    unknown
  >;
  const scoring = (payload.scoring ?? {}) as Record<string, unknown>;
  const storedOrder = Array.isArray(correctOrderRecord.steps)
    ? correctOrderRecord.steps.map(String)
    : [];
  const stepIds = steps.map((step) => step.id);
  const correctOrder = [
    ...storedOrder.filter((id) => stepIds.includes(id)),
    ...stepIds.filter((id) => !storedOrder.includes(id)),
  ];

  function commit(nextSteps: DecisionStep[], nextOrder = correctOrder) {
    onChange({
      steps: nextSteps,
      correctOrder: { steps: nextOrder },
      scoring: { correct: Number(scoring.correct ?? 1) },
    });
  }

  function addStep() {
    let suffix = steps.length + 1;
    let id = `step-${suffix}`;
    while (stepIds.includes(id)) {
      suffix += 1;
      id = `step-${suffix}`;
    }

    commit(
      [...steps, { id, question: "" }],
      [...correctOrder, id],
    );
  }

  function updateStep(index: number, patch: Partial<DecisionStep>) {
    const previousId = steps[index].id;
    const nextId = patch.id ?? previousId;
    const nextSteps = steps.map((step, stepIndex) => {
      const updated = stepIndex === index ? { ...step, ...patch } : step;
      return updated;
    });
    const nextOrder = correctOrder.map((id) =>
      id === previousId ? nextId : id,
    );
    commit(nextSteps, nextOrder);
  }

  function removeStep(index: number) {
    const removedId = steps[index].id;
    const nextSteps = steps.filter((_, stepIndex) => stepIndex !== index);
    commit(
      nextSteps,
      correctOrder.filter((id) => id !== removedId),
    );
  }

  function moveOrder(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= correctOrder.length) return;
    const nextOrder = [...correctOrder];
    [nextOrder[index], nextOrder[destination]] = [
      nextOrder[destination],
      nextOrder[index],
    ];
    commit(steps, nextOrder);
  }

  return (
    <div className="space-y-5">
      <Section title="مرحله‌های تصمیم‌گیری">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold leading-6 text-slate-400">
            هر بلوک تصمیم یک شناسه یکتا و متن قابل نمایش برای بازیکن دارد.
          </p>
          <button
            type="button"
            onClick={addStep}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 transition hover:bg-amber-100"
          >
            <Plus size={15} />
            افزودن مرحله
          </button>
        </div>

        {steps.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
            <GitBranch className="mx-auto mb-2 text-amber-400" size={30} />
            <p className="text-sm font-black text-slate-600">هنوز مرحله‌ای ساخته نشده است.</p>
          </div>
        )}

        {steps.map((step, stepIndex) => (
          <div
            key={`${step.id}-${stepIndex}`}
            className="rounded-2xl border-2 border-amber-100 bg-[#fffdf7] p-4"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-amber-500 text-sm font-black text-white">
                  {stepIndex + 1}
                </span>
                <p className="text-sm font-black text-slate-700">مرحله {stepIndex + 1}</p>
              </div>
              <button
                type="button"
                onClick={() => removeStep(stepIndex)}
                aria-label={`حذف مرحله ${stepIndex + 1}`}
                className="grid size-9 place-items-center rounded-xl border-2 border-rose-100 bg-white text-rose-400 transition hover:border-rose-300 hover:text-rose-600"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid gap-3">
              <TextInput
                label="شناسه مرحله"
                value={step.id}
                onChange={(value) => updateStep(stepIndex, { id: value })}
                placeholder="pay-debt"
                dir="ltr"
              />
              <label className="block">
                <FieldLabel>متن تصمیم</FieldLabel>
                <textarea
                  rows={4}
                  value={step.question}
                  onChange={(event) =>
                    updateStep(stepIndex, { question: event.target.value })
                  }
                  placeholder="مثلاً: اول قرضم را پرداخت می‌کنم"
                  className={`${textareaClass} min-h-28`}
                />
              </label>
            </div>
          </div>
        ))}
      </Section>

      <Section title="ترتیب پاسخ صحیح">
        <p className="text-xs font-bold leading-6 text-slate-400">
          مرحله‌ها را با فلش‌ها در ترتیب صحیح قرار دهید.
        </p>
        {correctOrder.map((id, index) => {
          const step = steps.find((item) => item.id === id);
          return (
            <div
              key={`${id}-${index}`}
              className="flex items-center gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 p-3"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#7c5cff] text-xs font-black text-white">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm font-bold leading-6 text-slate-700">
                {step?.question || id}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveOrder(index, -1)}
                  aria-label="انتقال به بالا"
                  className="grid size-8 place-items-center rounded-lg bg-white text-slate-500 disabled:opacity-30"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  disabled={index === correctOrder.length - 1}
                  onClick={() => moveOrder(index, 1)}
                  aria-label="انتقال به پایین"
                  className="grid size-8 place-items-center rounded-lg bg-white text-slate-500 disabled:opacity-30"
                >
                  <ArrowDown size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="امتیازدهی">
        <NumberInput
          label="امتیاز ترتیب صحیح"
          value={Number(scoring.correct ?? 1)}
          onChange={(value) =>
            onChange({
              steps,
              correctOrder: { steps: correctOrder },
              scoring: { correct: value },
            })
          }
          min={0}
        />
      </Section>
    </div>
  );
}

function DecisionTreePreview({ payload }: { payload: Record<string, unknown> }) {
  const steps = Array.isArray(payload.steps)
    ? (payload.steps as Record<string, unknown>[])
    : [];
  const correctOrder = (payload.correctOrder ?? {}) as Record<string, unknown>;
  const orderedIds = Array.isArray(correctOrder.steps)
    ? correctOrder.steps.map(String)
    : [];
  const lesson = (payload.lesson ?? {}) as Record<string, unknown>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-black text-amber-700">
        <GitBranch size={17} />
        مسیر صحیح تصمیم‌گیری
      </div>
      <div className="space-y-2">
        {orderedIds.map((id, index) => {
          const step = steps.find((item) => String(item.id) === id);
          return (
            <div key={`${id}-${index}`}>
              <div className="flex items-center gap-2 rounded-xl border-2 border-amber-100 bg-white p-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-500 text-xs font-black text-white">
                  {index + 1}
                </span>
                <p className="text-xs font-bold leading-6 text-slate-600">
                  {String(step?.question ?? id)}
                </p>
              </div>
              {index < orderedIds.length - 1 && (
                <ArrowDown className="mx-auto my-1 text-amber-300" size={16} />
              )}
            </div>
          );
        })}
        {orderedIds.length === 0 && (
          <p className="py-5 text-center text-xs font-bold text-slate-400">
            هنوز مسیری ساخته نشده است.
          </p>
        )}
      </div>
      {Boolean(lesson.lesson) && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold leading-6 text-emerald-700">
          {String(lesson.lesson)}
        </p>
      )}
    </div>
  );
}

function GamePreview({ payload, type }: { payload: Record<string, unknown>; type: 'coin_hunt' | 'memory_financial' }) {
  if (type === 'coin_hunt') {
    const items = Array.isArray(payload.items) ? payload.items as Record<string, unknown>[] : [];
    return <div className="grid grid-cols-3 gap-2 p-4">{items.map((item, i) => <div key={i} className="rounded-xl bg-amber-50 p-3 text-center text-2xl">🪙<span className="block text-xs font-black">{String(item.value ?? 0)}</span></div>)}</div>;
  }
  const pairs = Array.isArray(payload.pairs) ? payload.pairs as Record<string, unknown>[] : [];
  if (!pairs.length) {
    return <p className="p-6 text-center text-xs font-bold text-slate-400">هنوز جفتی اضافه نشده است.</p>;
  }
  const sideLabel = (side: unknown, fallback: string) => {
    const value = (side ?? {}) as Record<string, unknown>;
    return typeof value.type === 'string' && value.type.trim() ? value.type : fallback;
  };
  return (
    <div className="space-y-2 p-4">
      {pairs.map((pair, i) => (
        <div key={i} className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-violet-50 p-3 text-center text-xs font-black text-violet-700">{sideLabel(pair.first, 'کارت اول')}</div>
          <div className="rounded-xl bg-violet-50 p-3 text-center text-xs font-black text-violet-700">{sideLabel(pair.second, 'کارت دوم')}</div>
        </div>
      ))}
    </div>
  );
}

function ImagePreview({ payload }: { payload: Record<string, unknown> }) {
  const url = String(payload.url ?? "");
  const caption = String(payload.caption ?? "");

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative mb-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-3 border-[#d9d0ff] bg-[#f7f5ff]">
        <ImageIcon className="text-[#7c5cff]/20" size={36} />
        {url && (
          <img
            src={url}
            alt="preview"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>
      {caption && (
        <div className="w-full rounded-xl bg-slate-50 px-4 py-2.5 text-center">
          <p className="text-xs font-bold text-slate-500">{caption}</p>
        </div>
      )}
    </div>
  );
}

function QuizPreview({ payload }: { payload: Record<string, unknown> }) {
  const question = String(payload.question ?? "متن سوال...");
  const options = (Array.isArray(payload.options) ? payload.options : []) as Array<{
    text: string;
    isCorrect: boolean;
  }>;

  return (
    <div className="p-4">
      <div className="mb-3 flex items-start gap-2">
        <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#fff0e9] text-[#ff8a55]">
          <HelpCircle size={17} />
        </div>
        <p className="text-sm font-black text-slate-700 leading-7">{question}</p>
      </div>
      <div className="space-y-2">
        {options.length === 0 && (
          <p className="py-3 text-center text-xs text-slate-400">بدون گزینه</p>
        )}
        {options.map((opt, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-xs font-bold ${
              opt.isCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-100 bg-white text-slate-500"
            }`}
          >
            <span className="grid size-5 place-items-center rounded-full border-2 border-current text-[10px] font-black">
              {i + 1}
            </span>
            {opt.text || `گزینه ${i + 1}`}
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryPreview({ payload }: { payload: Record<string, unknown> }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border-2 border-amber-100 bg-[#fffdf5] p-4">
        <p className="mb-1 text-sm font-black text-amber-600">
          {String(payload.title ?? "عنوان داستان...")}
        </p>
        <p className="text-xs font-medium leading-7 text-slate-600">
          {String(payload.text ?? "متن داستان...")}
        </p>
      </div>
    </div>
  );
}

function RewardPreview({ payload }: { payload: Record<string, unknown> }) {
  return (
    <div className="flex flex-col items-center p-5">
      <div className="mb-3 grid size-16 place-items-center rounded-[20px] bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-[0_5px_0_#d97706]">
        <Star size={30} className="fill-white" />
      </div>
      <p className="mb-3 text-sm font-black text-slate-700">
        {String(payload.message ?? "پیام جایزه...")}
      </p>
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-[#f0e6ff] px-4 py-1.5 text-xs font-black text-[#7c5cff]">
          ✦ {String(payload.xp ?? 0)} XP
        </span>
        <span className="rounded-full bg-[#fff7d6] px-4 py-1.5 text-xs font-black text-[#d99100]">
          🪙 {String(payload.coins ?? 0)} سکه
        </span>
      </div>
    </div>
  );
}

function MediaPreview({
  payload,
  mediaType,
}: {
  payload: Record<string, unknown>;
  mediaType: "animation" | "video";
}) {
  const label = mediaType === "animation" ? "انیمیشن" : "ویدیو";
  const caption = String(payload.caption ?? "");
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative mb-3 flex h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
        <div className="text-center">
          <Eye size={32} className="mx-auto text-slate-300" />
          <p className="mt-1 text-xs font-bold text-slate-400">
            پیش‌نمایش {label}
          </p>
          <p className="mt-1 max-w-[200px] truncate text-[10px] text-slate-300" dir="ltr">
            {String(payload.url ?? "...")}
          </p>
        </div>
      </div>
      {caption && (
        <p className="text-xs font-bold text-slate-500">
          {caption}
        </p>
      )}
    </div>
  );
}

function DragDropPreview({ payload }: { payload: Record<string, unknown> }) {
  const items = (Array.isArray(payload.items) ? payload.items : []) as string[];
  const targets = (Array.isArray(payload.targets) ? payload.targets : []) as string[];
  return (
    <div className="p-4">
      <p className="mb-3 text-xs font-bold text-slate-500">
        {String(payload.instruction ?? "راهنما...")}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {(items.length > 0 ? items : ["گزینه ۱", "گزینه ۲"]).map((item, i) => (
          <span
            key={i}
            className="cursor-grab rounded-xl border-2 border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 shadow-sm"
          >
            {String(item)}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {(targets.length > 0 ? targets : ["هدف ۱", "هدف ۲"]).map((target, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-400"
          >
            {String(target)}
          </div>
        ))}
      </div>
    </div>
  );
}

function BasketGamePreview({ payload }: { payload: Record<string, unknown> }) {
  const scoring = (payload.scoring ?? {}) as Record<string, unknown>;
  return (
    <div className="p-4">
      <div className="relative h-52 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-50">
        <span className="absolute start-[18%] top-7 text-3xl">🪙</span>
        <span className="absolute end-[20%] top-14 text-3xl">💣</span>
        <span className="absolute bottom-3 start-1/2 -translate-x-1/2 text-5xl">🧺</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black">
        <span className="rounded-xl bg-sky-50 p-2 text-sky-700">⏱ {String(payload.durationSeconds ?? 60)}</span>
        <span className="rounded-xl bg-amber-50 p-2 text-amber-700">🪙 ۰</span>
        <span className="rounded-xl bg-violet-50 p-2 text-violet-700">هر {String(scoring.coinsPerPoint ?? 3)} سکه</span>
      </div>
    </div>
  );
}

function LivePreview({
  blockType,
  payload,
}: {
  blockType: BlockType;
  payload: Record<string, unknown>;
}) {
  const meta = blockMeta[blockType] ?? { label: blockType, icon: BookOpen, color: '#7c5cff' };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-[0_12px_40px_rgba(38,61,89,0.08)]">
      <div
        className="flex items-center gap-2 px-4 py-3 text-white"
        style={{ backgroundColor: meta.color }}
      >
        <meta.icon size={17} />
        <span className="text-sm font-black">پیش‌نمایش {meta.label}</span>
      </div>
      <div className="min-h-[160px]">
        {blockType === "dialog" && <DialogPreview payload={payload} />}
        {blockType === "image" && <ImagePreview payload={payload} />}
        {blockType === "quiz" && <QuizPreview payload={payload} />}
        {blockType === "story" && <StoryPreview payload={payload} />}
        {blockType === "reward" && <RewardPreview payload={payload} />}
        {blockType === "animation" && <MediaPreview payload={payload} mediaType="animation" />}
        {blockType === "video" && <MediaPreview payload={payload} mediaType="video" />}
        {blockType === "drag_drop" && <DragDropPreview payload={payload} />}
        {(blockType === "coin_hunt" || blockType === "memory_financial") && <GamePreview payload={payload} type={blockType} />}
        {blockType === "decision_tree" && <DecisionTreePreview payload={payload} />}
        {blockType === "basket_game" && <BasketGamePreview payload={payload} />}
      </div>
    </div>
  );
}

export default function BlockPayloadEditor({
  blockType,
  payloadJson,
  onPayloadChange,
  errors,
}: Props) {
  const [showRawJson, setShowRawJson] = useState(false);

  const payload = safeParse(payloadJson);
  const meta = blockMeta[blockType] ?? {
    label: blockType,
    icon: BookOpen,
    color: '#7c5cff',
  };
  const payloadIsValid = isValidPayload(payloadJson);

  function handleChange(patch: Record<string, unknown>) {
    onPayloadChange(JSON.stringify(patch, null, 2));
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-[#f8fafc]">
      <div className="flex flex-col gap-4 border-b-2 border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div
            className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
            style={{ backgroundColor: meta.color }}
          >
            {(() => {
              const BlockIcon = meta.icon;
              return <BlockIcon size={21} />;
            })()}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">محتوای بلوک</p>
            <p className="mt-1 text-xs font-bold text-slate-400">
              تنظیمات {meta.label} را تکمیل کنید.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1" aria-label="حالت ویرایش">
          <button
            type="button"
            onClick={() => payloadIsValid && setShowRawJson(false)}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-black transition-all ${
              !showRawJson
                ? "bg-white text-[#7c5cff] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FormInput size={15} />
            فرم دیداری
          </button>
          <button
            type="button"
            onClick={() => setShowRawJson(true)}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-black transition-all ${
              showRawJson
                ? "bg-white text-[#7c5cff] shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileJson size={15} />
            کد JSON
          </button>
        </div>
      </div>

      {errors.payload && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-xs font-bold leading-6 text-red-600 sm:mx-5">
          <AlertCircle className="mt-0.5 shrink-0" size={17} />
          {errors.payload}
        </div>
      )}

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 rounded-2xl bg-white p-4 sm:p-5">
          {showRawJson ? (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 text-xs font-bold ${payloadIsValid ? "text-emerald-600" : "text-red-500"}`}>
                <span className={`size-2 rounded-full ${payloadIsValid ? "bg-emerald-500" : "bg-red-500"}`} />
                {payloadIsValid ? "ساختار JSON معتبر است" : "ساختار JSON معتبر نیست؛ برای بازگشت به فرم آن را اصلاح کنید."}
              </div>
              <div className="relative">
                <FileJson
                  className="absolute end-4 top-4 text-[#7c5cff]"
                  size={20}
                />
                <textarea
                  dir="ltr"
                  rows={16}
                  value={payloadJson}
                  onChange={(e) => onPayloadChange(e.target.value)}
                  spellCheck={false}
                  aria-label="ویرایش کد JSON محتوای بلوک"
                  className={`w-full resize-y rounded-xl border-2 bg-[#fafaff] px-4 py-4 pe-11 font-mono text-sm leading-7 text-slate-700 outline-none transition-all focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,92,255,0.08)] ${payloadIsValid ? "border-slate-200 focus:border-[#7c5cff]" : "border-red-300 focus:border-red-400"}`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {blockType === "dialog" && (
                <DialogForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "image" && (
                <ImageForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "quiz" && (
                <QuizForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "story" && (
                <StoryForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "reward" && (
                <RewardForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "animation" && (
                <MediaForm
                  payload={payload}
                  onChange={handleChange}
                  mediaType="animation"
                />
              )}
              {blockType === "video" && (
                <MediaForm
                  payload={payload}
                  onChange={handleChange}
                  mediaType="video"
                />
              )}
              {blockType === "drag_drop" && (
                <DragDropForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "coin_hunt" && (
                <CoinHuntForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "memory_financial" && (
                <MemoryFinancialForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "decision_tree" && (
                <DecisionTreeForm payload={payload} onChange={handleChange} />
              )}
              {blockType === "basket_game" && (
                <BasketGameForm payload={payload} onChange={handleChange} />
              )}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-5 lg:self-start">
          <LivePreview blockType={blockType} payload={payload} />
        </aside>
      </div>
    </div>
  );
}
