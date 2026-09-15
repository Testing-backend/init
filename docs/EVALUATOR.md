# Evaluator notes — do not send this file to candidates

Live **10–15 min** pairing. Remove this file before sharing.

No database. Goals are an in-memory array (`server/src/store.ts`).

## Format

| Min | What |
|---|---|
| 0–2 | `npm run dev`, **Continue as demo user** |
| 2–12 | Two TODOs in `savings.routes.ts` |
| 12–15 | Add a goal, refresh, ask why `userId` is required |

## Scoring

**Strong** — `g.userId === userId` on GET; POST sets `userId` from `req.user`.

**Hire** — one hint; works after.

**No** — GET returns every goal; POST never sets `userId`.

## Prompts

- “`req.user.userId` is already set.”
- “`goals` is a shared array in `store.ts`.”

## Shipping

Zip or a fresh single-commit repo.
