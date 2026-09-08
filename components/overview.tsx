"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { useLedger } from "./provider";
import {
  AddButton,
  MoneyAmount,
  BudgetProgress,
  EmptyState,
} from "./ui";
import { TransactionList } from "./transactions";
import { CategoryBreakdown } from "./charts";
import { SpendingCard } from "./spending-card";
import { SpendingRhythmChart } from "./dashboard/spending-rhythm-chart";
import { DashboardGreeting } from "./dashboard/dashboard-greeting";
import { useClerkDisplayName } from "./auth/user-menu";
import { sum, inPeriod, MONTH, TODAY, YESTERDAY } from "@/lib/format";
import type { Period } from "@/lib/types";
export function Overview() {
  const { data } = useLedger();
  const clerkName = useClerkDisplayName(data.settings.name.split(" ")[0]);
  const [period, setPeriod] = useState<Period>(data.settings.period);
  const monthly = data.expenses.filter((e) => e.date.startsWith(MONTH));
  const total = sum(monthly);
  const overallBudget = data.budgets.find((b) => !b.categoryId && b.period === MONTH);
  const limit = overallBudget?.limit ?? (data.budgets.find((b) => !b.categoryId)?.limit ?? 0);
  const spent = sum(data.expenses.filter((e) => inPeriod(e, period)));
  const yesterday = sum(data.expenses.filter((e) => e.date === YESTERDAY));
  const today = sum(data.expenses.filter((e) => e.date === TODAY));
  const recent = [...data.expenses]
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .slice(0, 5);
  const currentMonthName = new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();
  return (
    <>
      <header className="overview-header">
        <DashboardGreeting userName={clerkName} />
        <AddButton />
      </header>
      <section className="spending-overview">
        <SpendingCard
          spent={spent}
          period={period}
          onPeriodChange={setPeriod}
          yesterdaySpent={yesterday}
          todaySpent={today}
        />
        <div className="month-summary">
          <div className="section-top">
            <span className="eyebrow">{currentMonthName} AT A GLANCE</span>
            <CalendarDays size={16} />
          </div>
          <span className="month-amount">
            <MoneyAmount amount={total} />
            <span>spent this month</span>
          </span>
          <div className="budget-caption">
            <span>Monthly budget</span>
            {limit > 0 ? <MoneyAmount amount={limit} /> : <span>No budget set</span>}
          </div>
          <BudgetProgress spent={total} limit={limit || Math.max(total, 1)} />
          <div className="budget-caption">
            <span>{limit > 0 ? `${Math.round((total / limit) * 100)}% used` : "No limit set"}</span>
            <span>
              {limit > 0 ? (
                <>
                  <MoneyAmount amount={Math.max(0, limit - total)} /> left
                </>
              ) : (
                "Review in budgets"
              )}
            </span>
          </div>
          <Link className="budget-link" href="/budgets">
            {limit === 0
              ? "Set a monthly budget."
              : total <= limit
                ? "A little room to breathe."
                : "Time to review your budget."}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <SpendingRhythmChart expenses={data.expenses} />
      <div className="overview-lower">
        <section className="recent-section">
          <div className="section-heading">
            <h2>
              Recent activity{" "}
              <span className="count-badge">{data.expenses.length}</span>
            </h2>
            <Link className="text-button" href="/transactions">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recent.length ? (
            <TransactionList expenses={recent} />
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Add your first expense to see your everyday take shape."
              action={<AddButton />}
            />
          )}
        </section>
        <section className="categories-section">
          <div className="section-heading">
            <h2>Where it goes</h2>
            <span className="muted small">This month</span>
          </div>
          <CategoryBreakdown expenses={monthly} limit={4} />
          <Link className="category-footer" href="/analytics">
            See spending breakdown <ChevronRight size={15} />
          </Link>
        </section>
      </div>
      <div className="insight-strip">
        <span className="insight-symbol">↗</span>
        <p>
          <strong>A little perspective.</strong> You’ve recorded{" "}
          {monthly.length} expenses this month. Every entry brings a little more
          clarity.
        </p>
        <Link href="/calendar" aria-label="View spending calendar">
          <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
