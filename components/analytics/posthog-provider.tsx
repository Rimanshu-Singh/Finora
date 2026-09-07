"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  initPostHogClient,
  identifyUser,
  resetUser,
} from "@/lib/analytics/posthog-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    initPostHogClient();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      if (identifiedRef.current !== user.id) {
        identifiedRef.current = user.id;
        identifyUser(user.id, {
          created_at: user.createdAt,
        });
      }
    } else {
      if (identifiedRef.current !== null) {
        identifiedRef.current = null;
        resetUser();
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return <>{children}</>;
}
