import { getOrCreateCurrentUser } from "@/lib/auth/get-current-user";
import { getDashboardDataForUser } from "@/lib/db/queries/dashboard";
import { getCategories } from "@/lib/db/queries/categories";
import { getLedgerData } from "@/lib/data";
import type { FinoraData } from "@/lib/types";

export async function getUserLedgerData(): Promise<FinoraData> {
  // If in test or demo mode without live Neon credentials configured
  if (
    process.env.PLAYWRIGHT_SKIP_AUTH === "1" ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes("USER:PASSWORD")
  ) {
    return getLedgerData();
  }

  try {
    const user = await getOrCreateCurrentUser();
    if (!user) {
      const categories = await getCategories();
      return {
        expenses: [],
        categories,
        budgets: [],
        recurring: [],
        settings: {
          name: "You",
          currency: "INR",
          locale: "en-IN",
          weekStarts: "Monday",
          period: "Month",
          startScreen: "overview",
          theme: "Dark",
          paymentMethod: "UPI",
          suggestions: true,
          askNote: false,
        },
      };
    }

    return await getDashboardDataForUser(user.id, user);
  } catch (err) {
    console.error("Error loading user ledger data:", err);
    const categories = await getCategories();
    return {
      expenses: [],
      categories,
      budgets: [],
      recurring: [],
      settings: {
        name: "You",
        currency: "INR",
        locale: "en-IN",
        weekStarts: "Monday",
        period: "Month",
        startScreen: "overview",
        theme: "Dark",
        paymentMethod: "UPI",
        suggestions: true,
        askNote: false,
      },
    };
  }
}
