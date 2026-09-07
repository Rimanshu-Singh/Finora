import type { Expense, Period } from "./types";
export const TODAY = "2026-09-07";
export const MONTH = TODAY.slice(0, 7);
export const money = (n: number, currency = "INR", locale = "en-IN") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: n % 1 ? 2 : 0,
  }).format(n);
export const dateLabel = (date: string) =>
  date === TODAY
    ? "Today"
    : date === "2026-09-06"
      ? "Yesterday"
      : new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
export const sum = (items: Expense[]) =>
  items.reduce((n, e) => n + e.amount, 0);
export const inPeriod = (e: Expense, p: Period) =>
  p === "Today"
    ? e.date === TODAY
    : p === "Week"
      ? e.date >= "2026-09-01" && e.date <= TODAY
      : p === "Month"
        ? e.date.startsWith(MONTH)
        : e.date.startsWith("2026");
