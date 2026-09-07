import type { Category } from "@/lib/types";
export const mockCategories: Category[] = [
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
