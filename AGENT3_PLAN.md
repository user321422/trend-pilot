# Agent 3: Writer Recommender — Implementation Plan

## Overview

Agent 3 upgrades the current basic writer sorter (which only sorts by `currentLoad`) into a
real AI-assisted writer recommendation engine. It analyses an approved content brief against
each writer's workload, historical assignment performance, and expertise signals, then returns
a ranked shortlist with match scores and plain-English reasoning — all surfaced in a fully
built-out **Assignments** page.

---

## Current State (Gap Analysis)

| Area | Current | Target |
|---|---|---|
| `recommendWriters` logic | Sort by `currentLoad`, return top 3 | AI-scored ranking with multi-factor weights |
| Writer data | `currentLoad` only | + `completedCount`, `avgReviewScore` fields |
| API response | Raw writer list | Ranked list with `matchScore` + `reasoning` |
| Frontend | Placeholder empty state | Interactive brief selector → writer cards |
| AI layer | `callQwenJSON` (brief & review only) | Reused for writer scoring prompt |

---

## Proposed Changes

---

### 1. Database — Prisma Schema

#### [MODIFY] schema.prisma

Add two new fields to the `User` model to track historical performance:

```prisma
completedCount  Int   @default(0)   // total assignments completed
avgReviewScore  Float @default(0.0) // average review score (0–100)
```

Run migration after:
```bash
npx prisma migrate dev --name add_writer_performance
```

#### [MODIFY] seed.js

Add `completedCount` and `avgReviewScore` to seeded writers so Agent 3 has realistic data to rank against:

```js
{ name: 'Alice Techwriter', completedCount: 12, avgReviewScore: 88.5, currentLoad: 1 },
{ name: 'Bob Marketer',     completedCount:  5, avgReviewScore: 71.0, currentLoad: 0 },
{ name: 'Charlie Overloaded', completedCount: 20, avgReviewScore: 82.0, currentLoad: 3 },
{ name: 'Diana Generalist', completedCount:  8, avgReviewScore: 79.5, currentLoad: 0 },
{ name: 'Evan Junior',      completedCount:  2, avgReviewScore: 65.0, currentLoad: 0 },
```

---

### 2. Backend — New Service

#### [NEW] backend/src/services/writerRecommender.js

A new dedicated service that:

1. Accepts a `brief` object and an array of `writers`
2. Builds a structured prompt for the Qwen AI
3. Calls `callQwenJSON` (reusing the existing shared AI layer in `qwen.js`)
4. Returns a ranked array of `{ writerId, matchScore, reasoning }`

**Scoring prompt design** — the prompt will instruct Qwen to weigh:
- **Workload** (lower `currentLoad` → higher availability score)
- **Track record** (`completedCount` + `avgReviewScore` → reliability score)
- **Topic fit** (match brief `seoKeywords` + `angle` against writer profile)

**Mock fallback** — if Qwen is unavailable, a deterministic local scorer runs the same
weighted formula in JavaScript, so the feature never breaks:

```
mockScore = (100 - currentLoad * 15) * 0.4
           + avgReviewScore           * 0.4
           + min(completedCount, 20)  * 0.5 * 0.2
```

---

### 3. Backend — Controller

#### [MODIFY] backend/src/controllers/assignmentController.js

Replace the current `recommendWriters` function body:

1. Fetch the approved brief (existing guard stays)
2. Fetch **all** writers including new fields: `id, name, email, currentLoad, completedCount, avgReviewScore`
3. Call `writerRecommender(brief, writers)` from the new service
4. Return enriched response:

```json
{
  "briefId": "...",
  "briefTitle": "...",
  "recommendations": [
    {
      "id": "writer-uuid",
      "name": "Alice Techwriter",
      "email": "alice@trendpilot.com",
      "currentLoad": 1,
      "completedCount": 12,
      "avgReviewScore": 88.5,
      "matchScore": 91,
      "reasoning": "Alice has the highest review score and moderate load, making her ideal for this SEO-heavy brief."
    }
  ]
}
```

---

### 4. Backend — Route

#### [MODIFY] backend/src/routes/assignments.js

Align the recommend route to use query params (matching the frontend `api.ts` call):

```
GET /assignments/recommend?briefId=<id>
was: GET /assignments/recommend/:briefId
```

> [!IMPORTANT]
> The existing `api.ts` calls `/assignments/recommend?briefId=...` as a query param. The backend currently uses `req.params.briefId`. This mismatch must be fixed.

---

### 5. Frontend — API Layer

#### [MODIFY] frontend/src/services/api.ts

Update `WriterRecommendation` type and `assignments.recommend` return type:

```ts
export interface WriterRecommendation {
  id: string;
  name: string;
  email: string;
  currentLoad: number;
  completedCount: number;
  avgReviewScore: number;
  matchScore: number;
  reasoning: string;
}

export interface RecommendResponse {
  briefId: string;
  briefTitle: string;
  recommendations: WriterRecommendation[];
}
```

---

### 6. Frontend — Assignments Page

#### [MODIFY] frontend/src/pages/Assignments.tsx

Replace the empty-state placeholder with a full interactive page:

**Layout:**
1. **Brief selector** — dropdown of all `APPROVED` briefs (fetched from `/briefs`)
2. **"Find Best Writer" button** — triggers `assignments.recommend(briefId)`
3. **Ranked writer cards** — one card per recommendation showing:
   - Writer name + email
   - `matchScore` as a coloured progress bar (green ≥ 80, amber 60–79, red < 60)
   - `currentLoad` badge (e.g. "2 active assignments")
   - `completedCount` and `avgReviewScore` as stat chips
   - `reasoning` as an italic AI quote block
   - **"Assign"** button → calls `assignments.create(briefId, writerId)`
4. **Existing assignments list** below — all assignments with status badges

**Design tokens used:** existing CSS vars `--surface-card`, `--ink`, `--muted`, `--hairline`, `--accent`

---

## Data Flow

```
[Briefs Page]
     │ Editor approves brief
     ▼
[Assignments Page]
     │ Select approved brief → click "Find Best Writer"
     ▼
GET /api/assignments/recommend?briefId=xxx
     │
     ▼
[assignmentController.js]
     │ Fetch brief + all writers from Prisma
     ▼
[writerRecommender.js]
     │ Build prompt with brief + writer profiles
     ▼
[qwen.js → callQwenJSON]  ──(fail)──▶ [local mock scorer]
     │
     ▼
Ranked [ { writerId, matchScore, reasoning } ]
     │
     ▼
[Assignments Page] — display ranked writer cards
     │
     ▼
POST /api/assignments  { briefId, writerId }
     │
     ▼
Assignment + Draft placeholder created (existing Prisma transaction)
```

---

## Verification Plan

### Automated
```bash
# Re-seed with new writer performance fields
cd backend && npm run db:seed

# Test recommend endpoint
curl http://localhost:3000/assignments/recommend?briefId=<id>
```

### Manual
- [ ] Login → Briefs → Approve a brief
- [ ] Go to Assignments → select the approved brief → click "Find Best Writer"
- [ ] Verify ranked cards appear with match scores and AI reasoning
- [ ] Click "Assign" → verify assignment appears in list below
- [ ] Verify `currentLoad` increments for assigned writer

---

## Open Questions

> [!IMPORTANT]
> **Writer expertise tags**: There is no `specialization` or `skills` field on `User`. AI will use name/email heuristics for topic fit for now. Should a `skills: String[]` field be added to `User` for richer matching?

> [!NOTE]
> **Role-based access**: No `role` field exists on `User`. Should only `admin`/`editor` roles be able to assign writers, or any authenticated user?
