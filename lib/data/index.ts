import { mockTransactions } from "@/data/mock/transactions";
import { mockCategories } from "@/data/mock/categories";
import { mockBudgets } from "@/data/mock/budgets";
import { mockRecurring } from "@/data/mock/recurring";
import { mockSettings } from "@/data/mock/settings";
import { mockAnalytics } from "@/data/mock/analytics";
export const getTransactions = () => structuredClone(mockTransactions);
export const getBudgets = () => structuredClone(mockBudgets);
export const getAnalytics = () => structuredClone(mockAnalytics);
export const getLedgerData = () => ({
  expenses: getTransactions(),
  categories: structuredClone(mockCategories),
  budgets: getBudgets(),
  recurring: structuredClone(mockRecurring),
  settings: structuredClone(mockSettings),
});
export const getFinoraData = getLedgerData;
