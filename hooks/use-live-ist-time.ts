"use client";

import { useState, useEffect } from "react";
import {
  APP_TIME_ZONE_LABEL,
  formatDashboardDate,
  formatDashboardTime,
  getGreeting,
  getISTDateTimeParts,
  type Greeting,
} from "@/lib/date-time";

export interface LiveISTTime {
  now: Date;
  formattedDate: string;
  formattedTime: string;
  greeting: Greeting;
  timezoneLabel: string;
}

export function useLiveISTTime(): LiveISTTime {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const istParts = getISTDateTimeParts(now);
  const formattedDate = formatDashboardDate(now);
  const formattedTime = formatDashboardTime(now);
  const greeting = getGreeting(istParts.hour);

  return {
    now,
    formattedDate,
    formattedTime,
    greeting,
    timezoneLabel: APP_TIME_ZONE_LABEL,
  };
}
