import type { Expense, Period } from "./types";
import { getISTDateParts } from "./date-time";

export function getTodayIST(): string {
  const { year, month, day } = getISTDateParts();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getYesterdayIST(): string {
  const { year, month, day } = getISTDateParts();
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const TODAY = getTodayIST();
export const YESTERDAY = getYesterdayIST();
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
    : date === YESTERDAY
      ? "Yesterday"
      : new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });

export const sum = (items: Expense[]) =>
  items.reduce((n, e) => n + e.amount, 0);

export const inPeriod = (e: Expense, p: Period) => {
  if (p === "Today") return e.date === TODAY;
  if (p === "Week") {
    const { year, month, day } = getISTDateParts();
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() - 6);
    const startOfWeek = d.toISOString().slice(0, 10);
    return e.date >= startOfWeek && e.date <= TODAY;
  }
  if (p === "Month") return e.date.startsWith(MONTH);
  return e.date.startsWith(TODAY.slice(0, 4));
};
