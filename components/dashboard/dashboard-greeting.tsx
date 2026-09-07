"use client";

import { useState, useEffect } from "react";
import { useLiveISTTime } from "@/hooks/use-live-ist-time";

export interface DashboardGreetingProps {
  userName: string;
  subtitle?: string;
}

export function DashboardGreeting({
  userName,
  subtitle = "A clear view of your everyday.",
}: DashboardGreetingProps) {
  const [mounted, setMounted] = useState(false);
  const { formattedDate, formattedTime, greeting, timezoneLabel } =
    useLiveISTTime();

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {mounted ? greeting : "Good morning"}, {userName}
        <span className="greeting-dot">.</span>
      </h1>
      <p>{subtitle}</p>
    </div>
  );
}
