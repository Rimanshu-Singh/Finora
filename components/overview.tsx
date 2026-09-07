"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDownRight,
  ChevronRight,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { useLedger } from "./provider";
import {
  AddButton,
  PeriodSelector,
  MoneyAmount,
  BudgetProgress,
  EmptyState,
} from "./ui";
import { TransactionList } from "./transactions";
import { AnalyticsChart, CategoryBreakdown } from "./charts";
import { sum, inPeriod, MONTH, TODAY } from "@/lib/format";
import type { Period } from "@/lib/types";
export function Overview() {
  const { data } = useLedger();
  const [period, setPeriod] = useState<Period>(data.settings.period);
  const monthly = data.expenses.filter((e) => e.date.startsWith(MONTH));
  const total = sum(monthly);
  const limit = data.budgets.find((b) => !b.categoryId)?.limit ?? 30000;
  const spent = sum(data.expenses.filter((e) => inPeriod(e, period)));
  const yesterday = sum(data.expenses.filter((e) => e.date === "2026-09-06"));
  const today = sum(data.expenses.filter((e) => e.date === TODAY));
  const recent = [...data.expenses]
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .slice(0, 5);
  return (
    <>
      <header className="overview-header">
        <div>
          <div className="date-line">MONDAY, 7 SEPTEMBER 2026</div>
          <h1>
            Good morning, {data.settings.name.split(" ")[0]}
            <span className="greeting-dot">.</span>
          </h1>
          <p>A clear view of your everyday.</p>
        </div>
        <AddButton />
      </header>
      <section className="spending-overview">
        <div className="spending-hero">
          <PeriodSelector value={period} onChange={setPeriod} />
          <div className="hero-label">
            {period === "Today"
              ? "TODAY’S SPENDING"
              : `THIS ${period.toUpperCase()}’S SPENDING`}
          </div>
          <MoneyAmount amount={spent} className="hero-amount" />
          <div className="hero-comparison">
            <span className="trend-badge">
              <ArrowDownRight size={14} />
            </span>
            {period === "Today" ? (
              <>
                <MoneyAmount amount={Math.abs(yesterday - today)} />{" "}
                {today <= yesterday ? "less" : "more"} than yesterday
              </>
            ) : (
              <>
                {data.expenses.filter((e) => inPeriod(e, period)).length}{" "}
                expenses this {period.toLowerCase()}
              </>
            )}
          </div>
          <div className="hero-footnote">Small moments. A clearer picture.</div>
        </div>
        <div className="month-summary">
          <div className="section-top">
            <span className="eyebrow">SEPTEMBER AT A GLANCE</span>
            <CalendarDays size={16} />
          </div>
          <span className="month-amount">
            <MoneyAmount amount={total} />
            <span>spent this month</span>
          </span>
          <div className="budget-caption">
            <span>Monthly budget</span>
            <MoneyAmount amount={limit} />
          </div>
          <BudgetProgress spent={total} limit={limit} />
          <div className="budget-caption">
            <span>{Math.round((total / limit) * 100)}% used</span>
            <span>
              <MoneyAmount amount={Math.max(0, limit - total)} /> left
            </span>
          </div>
          <Link className="budget-link" href="/budgets">
            {total <= limit
              ? "A little room to breathe."
              : "Time to review your budget."}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <section className="trend-section">
        <div className="section-heading">
          <div>
            <h2>Spending rhythm</h2>
            <p>Your week, one day at a time.</p>
          </div>
          <Link href="/analytics" className="text-button">
            View insights <ArrowUpRight size={15} />
          </Link>
        </div>
        <AnalyticsChart expenses={data.expenses} />
      </section>
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
            <EmptyState action={<AddButton />} />
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
