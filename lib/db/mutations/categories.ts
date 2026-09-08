"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/get-current-user";
import type { Category } from "@/lib/types";

export interface CategoryInput {
  name: string;
  icon: string;
  parentId?: string;
}

export async function saveCategoryAction(
  id: string,
  input: CategoryInput,
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    await requireCurrentUser();

    const name = input.name.trim();
    if (!name) {
      return { success: false, error: "Category name is required." };
    }

    const slug = id.toLowerCase().replaceAll(" ", "-");

    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        icon: input.icon || name,
      },
      create: {
        id: slug,
        name,
        icon: input.icon || name,
        slug,
        isSystem: false,
        sortOrder: 99,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/");

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        archived: false,
        sortOrder: category.sortOrder,
      },
    };
  } catch (err) {
    console.error("Error saving category:", err);
    return { success: false, error: "Could not save category." };
  }
}
