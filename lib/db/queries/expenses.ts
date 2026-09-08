import { prisma } from "@/lib/db/prisma";
import type { Expense, PaymentMethod } from "@/lib/types";

export function serializeExpense(e: {
  id: string;
  amount: { toString(): string } | number;
  categoryId: string;
  merchant: string;
  description: string | null;
  date: string;
  time: string;
  paymentMethod: string;
  tags: string[];
  note: string | null;
  isRecurring: boolean;
  location: string | null;
  split: number | null;
  createdAt: Date;
  updatedAt: Date;
}): Expense {
  return {
    id: e.id,
    amount: Number(e.amount.toString()),
    categoryId: e.categoryId,
    merchant: e.merchant,
    description: e.description ?? e.merchant,
    date: e.date,
    time: e.time,
    paymentMethod: e.paymentMethod as PaymentMethod,
    tags: e.tags,
    note: e.note ?? "",
    isRecurring: e.isRecurring,
    location: e.location ?? undefined,
    split: e.split ?? 1,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export async function getExpensesForUser(userId: string): Promise<Expense[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: [
        { date: "desc" },
        { time: "desc" },
        { createdAt: "desc" },
      ],
    });

    return expenses.map(serializeExpense);
  } catch (err) {
    console.error("Error fetching expenses for user:", err);
    return [];
  }
}

export async function getRecentExpenses(
  userId: string,
  limit: number = 5,
): Promise<Expense[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: [
        { date: "desc" },
        { time: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return expenses.map(serializeExpense);
  } catch (err) {
    console.error("Error fetching recent expenses for user:", err);
    return [];
  }
}

export async function getExpenseById(
  id: string,
  userId: string,
): Promise<Expense | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  try {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
    });

    return expense ? serializeExpense(expense) : null;
  } catch (err) {
    console.error("Error fetching expense by id:", err);
    return null;
  }
}
