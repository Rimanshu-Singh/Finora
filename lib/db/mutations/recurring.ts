"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateCurrentUser } from "@/lib/auth/get-current-user";
import { serializeRecurringExpense } from "@/lib/db/queries/recurring";
import type { RecurringExpense, PaymentMethod } from "@/lib/types";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {}
}

export interface RecurringExpenseInput {
  id?: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: "Monthly" | "Weekly" | "Yearly";
  nextDate: string;
  paymentMethod: PaymentMethod;
  active?: boolean;
}

export async function saveRecurringExpenseAction(
  input: RecurringExpenseInput,
): Promise<{ success: boolean; data?: RecurringExpense; error?: string }> {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!input.name?.trim()) {
      return { success: false, error: "Name is required." };
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { success: false, error: "Invalid amount." };
    }

    let recurring;
    if (input.id && !input.id.startsWith("rec-")) {
      const existing = await prisma.recurringExpense.findFirst({
        where: { id: input.id, userId: user.id },
      });

      if (existing) {
        recurring = await prisma.recurringExpense.update({
          where: { id: input.id },
          data: {
            name: input.name.trim(),
            amount: new Prisma.Decimal(input.amount.toFixed(2)),
            categoryId: input.categoryId,
            frequency: input.frequency,
            nextDate: input.nextDate,
            paymentMethod: input.paymentMethod,
            active: input.active ?? existing.active,
          },
        });
      }
    }

    if (!recurring) {
      recurring = await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          name: input.name.trim(),
          amount: new Prisma.Decimal(input.amount.toFixed(2)),
          categoryId: input.categoryId || "other",
          frequency: input.frequency || "Monthly",
          nextDate: input.nextDate,
          paymentMethod: input.paymentMethod || "UPI",
          active: input.active ?? true,
        },
      });
    }

    safeRevalidate("/recurring");
    safeRevalidate("/");
    safeRevalidate("/dashboard");

    return { success: true, data: serializeRecurringExpense(recurring) };
  } catch (err) {
    console.error("Error saving recurring expense:", err);
    return { success: false, error: "Could not save recurring expense." };
  }
}

export async function toggleRecurringExpenseAction(
  id: string,
  active: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    await prisma.recurringExpense.update({
      where: { id, userId: user.id },
      data: { active },
    });

    safeRevalidate("/recurring");
    safeRevalidate("/");
    safeRevalidate("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Error toggling recurring expense:", err);
    return { success: false, error: "Could not toggle recurring expense." };
  }
}

export async function deleteRecurringExpenseAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    await prisma.recurringExpense.delete({
      where: { id, userId: user.id },
    });

    safeRevalidate("/recurring");
    safeRevalidate("/");
    safeRevalidate("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Error deleting recurring expense:", err);
    return { success: false, error: "Could not delete recurring expense." };
  }
}
