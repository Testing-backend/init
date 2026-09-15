# VeriFi AI — 10–15 min backend interview

The UI is one page: **Savings**. Auth works. No database.

**Timebox:** 10–15 minutes.

## Setup

```bash
npm install
npm run dev
```

http://localhost:5173 → **Continue as demo user**

## Task

Open `server/src/routes/savings.routes.ts`. Complete the two `TODO`s. Goals live in the `goals` array in `server/src/store.ts`.

1. **GET `/api/savings`** — return this user’s goals (`req.user.userId`)
2. **POST `/api/savings`** — push a goal with `userId`, `name`, `targetAmount`, `currentAmount: 0`

POST body: `{ name, targetAmount }`  
Goal: `{ id, userId, name, targetAmount, currentAmount }`

You do not need to change the frontend.

**Done when:** you can add a goal and it still shows after refresh.

Talk while you work. Ask questions.
