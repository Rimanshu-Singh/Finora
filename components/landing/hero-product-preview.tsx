"use client";
import { SpendingRhythmChart } from "@/components/dashboard/spending-rhythm-chart";
import { BudgetProgress, CategoryIcon } from "@/components/ui";
import { TODAY } from "@/lib/format";
import type { Expense } from "@/lib/types";
import {
  House,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Wallet,
  Repeat,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
const expenses: Expense[] = [820, 1450, 620, 1950, 1100, 480, 750].map(
  (amount, i) => {
    const date = new Date(`${TODAY}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 6 + i);
    return {
      id: `landing-sample-${i}`,
      amount,
      date: date.toISOString().slice(0, 10),
      categoryId: "food",
      merchant: "Sample expense",
      description: "Illustrative data",
      time: "12:00",
      paymentMethod: "UPI",
      tags: [],
      note: "",
      isRecurring: false,
      createdAt: "",
      updatedAt: "",
    };
  },
);
export function RhythmPreview() {
  return <SpendingRhythmChart expenses={expenses} />;
}
export function HeroProductPreview() {
  return (
    <div
      className="landing-dashboard"
      aria-label="Finora dashboard preview with sample data"
    >
      <aside className="preview-sidebar">
        <span className="preview-wordmark">finora.</span>
        <div className="preview-workspace">
          P{" "}
          <span>
            Personal space<small>Make room for clarity.</small>
          </span>
        </div>
        {[
          [House, "Overview"],
          [ArrowLeftRight, "Transactions"],
          [Wallet, "Budgets"],
          [Repeat, "Recurring"],
          [ChartNoAxesCombined, "Analytics"],
        ].map(([Icon, label], i) => {
          const ItemIcon = Icon as typeof House;
          return (
            <div
              key={String(label)}
              className={`preview-nav-item ${i === 0 ? "active" : ""}`}
            >
              <ItemIcon size={15} />
              {String(label)}
            </div>
          );
        })}
        <span className="preview-sidebar-note">
          Less guesswork.
          <br />
          More peace of mind.
        </span>
      </aside>
      <div className="preview-main">
        <div className="preview-topline">
          <span>Your everyday, understood.</span>
          <span className="preview-sample">SAMPLE DATA</span>
        </div>
        <div className="preview-heading">
          <div>
            <small>YOUR PERSONAL FINORA</small>
            <h3>A little more clarity.</h3>
            <p>Here’s how your everyday is adding up.</p>
          </div>
          <Link href="/sign-up" className="button primary">
            <Plus size={14} />
            Add expense
          </Link>
        </div>
        <div className="preview-summary">
          <div className="preview-spending">
            <small>SPENT THIS MONTH</small>
            <strong>
              ₹18,420<span>.00</span>
            </strong>
            <span className="preview-trend">↘ 12% less than last month</span>
            <div className="preview-card-bottom">
              <span>A little awareness goes a long way.</span>
              <span>finora.</span>
            </div>
          </div>
          <div className="preview-budget">
            <small>THIS MONTH AT A GLANCE</small>
            <strong>
              ₹11,580<span>left to spend</span>
            </strong>
            <div className="preview-budget-label">
              <span>Monthly budget</span>
              <span>₹30,000</span>
            </div>
            <BudgetProgress spent={18420} limit={30000} />
            <div className="preview-budget-label">
              <span>61% used</span>
              <span>A little room to breathe.</span>
            </div>
          </div>
        </div>
        <RhythmPreview />
        <div className="preview-activity">
          <h3>
            Recent activity <ArrowUpRight size={14} />
          </h3>
          {[
            ["Groceries", "Weekly groceries", "₹500"],
            ["Food", "Coffee & a little pause", "₹180"],
          ].map(([category, label, amount]) => (
            <div key={label}>
              <CategoryIcon name={category} />
              <span>
                {label}
                <small>{category} · Today</small>
              </span>
              <strong>{amount}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
