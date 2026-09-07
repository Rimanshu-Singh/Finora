import { PostHog } from "posthog-node";
import type { FinoraEvent } from "./events";

export function getPostHogServerClient(): PostHog | null {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (!token) return null;

  return new PostHog(token, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
}

/**
 * Safely captures server-side analytics events upon database mutations.
 * Shuts down client cleanly for serverless/Next.js execution.
 */
export async function captureServerEvent(
  distinctId: string,
  event: FinoraEvent,
  properties?: Record<string, unknown>,
) {
  try {
    const client = getPostHogServerClient();
    if (!client) return;

    client.capture({
      distinctId,
      event,
      properties,
    });

    await client.shutdown();
  } catch (err) {
    // Non-blocking: analytics failures must never crash transactional business logic
    console.error("PostHog server event error:", err);
  }
}
