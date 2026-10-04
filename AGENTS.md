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
