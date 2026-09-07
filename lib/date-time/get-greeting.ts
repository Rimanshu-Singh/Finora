export type Greeting =
  | "Good morning"
  | "Good afternoon"
  | "Good evening"
  | "Good night";

/**
 * Returns dynamic greeting based on 24-hour clock in IST:
 * - 05:00 → 11:59 (hour 5 to 11): Good morning
 * - 12:00 → 16:59 (hour 12 to 16): Good afternoon
 * - 17:00 → 20:59 (hour 17 to 20): Good evening
 * - 21:00 → 04:59 (hour 21 to 4): Good night
 */
export function getGreeting(hour: number): Greeting {
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }
  return "Good night";
}
