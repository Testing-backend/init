# Frontend API contract

**10–15 min interview:** the UI only calls `GET` + `POST /api/savings`. Fill in those two TODOs on the in-memory `goals` array. No database. Auth is given.

The Vite app proxies `/api` to `http://localhost:3001`. The browser helper in `src/services/api.ts` sends `Authorization: Bearer <accessToken>` and `Content-Type: application/json`.

**Errors:** non-2xx bodies should include `{ "error": string }` (optional `code`). `401` clears the session.

**Auth:** every route below except `/health`, `POST /auth/nonce`, `POST /auth/verify`, and `POST /auth/interview-login` requires a valid JWT.

### `POST /api/auth/interview-login` (given)

Body: `{ role?: "user" | "admin" }` → `{ accessToken, user }` for the seeded demo wallets. Dev only.

---

## Health

`GET /health` → `{ status: "ok", timestamp: string }`

---

## Auth

### `POST /api/auth/nonce`

Body: `{ address: string }` (EVM checksum or Solana base58)

Response: `{ nonce: string }`

`nonce` is the **exact message** the wallet signs (`personal_sign` on EVM, `signMessage` on Solana). Bind it to `address`, expire it (e.g. 5–10 minutes), and allow one successful use.

### `POST /api/auth/verify`

Body: `{ address, message, signature }`

- EVM: `signature` is a hex signature of `message`.
- Solana: `signature` is base64 of the signed bytes.

Response:

```json
{
  "accessToken": "jwt",
  "user": {
    "id": "uuid",
    "walletAddress": "0x…",
    "email": null,
    "firstName": "Demo",
    "lastName": "User",
    "role": "user"
  }
}
```

`token` is accepted as an alias of `accessToken`. Create the user on first verify. JWT payload must include `userId` and `role` (see `authenticate` middleware).

### `GET /api/auth/me`

Response: the `user` object above.

---

## Accounts

### `GET /api/accounts`

Array of:

```ts
{
  id: string
  institutionName: string
  accountName?: string
  mask?: string
  currentBalance: number
  linkedAt: string
  provider?: string
  linkStatus?: string
}
```

### `GET /api/accounts/link/config`

```ts
{
  mode: 'demo' | 'plaid'
  providerLabel: string
  message: string
  institutions: { id: string; name: string; detail: string }[]
}
```

Demo mode is enough. Return at least two fake institutions.

### `POST /api/accounts/link/token`

Body: `{}`. Optional. UI ignores failure. If implemented: `{ linkToken: string }`.

### `POST /api/accounts/link`

Body: `{ institutionId: string }`

Create an account for the current user (and seed a handful of transactions). Then `GET /accounts` should include it.

### `POST /api/accounts/:id/sync`

Refresh balances / pull more mock transactions for that account. 404 if missing or not owned by the caller.

---

## Transactions

### `GET /api/transactions`

Query: `category?`, `startDate?`, `endDate?`, `limit` (UI sends `200`)

Array of:

```ts
{
  id: string
  name?: string
  merchantName?: string
  amount: number   // negative = spend, positive = credit (recommended)
  date: string     // ISO
  category?: string
  subcategory?: string
}
```

Only transactions for the caller’s accounts.

### `GET /api/transactions/categories`

`string[]` of distinct category names (empty strings omitted).

---

## Budgets

### `GET /api/budgets`

```ts
{ id: string; name: string; category: string; amount: number }[]
```

### `POST /api/budgets`

Body: `{ name, category, amount, startDate, period }` (`period` is `"monthly"`).

Return the created budget or 201 + body. UI reloads the list either way.

---

## Savings

### `GET /api/savings`

```ts
{
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string | null
}[]
```

### `POST /api/savings`

Body: `{ name, targetAmount, currentAmount?, targetDate? }` → created goal.

### `PATCH /api/savings/:id`

Body: `{ currentAmount: number }` (UI sends the new total after a contribution) → updated goal.

### `DELETE /api/savings/:id`

204 or 200. 404 if not owned by the caller.

---

## Insights

### `GET /api/insights/monthly`

```ts
{
  month: number
  year: number
  totalSpent: number
  totalBudgeted: number
  byCategory: {
    category: string
    spent: number
    budget: number | null
    overBudget: boolean
    budgetName?: string
  }[]
  monthlyTrend?: { month: string; spent: number; credits: number }[]
}
```

`totalSpent` / `byCategory.spent` should be **absolute spend** (positive numbers) for the current calendar month. `monthlyTrend` is used on the dashboard chart.

---

## KYC

Statuses used by the UI: `unverified` | `pending` | `verified` | `rejected`.

### `GET /api/kyc/me`

```ts
{
  status: string
  autoApprove: boolean
  submission: {
    id: string
    fullName: string
    dateOfBirth: string
    country: string
    documentType: string
    documentLast4: string | null
    status: string
    reviewNotes: string | null
    submittedAt: string
  } | null
}
```

### `POST /api/kyc/submit`

Body: `{ fullName, dateOfBirth, country, documentType, documentLast4? }`

Response: `{ status: string, message: string }`

If `KYC_AUTO_APPROVE` is not `"false"`, new submissions may become `verified` immediately.

### `GET /api/kyc/admin` (admin)

```ts
{
  id: string
  fullName: string
  country: string
  documentType: string
  status: string
  submittedAt: string
  user?: { walletAddress?: string | null; email?: string | null; kycStatus?: string }
}[]
```

### `POST /api/kyc/admin/:id/review` (admin)

Body: `{ action: "approve" | "reject" }`

Update submission **and** `User.kycStatus`.

---

## Loans

### `GET /api/loans/eligibility`

```ts
{
  riskScore: number
  decision: "approve" | "reject"
  reasonCodes: { code: string; description: string }[]
  recommendedLimit?: number
  attestation?: {
    txHash: string
    attestationId: string
    contractAddress: string
    chainId: number
    mode: string
  } | null
}
```

Persist a `LoanEligibilityResult`. Score from the user’s accounts/transactions/budgets/fraud signals — do not hardcode `approve` for everyone.

### `GET /api/loans`

```ts
{
  id: string
  amount: number
  status: string
  termMonths: number
  monthlyPayment: number
  interestRatePct: number
  appliedAt: string
  chainId?: number | null
  contractAddress?: string | null
  onChainLoanId?: string | null
  createTxHash?: string | null
  statusTxHash?: string | null
}[]
```

### `POST /api/loans/apply`

Body: `{ amount: number, termMonths: number }`

Reject unless `User.kycStatus === "verified"` **and** latest eligibility `decision === "approve"` **and** `amount` is within `recommendedLimit` (if you set one).

Response: `{ message?: string }` plus any loan fields you want.

Suggested statuses: `pending` → `approved` → `disbursed` → `repaid` | `defaulted`, or `rejected`.

---

## Admin (JWT `role === "admin"`)

### `GET /api/admin/users`

```ts
{
  id: string
  walletAddress?: string | null
  email?: string | null
  firstName: string | null
  lastName: string | null
  role: string
  isActive: boolean
  createdAt: string
}[]
```

### `GET /api/admin/loans`

```ts
{
  id: string
  amount: string | number
  status: string
  termMonths: number
  appliedAt: string
  onChainLoanId?: string | null
  createTxHash?: string | null
  user: { walletAddress?: string | null; email?: string | null; firstName: string | null; lastName: string | null }
}[]
```

### `POST /api/admin/loans/:loanId/status`

Body: `{ action: "approve" | "reject" | "disburse" | "repay" | "default" }`

Enforce a sensible state machine (the UI only shows legal buttons).

### `GET /api/admin/risk-scores` (bonus)

```ts
{
  id: string
  userId: string
  riskScore: number
  decision: string
  recommendedLimit: string | null
  createdAt: string
  user?: { walletAddress?: string | null; email?: string | null; firstName: string | null; lastName: string | null }
}[]
```

### `GET /api/admin/fraud-alerts` (bonus)

```ts
{
  id: string
  userId: string
  signalType: string
  severity: string
  description: string | null
  createdAt: string
  user?: { walletAddress?: string | null; email?: string | null }
}[]
```

### `GET /api/admin/audit-logs` (bonus)

```ts
{
  id: string
  userId: string | null
  action: string
  resourceType: string | null
  resourceId: string | null
  createdAt: string
  userEmail?: string
}[]
```

---

## Coach (bonus)

### `GET /api/coach/history` → `{ messages: { role: "user" | "assistant"; content: string }[] }`
### `POST /api/coach/chat` body `{ message: string, history?: … }` → `{ message: string }`
### `DELETE /api/coach/history` → 204 or 200

---

## Blockchain (bonus)

### `GET /api/blockchain/me`

```ts
{
  mode: string
  enabled: boolean
  chainId: number
  loanContract: string | null
  attestationContract: string | null
  walletAddress: string | null
  onChainLoans: Array<{
    id: string
    amount: number
    status: string
    chainId: number | null
    contractAddress: string | null
    onChainLoanId: string | null
    createTxHash: string | null
    statusTxHash: string | null
    appliedAt: string
  }>
  trustAttestations: Array<{
    id: string
    riskScore: number
    decision: string
    modelVersion: string
    chainId: number | null
    attestationContract: string | null
    attestationId: string | null
    attestationTxHash: string | null
    createdAt: string
  }>
}
```

In `simulation` mode you may invent tx hashes when eligibility is scored or a loan is created.

---

## Categorization (bonus)

Not called by the current UI. Safe to skip. If you add it, keep it under `/api/categorize`.
