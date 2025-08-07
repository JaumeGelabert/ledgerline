export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: string; // ISO timestamp
}
