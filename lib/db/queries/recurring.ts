import { prisma } from "@/lib/db/prisma";
import type { RecurringExpense, PaymentMethod } from "@/lib/types";

export function serializeRecurringExpense(r: {
  id: string;
  name: string;
  amount: { toString(): string } | number;
  categoryId: string;
  frequency: string;
  nextDate: string;
  paymentMethod: string;
  active: boolean;
}): RecurringExpense {
  return {
    id: r.id,
    name: r.name,
    amount: Number(r.amount.toString()),
    categoryId: r.categoryId,
    frequency: r.frequency as "Monthly" | "Weekly" | "Yearly",
    nextDate: r.nextDate,
    paymentMethod: r.paymentMethod as PaymentMethod,
    active: r.active,
  };
}

export async function getRecurringExpensesForUser(
  userId: string,
  onlyActive: boolean = false,
): Promise<RecurringExpense[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  try {
    const recurring = await prisma.recurringExpense.findMany({
      where: {
        userId,
        ...(onlyActive ? { active: true } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return recurring.map(serializeRecurringExpense);
  } catch (err) {
    console.error("Error fetching recurring expenses for user:", err);
    return [];
  }
}
