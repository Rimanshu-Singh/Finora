export type Greeting =
  | "Good Morning"
  | "Good Afternoon"
  | "Good Evening"
  | "Good Night";

/**
 * Returns dynamic greeting based on 24-hour clock in IST:
 * - 05:00 → 11:59 (hour 5 to 11): Good Morning
 * - 12:00 → 16:59 (hour 12 to 16): Good Afternoon
 * - 17:00 → 20:59 (hour 17 to 20): Good Evening
 * - 21:00 → 04:59 (hour 21 to 4): Good Night
 */
export function getGreeting(hour: number): Greeting {
  if (hour >= 5 && hour < 12) {
    return "Good Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "Good Evening";
  }
  return "Good Night";
}
