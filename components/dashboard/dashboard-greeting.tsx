"use client";

import { useSyncExternalStore } from "react";
import { useLiveISTTime } from "@/hooks/use-live-ist-time";

export interface DashboardGreetingProps {
  userName: string;
  subtitle?: string;
}

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function DashboardGreeting({
  userName,
  subtitle = "A clear view of your everyday.",
}: DashboardGreetingProps) {
  const mounted = useIsMounted();
  const { formattedDate, formattedTime, greeting, timezoneLabel } =
    useLiveISTTime();

  const formattedName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : "";

  return (
    <div>
      <div className="date-line">
        <span>{formattedDate}</span>
        {mounted && (
          <>
            <span className="date-sep"> · </span>
            <span>
              {timezoneLabel} · {formattedTime}
            </span>
          </>
        )}
      </div>
      <h1>
        {mounted ? greeting : "Good Morning"}, {formattedName}
        <span className="greeting-dot">.</span>
      </h1>
      <p>{subtitle}</p>
    </div>
  );
}
