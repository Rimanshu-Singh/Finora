"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateCurrentUser, requireCurrentUser } from "@/lib/auth/get-current-user";
import { serializeExpense } from "@/lib/db/queries/expenses";
import { captureServerEvent } from "@/lib/analytics/posthog-server";
import type { Expense, PaymentMethod } from "@/lib/types";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Non-fatal if invoked outside Next.js request context (e.g. testing)
  }
}

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
    const user = await getOrCreateCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!Number.isFinite(input.amount) || input.amount < 0.01 || input.amount > 100000000) {
      return { success: false, error: "Invalid amount." };
    }

    // Ensure category exists in Neon, fallback to "other" if missing
    let categoryId = input.categoryId?.trim().toLowerCase().replaceAll(" ", "-") || "other";
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      categoryId = "other";
    }

    const created = await prisma.expense.create({
      data: {
        userId: user.id,
        categoryId,
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

    // Verification: Read newly inserted record back from Neon PostgreSQL
    const verified = await prisma.expense.findUnique({
      where: { id: created.id },
    });

    if (!verified) {
      throw new Error("Verification failed: Record could not be read back from Neon after insertion.");
    }

    // Track privacy-safe server event (NO amounts, merchants, or notes)
    await captureServerEvent(user.id, "expense_created", {
      payment_method_present: !!input.paymentMethod,
      merchant_present: !!input.merchant,
      tags_count: input.tags?.length || 0,
      has_note: !!input.note,
      has_location: !!input.location,
      is_split: (input.split || 1) > 1,
      used_quick_entry: usedQuickEntry,
      category: categoryId,
    });

    safeRevalidate("/");
    safeRevalidate("/dashboard");
    safeRevalidate("/transactions");
    safeRevalidate("/budgets");
    safeRevalidate("/analytics");

    return { success: true, data: serializeExpense(verified) };
  } catch (err) {
    console.error("Error creating expense in Neon:", err);
    return { success: false, error: "Could not create expense. Please try again." };
  }
}

export async function updateExpenseAction(
  id: string,
  input: Partial<ExpenseInput>,
): Promise<{ success: boolean; data?: Expense; error?: string }> {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

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

    safeRevalidate("/");
    safeRevalidate("/dashboard");
    safeRevalidate("/transactions");
    safeRevalidate("/budgets");
    safeRevalidate("/analytics");

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
    const user = await getOrCreateCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    // Verify ownership in the delete query
    await prisma.expense.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    await captureServerEvent(user.id, "expense_deleted");

    safeRevalidate("/");
    safeRevalidate("/dashboard");
    safeRevalidate("/transactions");
    safeRevalidate("/budgets");
    safeRevalidate("/analytics");

    return { success: true };
  } catch (err) {
    console.error("Error deleting expense:", err);
    return { success: false, error: "Could not delete expense." };
  }
}
