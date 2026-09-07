"use client";
import { useState } from "react";
import {
  ArrowDownRight,
  Repeat,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { useLedger } from "./provider";
import { PageHeader, PeriodSelector, MoneyAmount } from "./ui";
import { AnalyticsChart, CategoryBreakdown, DailyBars } from "./charts";
import { sum, inPeriod } from "@/lib/format";
import type { Period } from "@/lib/types";
export function AnalyticsPage() {
  const { data } = useLedger();
  const [period, setPeriod] = useState<Period | "3 Months">("Month");
  const expenses = data.expenses.filter((e) =>
    period === "3 Months"
      ? e.date >= "2026-07-01" && e.date <= "2026-09-07"
      : inPeriod(e, period),
  );
  const total = sum(expenses),
    previous = sum(
      data.expenses.filter(
        (e) => e.date >= "2026-08-01" && e.date <= "2026-08-07",
      ),
    );
  const monthToDate = sum(
    data.expenses.filter(
      (e) => e.date >= "2026-09-01" && e.date <= "2026-09-07",
    ),
  );
  const daily = Object.entries(Object.groupBy(expenses, (e) => e.date))
    .map(([date, items]) => ({ date, total: sum(items ?? []) }))
    .sort((a, b) => b.total - a.total);
  const recurring = data.recurring
    .filter((r) => r.active)
    .reduce(
      (n, r) =>
        n +
        r.amount *
          (r.frequency === "Weekly"
            ? 52 / 12
            : r.frequency === "Yearly"
              ? 1 / 12
              : 1),
      0,
    );
  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="Understand where your money goes."
        action={
          <PeriodSelector
            value={period}
            onChange={setPeriod}
            options={["Week", "Month", "3 Months", "Year"]}
          />
        }
      />
      <section className="analytics-hero">
        <div>
          <span className="eyebrow">
            {period === "Month" ? "SEPTEMBER" : `THIS ${period.toUpperCase()}`}
          </span>
          <MoneyAmount amount={total} className="analytics-amount" />
          <p>
            {expenses.length} expenses ·{" "}
            <MoneyAmount
              amount={expenses.length ? total / expenses.length : 0}
            />{" "}
            average per expense
          </p>
        </div>
        <div className="comparison-stat">
          <ArrowDownRight size={20} />
          <strong>
            {previous
              ? `${Math.round(Math.abs(monthToDate / previous - 1) * 100)}% ${monthToDate > previous ? "more" : "less"}`
              : "No prior spending"}
          </strong>
          <span>September 1–7 vs August 1–7</span>
        </div>
      </section>
      <section className="trend-section">
        <div className="section-heading">
          <h2>Spending trend</h2>
          <span className="muted small">
            {period === "Week" ? "Last 7 days" : "Last 30 days"}
          </span>
        </div>
        <AnalyticsChart expenses={expenses} days={period === "Week" ? 7 : 30} />
      </section>
      <div className="analytics-grid">
        <section>
          <div className="section-heading">
            <h2>Spending by category</h2>
            <span className="muted small">Share of total</span>
          </div>
          <CategoryBreakdown expenses={expenses} limit={14} />
        </section>
        <section>
          <div className="section-heading">
            <h2>Your weekly pattern</h2>
          </div>
          <DailyBars expenses={expenses} />
          <p className="muted small">Total spending by day of the week.</p>
          <div className="insight-items">
            <div>
              <CalendarDays size={18} />
              <p>
                Your highest spending day was{" "}
                <strong>
                  {daily[0]
                    ? new Date(daily[0].date + "T12:00:00").toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" },
                      )
                    : "—"}
                </strong>
                .
                <small>
                  {daily[0] && <MoneyAmount amount={daily[0].total} />} in daily
                  expenses
                </small>
              </p>
            </div>
            <div>
              <Repeat size={18} />
              <p>
                Recurring payments account for{" "}
                <strong>
                  <MoneyAmount amount={recurring} />
                  /month
                </strong>
                .<small>Based on your active recurring expenses.</small>
              </p>
            </div>
            <div>
              <ArrowUpRight size={18} />
              <p>
                <strong>
                  {expenses.filter((e) => e.paymentMethod === "UPI").length}
                </strong>{" "}
                of your {expenses.length} expenses were paid with UPI.
                <small>A picture of how you pay.</small>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
