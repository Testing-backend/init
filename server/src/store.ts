export type User = {
  id: string;
  walletAddress: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
};

export type Goal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
};

export const users: User[] = [
  {
    id: 'user-demo',
    walletAddress: null,
    email: null,
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
  },
];

/** Interview task works on this array. Restarts clear it — that is fine. */
export const goals: Goal[] = [];
