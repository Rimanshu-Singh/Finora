import { prisma } from "@/lib/db/prisma";
import type { Budget } from "@/lib/types";

export async function getBudgetsForUser(
  userId: string,
  period: string,
): Promise<Budget[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId, period },
    });

    return budgets.map((b) => ({
      id: b.id,
      categoryId: b.categoryId ?? undefined,
      limit: Number(b.limit.toString()),
      spent: 0, // Calculated dynamically from expenses matching category and period
      period: b.period,
      carry: b.carry,
    }));
  } catch (err) {
    console.error("Error fetching budgets for user:", err);
    return [];
  }
}
