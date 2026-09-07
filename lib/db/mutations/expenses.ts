"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/get-current-user";
import { serializeExpense } from "@/lib/db/queries/expenses";
import { captureServerEvent } from "@/lib/analytics/posthog-server";
import type { Expense, PaymentMethod } from "@/lib/types";

export interface ExpenseInput {
  amount: number;
  categoryId: string;
  merchant: string;
  description?: string;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  note?: string;
  isRecurring?: boolean;
  location?: string;
  split?: number;
}

export async function createExpenseAction(
  input: ExpenseInput,
  usedQuickEntry: boolean = false,
): Promise<{ success: boolean; data?: Expense; error?: string }> {
  try {
    const user = await requireCurrentUser();

    if (!Number.isFinite(input.amount) || input.amount < 0.01 || input.amount > 100000000) {
      return { success: false, error: "Invalid amount." };
    }

    const created = await prisma.expense.create({
      data: {
        userId: user.id,
        categoryId: input.categoryId || "other",
        amount: new Prisma.Decimal(input.amount.toFixed(2)),
        merchant: input.merchant.trim() || "Expense",
        description: input.description?.trim() || input.merchant.trim() || "Expense",
        date: input.date,
        time: input.time || "12:00",
        paymentMethod: input.paymentMethod || "UPI",
        tags: input.tags || [],
        note: input.note?.trim() || null,
        isRecurring: input.isRecurring || false,
        location: input.location?.trim() || null,
        split: input.split || 1,
      },
    });

    // Track privacy-safe server event (NO amounts, merchants, or notes)
    await captureServerEvent(user.id, "expense_created", {
      payment_method_present: !!input.paymentMethod,
      merchant_present: !!input.merchant,
      tags_count: input.tags?.length || 0,
      has_note: !!input.note,
      has_location: !!input.location,
      is_split: (input.split || 1) > 1,
      used_quick_entry: usedQuickEntry,
      category: input.categoryId,
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/analytics");

    return { success: true, data: serializeExpense(created) };
  } catch (err) {
    console.error("Error creating expense:", err);
    return { success: false, error: "Could not create expense. Please try again." };
  }
}

export async function updateExpenseAction(
  id: string,
  input: Partial<ExpenseInput>,
): Promise<{ success: boolean; data?: Expense; error?: string }> {
  try {
    const user = await requireCurrentUser();

    // Verify ownership in the update query
    const updated = await prisma.expense.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...(input.amount !== undefined && {
          amount: new Prisma.Decimal(input.amount.toFixed(2)),
        }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.merchant !== undefined && { merchant: input.merchant.trim() }),
        ...(input.description !== undefined && { description: input.description.trim() }),
        ...(input.date !== undefined && { date: input.date }),
        ...(input.time !== undefined && { time: input.time }),
        ...(input.paymentMethod !== undefined && { paymentMethod: input.paymentMethod }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.note !== undefined && { note: input.note.trim() || null }),
        ...(input.location !== undefined && { location: input.location.trim() || null }),
        ...(input.split !== undefined && { split: input.split }),
        ...(input.isRecurring !== undefined && { isRecurring: input.isRecurring }),
      },
    });

    await captureServerEvent(user.id, "expense_updated", {
      tags_count: input.tags?.length,
      has_note: !!input.note,
    });

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/analytics");

    return { success: true, data: serializeExpense(updated) };
  } catch (err) {
    console.error("Error updating expense:", err);
    return { success: false, error: "Could not update expense." };
  }
}

export async function deleteExpenseAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser();

    // Verify ownership in the delete query
    await prisma.expense.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    await captureServerEvent(user.id, "expense_deleted");

    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budgets");
    revalidatePath("/analytics");

    return { success: true };
  } catch (err) {
    console.error("Error deleting expense:", err);
    return { success: false, error: "Could not delete expense." };
  }
}
