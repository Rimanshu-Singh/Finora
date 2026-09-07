import { prisma } from "@/lib/db/prisma";
import type { Category } from "@/lib/types";

const fallbackCategories = [
  "Food",
  "Groceries",
  "Transport",
  "Shopping",
  "Clothing",
  "Bills",
  "Subscriptions",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Personal Care",
  "Gifts",
  "Other",
].map((name, sortOrder) => ({
  id: name.toLowerCase().replaceAll(" ", "-"),
  name,
  icon: name,
  archived: false,
  sortOrder,
}));

export async function getCategories(): Promise<Category[]> {
  if (!process.env.DATABASE_URL) {
    return fallbackCategories;
  }
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });

    if (!categories.length) {
      return fallbackCategories;
    }

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      archived: false,
      sortOrder: c.sortOrder,
    }));
  } catch {
    return fallbackCategories;
  }
}
