import { prisma } from "@/lib/db/prisma";

export interface AnalyticsSummary {
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface CategorySpendingItem {
  categoryId: string;
  total: number;
  count: number;
}

export interface DailySpendingItem {
  date: string;
  total: number;
  count: number;
}

/**
 * Calculates server-side analytics summary (SUM, COUNT, AVG) directly in PostgreSQL.
 */
export async function getAnalyticsSummary(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<AnalyticsSummary> {
  if (!process.env.DATABASE_URL) {
    return { totalSpent: 0, transactionCount: 0, averageTransaction: 0 };
  }

  try {
    const whereClause: { userId: string; date?: { gte?: string; lte?: string } } = { userId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const aggregations = await prisma.expense.aggregate({
      where: whereClause,
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });

    return {
      totalSpent: Number(aggregations._sum.amount?.toString() ?? "0"),
      transactionCount: aggregations._count.id ?? 0,
      averageTransaction: Number(aggregations._avg.amount?.toString() ?? "0"),
    };
  } catch (err) {
    console.error("Error calculating analytics summary:", err);
    return { totalSpent: 0, transactionCount: 0, averageTransaction: 0 };
  }
}

/**
 * Calculates spending grouped by category in PostgreSQL.
 */
export async function getCategorySpending(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<CategorySpendingItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const whereClause: { userId: string; date?: { gte?: string; lte?: string } } = { userId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const grouped = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: whereClause,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    return grouped.map((g) => ({
      categoryId: g.categoryId,
      total: Number(g._sum.amount?.toString() ?? "0"),
      count: g._count.id ?? 0,
    }));
  } catch (err) {
    console.error("Error calculating category spending:", err);
    return [];
  }
}

/**
 * Calculates daily spending aggregates in PostgreSQL.
 */
export async function getDailySpending(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<DailySpendingItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const whereClause: { userId: string; date?: { gte?: string; lte?: string } } = { userId };
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = startDate;
      if (endDate) whereClause.date.lte = endDate;
    }

    const grouped = await prisma.expense.groupBy({
      by: ["date"],
      where: whereClause,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { date: "desc" },
    });

    return grouped.map((g) => ({
      date: g.date,
      total: Number(g._sum.amount?.toString() ?? "0"),
      count: g._count.id ?? 0,
    }));
  } catch (err) {
    console.error("Error calculating daily spending:", err);
    return [];
  }
}
