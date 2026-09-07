import { APP_TIME_ZONE } from "./constants";

export function formatDashboardTime(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: APP_TIME_ZONE,
  });

  const formatted = formatter.format(date);

  // Handle runtime edge-case where midnight might be returned as 24:00:00
  if (formatted.startsWith("24:")) {
    return `00:${formatted.slice(3)}`;
  }

  return formatted;
}
