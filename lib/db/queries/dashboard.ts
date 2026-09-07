import { prisma } from "@/lib/db/prisma";
import { getExpensesForUser } from "./expenses";
import { getBudgetsForUser } from "./budgets";
import { getCategories } from "./categories";
import type { FinoraData, Period, PaymentMethod } from "@/lib/types";
import { getISTDateParts } from "@/lib/date-time";

export async function getDashboardDataForUser(
  userId: string,
  userProfile?: { firstName?: string | null; lastName?: string | null },
): Promise<FinoraData> {
  const ist = getISTDateParts();
  const currentMonthPeriod = `${ist.year}-${String(ist.month).padStart(2, "0")}`;

  const [expenses, categories, budgets, recurring] = await Promise.all([
    getExpensesForUser(userId),
    getCategories(),
    getBudgetsForUser(userId, currentMonthPeriod),
    !process.env.DATABASE_URL
      ? Promise.resolve([])
      : prisma.recurringExpense
          .findMany({
            where: { userId, active: true },
          })
          .catch(() => []),
  ]);

  const defaultName = userProfile?.firstName
    ? `${userProfile.firstName}${userProfile.lastName ? " " + userProfile.lastName : ""}`
    : "You";

  return {
    expenses,
    categories,
    budgets,
    recurring: recurring.map((r) => ({
      id: r.id,
      name: r.name,
      amount: Number(r.amount.toString()),
      categoryId: r.categoryId,
      frequency: r.frequency as "Monthly" | "Weekly" | "Yearly",
      nextDate: r.nextDate,
      paymentMethod: r.paymentMethod as PaymentMethod,
      active: r.active,
    })),
    settings: {
      name: defaultName,
      currency: "INR",
      locale: "en-IN",
      weekStarts: "Monday",
      period: "Month" as Period,
      startScreen: "overview",
      theme: "Light",
      paymentMethod: "UPI",
      suggestions: true,
      askNote: false,
    },
  };
}
