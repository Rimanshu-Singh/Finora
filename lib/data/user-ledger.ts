import { getOrCreateCurrentUser } from "@/lib/auth/get-current-user";
import { getDashboardDataForUser } from "@/lib/db/queries/dashboard";
import { getCategories } from "@/lib/db/queries/categories";
import type { FinoraData, Period, PaymentMethod } from "@/lib/types";

export async function getUserLedgerData(): Promise<FinoraData> {
  const categories = await getCategories();
  const defaultSettings: FinoraData["settings"] = {
    name: "You",
    currency: "INR",
    locale: "en-IN",
    weekStarts: "Monday",
    period: "Month" as Period,
    startScreen: "overview",
    theme: "Dark",
    paymentMethod: "UPI" as PaymentMethod,
    suggestions: true,
    askNote: false,
  };

  const emptyData: FinoraData = {
    expenses: [],
    categories,
    budgets: [],
    recurring: [],
    settings: defaultSettings,
  };

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("USER:PASSWORD")) {
    return emptyData;
  }

  try {
    const user = await getOrCreateCurrentUser();
    if (!user) {
      return emptyData;
    }

    return await getDashboardDataForUser(user.id, user);
  } catch (err) {
    console.error("Error loading user ledger data from Neon:", err);
    return emptyData;
  }
}
