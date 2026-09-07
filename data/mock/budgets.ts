import type { Budget } from "@/lib/types";
export const mockBudgets: Budget[] = [
  { id: "overall", limit: 30000, spent: 0, period: "2026-09", carry: false },
  ...(
    [
      ["food", 7000],
      ["transport", 4000],
      ["shopping", 5000],
      ["entertainment", 3000],
    ] as const
  ).map(([categoryId, limit]) => ({
    id: categoryId,
    categoryId,
    limit,
    spent: 0,
    period: "2026-09",
    carry: false,
  })),
];
