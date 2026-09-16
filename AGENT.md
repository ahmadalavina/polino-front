# Poolino Frontend — Maintainer Context

This file consolidates stable, codebase-specific knowledge for future agents. It complements the mandatory rules in `AGENTS.md`; read both before making changes. When API behavior is involved, `swagger.json` remains the source to verify before implementation because backend contracts can evolve.

## Product and UX

Poolino (پولینو) is a Persian financial-literacy platform for Iranian children aged 7–12. The experience is game-oriented, visually friendly, and deliberately simple.

- The application is RTL at the root (`lang="fa"`, `dir="rtl"`). Preserve Persian copy and use logical Tailwind direction utilities (`start/end`, `ps/pe`, `ms/me`) instead of physical left/right spacing and borders.
- Persian typography uses the local IranYekanX setup in `src/lib/fonts.ts`; allow generous line height for Persian text.
- Dates, when introduced, should use the Jalali/Shamsi calendar.
- Mobile and touch behavior are first-class requirements, especially for lesson games.

## Technology and Structure

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4.
- Zustand 5 is used for client state. Consume stores with selectors rather than subscribing to an entire store.
- Zod 4 is the validation standard for forms and untrusted payloads.
- UI motion/icons use Framer Motion, Lottie, and Lucide React. Do not add packages unless the existing stack cannot reasonably solve the task.
- The `@/*` TypeScript alias maps to `src/*`.
- `allowImportingTsExtensions` is enabled so Node-native TypeScript tests can import explicit `.ts` files.

Important directories:

- `src/app`: App Router pages and global layout.
- `src/components`: shared UI and the global `AuthGuard`.
- `src/features/admin-content`: course, lesson, and lesson-block authoring UI and validation.
- `src/features/lesson-payer`: lesson playback components. The directory name is intentionally/mistakenly spelled `payer`; use the existing path unless performing an explicitly requested migration.
- `src/features/basket-game`: framework-independent basket-game validation and calculation helpers.
- `src/features/lesson-tree`: course lesson-map presentation.
- `src/lib/api.ts`: centralized HTTP client and typed API facade.
- `src/store`: persisted authentication state and local game/reward state.
- `src/types`: shared API, admin, and lesson domain types.
- `tests`: focused Node test files; currently basket-game logic is tested with `node:test`.

## Routes and Main Workflows

- `/login`: mobile-number OTP authentication.
- `/`: profile/onboarding page for users without a completed profile.
- `/course`: course catalog. Admin users see a management shield linking to `/admin`.
- `/course/[id]`: course detail rendered as a lesson tree.
- `/lesson/[lessonId]`: fetches lesson play data and mounts `LessonPlayer`.
- `/admin`: course, lesson, and lesson-block content management; child users are denied by `AuthGuard`.

The root layout wraps every route in `AuthGuard`. Do not add separate route guards without considering interaction with this global guard.

## Authentication, Onboarding, and Roles

Authentication state lives in the persisted Zustand store `src/store/authStore.ts` under the key `poolino-auth`.

- Stored state includes access token, refresh token, profile, authentication flag, and an in-memory hydration flag.
- Tokens are also mirrored to `localStorage` keys `token` and `refreshToken` for compatibility with the API client.
- Guards must wait for Zustand persistence hydration before deciding that a session is absent; otherwise page reloads cause false redirects.
- OTP verification accepts wrapped or variant token field names, normalizes them in the login feature, then saves both access and refresh tokens.
- The profile-completion heuristic treats a profile as complete if it contains at least one of nickname, first/name, grade, or avatar. A missing profile/404 sends the user to `/`; a completed profile at `/` is sent to `/course`.
- Roles are `child` and `admin`, read from the profile response. A child attempting `/admin` is returned to the last recorded non-login/non-admin path, stored in `sessionStorage` as `poolino:last-path`, with `/course` as fallback.

Sensitive auth behavior:

- All authenticated requests go through `src/lib/api.ts` and carry `Authorization: Bearer <accessToken>` plus `Accept-Language: fa`.
- On the first `401`, the client calls `POST /auth/refresh` with `{ refreshToken }`, saves the rotated pair, and retries the original request exactly once.
- Concurrent `401` responses share one refresh promise. Do not replace this with per-request refresh calls.
- Refresh failure logs the user out; the refresh request itself must never enter the authenticated retry loop.
- The profile is currently loaded from `GET /users/me`. Verify against `swagger.json` and the live backend before moving role logic: Swagger may also expose `/auth/me`, and the backend must return `role` from whichever endpoint the frontend uses.

## API Conventions

- Base URL comes only from `NEXT_PUBLIC_API_BASE_URL`. Never hardcode an API origin.
- `src/lib/api.ts` is the single API boundary. Extend its typed facade rather than scattering raw `fetch` calls through components.
- Responses may be direct values or `{ data: value }`; `unwrapData` handles both shapes for relevant endpoints.
- Non-2xx responses become `ApiError` with the HTTP status and a backend-provided message when available.
- JSON bodies receive `Content-Type: application/json`; `204` responses and empty bodies are supported.
- Relative media paths are resolved against the same API base by `src/lib/media.ts`; absolute HTTP, data, and blob URLs pass through unchanged.

Frequently used endpoints include:

- `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/refresh`
- `GET/PATCH /users/me`
- `GET /courses`, `GET /courses/:id`, `POST /courses`
- `GET /lessons`, `POST /lessons`
- `POST /lesson-blocks`, `PATCH /lesson-blocks/:id`
- `GET /game/lessons/:id/play`
- `POST /game/blocks/:blockId/complete`, `GET /game/blocks/:blockId/result`

Always re-check endpoint schemas in `swagger.json` before API changes. Preserve the backend's exact nesting and do not send UI-only fields.

## Lesson Domain and Playback

The central definitions are in `src/types/lesson.ts`.

- A lesson contains ordered `LessonBlock` records with `id`, `type`, `payload`, optional `pageNumber`, and optional `sortOrder`.
- Supported block types include content blocks (`dialog`, `image`, `story`, `animation`, `video`, `reward`), activities (`quiz`, `drag_drop`, `drop_down`, `question_block`, `film_and_image`), and games (`coin_hunt`, `memory_financial`, `decision_tree`, `basket_game`). Some declared legacy types may not yet have dedicated player rendering; verify the renderer before assuming support.
- `LessonPlayer` sorts blocks by `pageNumber`, then `sortOrder`, and groups them into pages. It currently renders the first block of the active page. Be careful when changing page semantics because multiple blocks sharing a page may not all be visible.
- Activity correctness is accumulated for the result screen. Reward blocks and lesson reward fields feed local XP/coin results through `gameStore`.
- Add a new playable block in all relevant places: `BlockType`, payload types, admin selector/preset/editor/validation, `LessonPlayer` dispatch, API completion types if needed, and focused tests.
- Payloads originate from the backend and should be treated as untrusted. Interactive games should validate malformed/missing configuration and show a safe error state rather than crash.

## Admin Content Architecture

`AdminContentManager` manages three creation sections: courses, lessons, and lesson blocks. Zod schemas in `src/features/admin-content/schemas.ts` validate the outgoing form models. Lesson-block payloads are kept as serialized JSON in manager state; `BlockPayloadEditor` provides structured forms/previews and writes valid JSON back to that state.

- Course and lesson reference lists are fetched to establish relationships and populate selectors.
- A block creation request has exactly `lessonId`, `pageNumber`, `sortOrder`, `type`, and `payload`.
- Block type changes load a preset payload; structured forms must preserve existing values when editing/populating JSON.
- Type-specific payload validation belongs in `validateBlockPayload` or an extracted feature schema, not only in input attributes.
- Keep form-only display state out of submitted payloads.

Pitfall: block labels and presets currently exist both in `src/features/admin-content/constants.ts` and inside `AdminContentManager.tsx`. This duplication can drift. When adding or changing a block, inspect both sources; consolidate only as an explicit refactor, not as an unrelated cleanup.

## Decision Tree Contract

The decision-tree game teaches priority ordering. Its stable payload shape is:

```json
{
  "steps": [
    { "id": "pay-debt", "question": "اول قرضم را پرداخت می‌کنم" },
    { "id": "save", "question": "بعد پس‌انداز می‌کنم" },
    { "id": "spend", "question": "در آخر خرج می‌کنم" }
  ],
  "correctOrder": { "steps": ["pay-debt", "save", "spend"] },
  "scoring": { "correct": 1 }
}
```

Players arrange every step, explicitly request checking, and can retry after an incorrect order. Step question text is user-authored and can be long; admin and player layouts must display it without destructive truncation. Do not revive older `choices`, `lesson`, `wrong`, or `maxScore` fields in submitted payloads unless the backend contract changes. Note that some legacy presets may still contain these obsolete fields, so inspect payload construction carefully.

## Basket Game Contract and Mechanics

Basket-game reusable logic is intentionally separated into `src/features/basket-game/basketGame.ts`; keep calculations and validation there rather than embedding them in a page component.

Payload:

```json
{
  "durationSeconds": 60,
  "difficulty": {
    "spawnIntervalMs": 800,
    "fallingSpeed": 180,
    "playerSpeed": 300,
    "bombChance": 0.25
  },
  "scoring": {
    "coinsPerPoint": 3,
    "bombTimePenaltySeconds": 5
  }
}
```

Validation requires positive duration (integer), spawn/falling/player values greater than zero, bomb chance in `[0,1]`, positive integer coins per point, and a non-negative integer bomb penalty.

Gameplay rules:

- Local score is `floor(coinsCollected / coinsPerPoint)`; the frontend displays it but never submits a final score.
- Remaining time is `max(0, duration - realElapsedTime - accumulatedBombPenalty)`.
- Real elapsed time excludes bomb penalties. Completion occurs when real elapsed time plus penalties reaches duration.
- Completion is submitted once to `/game/blocks/:blockId/complete` as:

```json
{
  "gameType": "basket_game",
  "basketCoinsCollected": 10,
  "basketBombsHit": 2,
  "basketElapsedSeconds": 50
}
```

- All submitted counters are non-negative integers. The backend owns final score/reward calculation.
- The component supports pointer drag/touch and arrow keys, clamps movement to the game area, removes caught/off-screen objects, and cleans animation frames, listeners, and transient state on finish/unmount.
- Animation callbacks use refs for live counters to avoid stale React closures, and a submission ref prevents duplicate completion requests.
- In RTL containers, pixel-positioned game objects need an explicit physical origin (`left: 0`, plus `top` or `bottom`) before `translate3d`; omitting it can place the basket, coins, and bombs outside the right edge.
- Overlay actions must not let the game-area pointer handler capture their pointer events; pointer capture should occur only while actively playing.

## State and Reward Caveats

`gameStore` holds local `coins`, `xp`, and `hearts` and exposes mutation methods. These values are frontend session state and are separate from authoritative backend game completion responses. Avoid silently conflating the two reward sources. The store currently contains historical TypeScript suppressions in spend methods; do not copy that pattern into new code.

## Testing and Verification

- Do not automatically run linting or formatting; `AGENTS.md` explicitly leaves those to IDE/pre-commit/build tooling unless the user requests them.
- Type checking: `node_modules/.bin/tsc.cmd --noEmit` in PowerShell.
- Production build: use `npm.cmd run build` because PowerShell execution policy may block `npm.ps1`.
- Basket-focused tests: `node --experimental-strip-types --test tests/basket-game.test.ts`.
- Test interactive logic through extracted pure helpers where practical, plus a focused renderer/contract check.
- Git commands may report unsafe repository ownership in this environment. Do not change global Git configuration merely to inspect status; preserve unrelated user changes and use direct file inspection when necessary.

## Change Discipline

- Make narrowly scoped changes and preserve existing API contracts unless the task explicitly changes one.
- Do not modify unrelated features while adding a block or game.
- Use `apply_patch` for manual file edits.
- Treat existing worktree modifications as user-owned.
- For timers, animation frames, keyboard/pointer handlers, and asynchronous effects, implement cleanup and cancellation guards.
- Prefer shared typed helpers and discriminated unions over `any`; avoid unsafe payload assertions where validation can establish the type.
