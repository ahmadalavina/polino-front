# Agent Context: Project Poolino (پولینو)

This document provides context, technical specifications, and development guidelines for the **Poolino (پولینو)** frontend project. Read and follow these rules strictly when generating code, suggesting refactors, or creating new components.

---

## 1. Project Overview
- **Name:** Poolino (پولینو)
- **Goal:** A gamified financial literacy mobile game & platform for children aged 7 to 12.
- **Target Audience:** Iranian children (7-12 years) and their parents. The UI must be highly engaging, friendly, child-appropriate, and simple.
- **Language & Direction:** Persian (Farsi) - 100% Right-to-Left (RTL).
- **Calendar & Date:** Jalali (Shamsi / شمسی) calendar system.

---

## 2. Tech Stack & Architecture
- **Framework:** Next.js (App Router preferred, using React under the hood).
- **Project Structure:** Greenfield project. The structure is flexible, but prioritize clean organization:
  - `/components` for reusable UI elements.
  - `/store` for state management.
  - `/hooks` for reusable React hooks.
  - `/app` for pages, routing, and layouts.
- **State Management:** Zustand (lightweight, hook-based state).
- **Styling:** Tailwind CSS.
- **Form Validation (Standard):** Zod (for schema validation and safe parsing).
- **Backend Integration:** Currently TBD/Postponed (focus on frontend mock states/Zustand first).

---

## 3. Core Coding & Styling Rules

### A. RTL (Right-to-Left) & Tailwind
- **Directional Utilities:** Always use logical (directional) Tailwind classes instead of physical ones to ensure native RTL support:
  - Use `ps-*` and `pe-*` instead of `pl-*` and `pr-*`.
  - Use `ms-*` and `me-*` instead of `ml-*` and `mr-*`.
  - Use `rounded-s-*` and `rounded-e-*` instead of `rounded-l-*` and `rounded-r-*`.
  - Use `border-s` and `border-e` instead of `border-l` and `border-r`.
  - Use `space-x-reverse` when using horizontal spacing flex wrappers (`space-x-*`).
- **Font & Typography:** Use custom Persian web fonts (like IRANSans, Vazirmatn, or Estedad). Ensure line heights (`leading-*`) are adjusted for Persian text rendering, which often requires slightly more vertical space than English.

### B. State Management (Zustand)
- Store logic should be kept simple and modular in the `/store` directory.
- Always use the selector pattern when consuming state to prevent unnecessary re-renders:
```javascript
  const coins = useGameStore((state) => state.coins);
  
### C. Tooling & Workspace Rules

- No Automatic Linting/Formatting on Commands: Do NOT run npm run lint, eslint, or formatter commands automatically after generating code or running commands. Let the local IDE setup or the pre-commit/build pipelines handle formatting and linting. Keep command execution clean and lightweight.

---

## 4. Backend Integration
- **API Documentation:** Full Swagger (OpenAPI) docs are in `swagger.json` at the project root. Always check it for endpoint paths, request/response schemas, and parameters before implementing any API call.
- **Base URL:** Read from `NEXT_PUBLIC_API_BASE_URL` in `.env`. Never hardcode it.
- **Auth:** set mock JWT in the `Authorization: Bearer <token>` header on all authenticated requests.

### Parent IDs on Update (Content Hierarchy)

The content hierarchy is **Course → Lesson → LessonBlock**. When updating a child entity, the request body must always include its parent identifier; never strip it because it is "unchanged".

- `PATCH /lessons/{id}` must send `courseId`.
- `PATCH /lesson-blocks/{id}` must send `lessonId`.
- `PATCH /courses/{id}` has no parent.

Response shapes do not always use the flat parent key:

- `GET /lessons` returns `LessonSummaryResponseDto`, which may expose the parent as either `courseId` or a nested `course` object. Normalize `courseId = courseId ?? course?.id` when loading references, and resolve it the same way in edit handlers.
- `GET /lesson-blocks` returns `LessonBlockResponseDto` with **no flat `lessonId`**; the parent only exists as the nested `lesson` object (`block.lesson.id` / `block.lesson.courseId`). Read the parent from `block.lessonId ?? block.lesson?.id` when editing a block.
- Because `GET /lesson-blocks` nests the parent, do not assume `AdminLessonBlockOption.lessonId` is directly populated from the API response; keep the optional `lesson` fallback in the type.

Edit flows must fail loudly when a required parent ID is missing instead of silently omitting it from the PATCH body. `AdminContentManager` validates `courseId`/`lessonId` before submitting lesson and block edits.

---

## 5. Play / Lesson Block System

The child "play" experience has **no `/play` route**. It lives at `/lesson/[lessonId]`:

- `src/app/lesson/[lessonId]/page.tsx` loads `api.getLessonPlay(id)` and renders `<LessonPlayer>`.
- `src/features/lesson-payer/component/LessonPlayer.tsx` is the dispatcher. Note the directory is misspelled **`lesson-payer`** (not `lesson-player`).
- `renderBlock()` switches on `block.type`; blocks are grouped into pages by `pageNumber` and sorted by `sortOrder`. All blocks sharing a page render at once.
- Game components submit via `api.completeGame(blockId, dto)` (`POST /game/blocks/{blockId}/complete`) and read results via `api.getGameResult` (`GET /game/blocks/{blockId}/result`). A `GET /game/lessons/{id}/play` returns blocks with `{ id, type, payload, pageNumber?, sortOrder? }`.

### Block type coverage gaps

`BlockType` (`src/types/lesson.ts`) now has 17 values. Coverage is inconsistent:

- **No play case (falls to the generic default placeholder):** `drop_down`, `question_block`, `film_and_image`. They are selectable and savable in admin but do nothing in play.
- **Play case exists but not creatable in admin:** `auction` (missing from admin `blockTypeLabels`, `blockPresets`, and the Zod `type` enums in `schemas.ts`).
- **Stale backend contract:** swagger `CompleteGameDto.gameType` only lists `coin_hunt | memory_financial`; the frontend also sends `quiz`, `drag_drop`, `decision_tree`, `basket_game`, `auction` (hence `//@ts-ignore` / casts in `QuizBlock.tsx`, `DragDropBlock.tsx`, `DecisionTreeBlock.tsx`). swagger `LessonBlockType` also omits `decision_tree`, `basket_game`, `auction`.
- `src/features/admin-content/components/BlockTypeSelector.tsx` appears to be dead code (admin uses its own inline list in `AdminContentManager.tsx`).

### Two payload conventions coexist (admin writes `first`/`second`; legacy presets use `cardA`/`cardB`)

The block payload **visual editor is now the default in production**: `src/features/admin-content/AdminContentManager.tsx` imports `BlockPayloadEditor` and renders it. The raw-JSON textarea + `blockPresets` fallback (including `memory_financial_legacy`, `coin_hunt_legacy`) is legacy/fallback code. Only edit a payload's documented shape, and prefer the visual editor's fields.

### The card guessing game = `memory_financial` («حافظه مالی»)

There is no `card`/`flip`/`guess`/`flashcard` type; the card game is **`memory_financial`** (financial memory, pair matching).

- Renderer: `MemoryFinancialGame` in `src/features/lesson-payer/component/GameBlocks.tsx`.
- Validation: `src/features/memory-financial-game/memoryFinancialGame.ts` (`memoryFinancialPayloadSchema`, `parseMemoryFinancialPayload`, `memoryFinancialDefaults`) and `tests/memory-financial-game.test.ts`.
- Reference implementation for a "full" game: **`basket_game`** — `src/features/basket-game/basketGame.ts` (typed payload + Zod schema + parse helper + completion builder + submit guard) and `tests/basket-game.test.ts`.

**Gameplay (pair-matching memory):**

1. `payload.pairs` is flattened into two cards per pair: `first` → `<pairId>-a`, `second` → `<pairId>-b`; the visible face text is `first.type` / `second.type`.
2. Cards start face-down (`✦`) and flip via `rotateY` on click. Two open cards with the same `pairId` stay matched (✅, green); otherwise they flip back after 800 ms.
3. The game ends when every pair is matched; it then submits `{ gameType: 'memory_financial', matchedPairIds, attempts, mistakes, startedAt, completedAt }` to `POST /game/blocks/{blockId}/complete`. `mistakes` is approximated as `attempts - matched`.
4. **Card order is shuffled once at game start** (Fisher–Yates in `shuffleCards`) and held in `cards` state — it must NOT reshuffle during play, otherwise the `flipped`/`matched` logic breaks. The «شروع دوباره» button performs one fresh shuffle (new game) and resets `startedAt`.
- Payload written by `MemoryFinancialForm` (`BlockPayloadEditor.tsx`) / preset:
  ```jsonc
  { "title": "...", "introduction": "...", "maxAttempts": 0,
    "pairs": [ { "id": "saving", "first": { "type": "پس‌انداز" }, "second": { "type": "هدف" } } ] }
  ```
  `first.type` / `second.type` is the visible card label. The legacy `memory_financial_legacy` shape used `cardA`/`cardB` strings and is **incompatible** with the renderer (silently falls back to «کارت اول/دوم»).

Resolved points:

1. `MemoryFinancialPayload` (with `MemoryFinancialPair`/`MemoryFinancialCardSide`) is in the `LessonBlockPayload` union; `LessonPlayer` casts to `MemoryFinancialPayload` instead of an unsafe `Record<string, unknown>`.
2. Zod validation exists: `validateBlockPayload` (`schemas.ts`) routes `memory_financial` to `memoryFinancialPayloadSchema`. The legacy `cardA`/`cardB` shape is now rejected at save time.
3. Admin live preview (`GamePreview`) reads `first.type`/`second.type` and shows each pair.
4. `maxAttempts` is read by the renderer, counted per opened pair, and enforced with an out-of-attempts state.
5. `blockMeta` has `memory_financial`/`coin_hunt` entries with Persian labels.

Known incomplete points in `memory_financial` (remaining, fix target for "تکمیل اجرا"):

1. Cards render **text only** — no image/front/back model; the `rotateY` flip is cosmetic (both sides show `card.label`).
2. Auto-submit can race the initial `getGameResult` fetch (`GameBlocks.tsx`).

### Word search = `word_search` («جدول کلمات»)

- Renderer: `WordSearchBlock` in `src/features/lesson-payer/component/WordSearchBlock.tsx`; dispatched by `LessonPlayer`.
- Logic/validation: `src/features/word-search-game/wordSearchGame.ts` (`wordSearchPayloadSchema`, `parseWordSearchPayload`, `normalizeGrid`, `readWordSearchLine`, `createWordSearchSelection`, `createWordSearchCompletionRequest`, `wordSearchDefaults`) and `tests/word-search-game.test.ts`.
- Cell coordinates are **0-based** `{ row, col }`. Player selects `start`/`end`; the frontend never sends a direction.

**Two different payload shapes (important):**

- **Admin (write, `POST`/`PATCH /lesson-blocks`)** accepts `grid` as `string[][]` **or** `string[]` rows and `words` as `string[]` or `{ word, start?, direction? }[]`. `start`/`direction` are optional; if omitted the server finds the word. Server stores the canonical form (`grid: string[]`, each word with definitive `start`+`direction`).
- **Play (`GET /game/lessons/{id}/play`)** returns `payload.grid` as a `string[][]` character matrix and `payload.words` as a **plain `string[]`** — deliberately without `start`/`direction`. The renderer must not depend on answers.
- `allowReverse` defaults to `true`; `scoring.perWord` defaults to `10`, `scoring.maxScore` optional.

**Completion contract:**

- Submit via `wordSearchSelections: [{ word, start:{row,col}, end:{row,col} }]` (`createWordSearchCompletionRequest`). Order of `start`/`end` does not matter.
- `wordSearchFoundWords: string[]` still exists in `CompleteGameDto` for backward compatibility but is **untrusted/cheatable** — never use it. If `wordSearchSelections` is non-empty the server ignores the legacy field.
- `gameType` must equal `block.type` (`'word_search'`).
- Server validates each selection: line must be straight (Δrow==0, Δcol==0, or |Δrow|==|Δcol|), both endpoints in bounds, path characters must equal an allowed word (or its reverse when `allowReverse`), and normalized (spaces/ZWNJ stripped) to `selection.word`. `score = foundCount × perWord`, capped by `maxScore`; `completed = foundCount == totalWords && totalWords > 0`.
- Response `result` includes per-selection `matched` + `cells`, `foundWords`, `totalWords`, `foundCount`, `missedCount`. Re-completing overwrites the previous record.
- Reward eligibility is announced in the response (`reward.claimEndpoint`, e.g. `/rewards/lessons/{lessonId}/claim`); actual granting is a separate `POST /rewards/lessons/{lessonId}/claim` call. No frontend claim wiring exists yet.

**Compatibility:** legacy `word_search` blocks stored with the old shape (`grid: string[]` + `words[].cells`) are normalized on read, but `cells` is ignored, so the server may lack answer coordinates until the admin re-saves (PATCH) the block. Existing word-search blocks should be re-saved once. Normalize word comparisons with `normalizeWordSearchWord` (strips whitespace and `\u200c`).
