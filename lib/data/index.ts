import type { FinoraData } from "@/lib/types";

export const getTransactions = () => [];
export const getBudgets = () => [];
export const getAnalytics = () => ({
  totalSpent: 0,
  transactionCount: 0,
  averageTransaction: 0,
});

export const getLedgerData = (): FinoraData => ({
  expenses: [],
  categories: [],
  budgets: [],
  recurring: [],
  settings: {
    name: "You",
    currency: "INR",
    locale: "en-IN",
    weekStarts: "Monday",
    period: "Month",
    startScreen: "overview",
    theme: "Dark",
    paymentMethod: "UPI",
    suggestions: true,
    askNote: false,
  },
});

export const getFinoraData = getLedgerData;
