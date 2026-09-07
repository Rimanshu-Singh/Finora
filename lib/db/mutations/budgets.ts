"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/get-current-user";
import { captureServerEvent } from "@/lib/analytics/posthog-server";
import type { Budget } from "@/lib/types";

export interface BudgetInput {
  id?: string;
  categoryId?: string;
  limit: number;
  period: string; // e.g. "2026-09"
  carry?: boolean;
}

export async function saveBudgetAction(
  input: BudgetInput,
): Promise<{ success: boolean; data?: Budget; error?: string }> {
  try {
    const user = await requireCurrentUser();

    if (!Number.isFinite(input.limit) || input.limit < 0) {
      return { success: false, error: "Invalid budget limit." };
    }

    const categoryId = input.categoryId || null;

    const existing = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        categoryId,
        period: input.period,
      },
    });

    const budget = existing
      ? await prisma.budget.update({
          where: { id: existing.id },
          data: {
            limit: new Prisma.Decimal(input.limit.toFixed(2)),
            carry: input.carry || false,
          },
        })
      : await prisma.budget.create({
          data: {
            userId: user.id,
            categoryId,
            limit: new Prisma.Decimal(input.limit.toFixed(2)),
            period: input.period,
            carry: input.carry || false,
          },
        });

    await captureServerEvent(user.id, "budget_created", {
      is_overall: !input.categoryId,
    });

    revalidatePath("/budgets");
    revalidatePath("/");

    return {
      success: true,
      data: {
        id: budget.id,
        categoryId: budget.categoryId ?? undefined,
        limit: Number(budget.limit.toString()),
        spent: 0,
        period: budget.period,
        carry: budget.carry,
      },
    };
  } catch (err) {
    console.error("Error saving budget:", err);
    return { success: false, error: "Could not save budget." };
  }
}

export async function deleteBudgetAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCurrentUser();

    await prisma.budget.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    await captureServerEvent(user.id, "budget_deleted");

    revalidatePath("/budgets");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Error deleting budget:", err);
    return { success: false, error: "Could not delete budget." };
  }
}
