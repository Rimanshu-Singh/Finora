import posthog from "posthog-js";
import type { FinoraEvent } from "./events";

export function initPostHogClient() {
  if (typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!token) return;

  posthog.init(token, {
    api_host: host,
    autocapture: false,
    disable_session_recording: true,
    capture_pageview: false, // Managed manually / conservatively
    persistence: "localStorage+cookie",
  });
}

export function captureClientEvent(
  event: FinoraEvent,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function identifyUser(
  distinctId: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  posthog.identify(distinctId, properties);
}

export function resetUser() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

export { posthog };
