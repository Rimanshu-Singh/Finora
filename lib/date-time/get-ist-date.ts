import { APP_TIME_ZONE } from "./constants";

export type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
};

export function getISTDateTimeParts(date: Date = new Date()): DateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "long",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const result: Partial<DateTimeParts> = {};

  for (const part of parts) {
    if (part.type === "year") result.year = parseInt(part.value, 10);
    else if (part.type === "month") result.month = parseInt(part.value, 10);
    else if (part.type === "day") result.day = parseInt(part.value, 10);
    else if (part.type === "hour") {
      // In 24-hour mode, some engines can produce 24 at midnight
      const h = parseInt(part.value, 10);
      result.hour = h === 24 ? 0 : h;
    } else if (part.type === "minute") result.minute = parseInt(part.value, 10);
    else if (part.type === "second") result.second = parseInt(part.value, 10);
    else if (part.type === "weekday") result.weekday = part.value;
  }

  return {
    year: result.year ?? 2026,
    month: result.month ?? 9,
    day: result.day ?? 7,
    hour: result.hour ?? 0,
    minute: result.minute ?? 0,
    second: result.second ?? 0,
    weekday: result.weekday ?? "Monday",
  };
}
