import { APP_TIME_ZONE } from "./constants";

export function formatDashboardDate(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(date);

  return formatted.toUpperCase();
}
