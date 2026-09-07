export type PaymentMethod =
  | "UPI"
  | "Cash"
  | "Credit Card"
  | "Debit Card"
  | "Bank Transfer"
  | "Wallet"
  | "Other";
export type Period = "Today" | "Week" | "Month" | "Year";
export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  merchant: string;
  description: string;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  note: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
  location?: string;
  attachment?: string;
  split?: number;
}
export interface Category {
  id: string;
  name: string;
  icon: string;
  parentId?: string;
  archived: boolean;
  sortOrder: number;
}
export interface Budget {
  id: string;
  categoryId?: string;
  limit: number;
  spent: number;
  period: string;
  carry: boolean;
}
export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: "Monthly" | "Weekly" | "Yearly";
  nextDate: string;
  paymentMethod: PaymentMethod;
  active: boolean;
}
export interface Settings {
  name: string;
  currency: string;
  locale: string;
  weekStarts: string;
  period: Period;
  startScreen: string;
  theme: "System" | "Light" | "Dark";
  paymentMethod: PaymentMethod;
  suggestions: boolean;
  askNote: boolean;
}
export interface LedgerData {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  recurring: RecurringExpense[];
  settings: Settings;
}
