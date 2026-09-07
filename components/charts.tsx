"use client";
import { useState } from "react";
import { useLedger } from "./provider";
import { MoneyAmount, CategoryIcon, EmptyState } from "./ui";
import { sum, money } from "@/lib/format";
import type { Expense } from "@/lib/types";
export function AnalyticsChart({
  expenses,
  days = 7,
}: {
  expenses: Expense[];
  days?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date("2026-09-07T12:00:00");
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const values = dates.map((date) =>
    sum(expenses.filter((e) => e.date === date)),
  );
  const max = Math.max(1000, ...values) * 1.18;
  const points = values.map(
    (v, i) => `${48 + (i / (days - 1)) * 852},${170 - (v / max) * 140}`,
  );
  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span className="legend-line" />
        Spending <span className="legend-dash" />
        Daily average
      </div>
      <svg
        className="trend-chart"
        viewBox="0 0 930 210"
        role="img"
        aria-label={`Daily spending over ${days} days. Total ${money(sum(expenses.filter((e) => dates.includes(e.date))))}.`}
      >
        <title>Daily spending trend</title>
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line
              x1="48"
              y1={170 - v * 140}
              x2="906"
              y2={170 - v * 140}
              className="chart-grid"
            />
            <text x="0" y={174 - v * 140} className="chart-text">
              {v === 0 ? "0" : `${((max * v) / 1000).toFixed(0)}k`}
            </text>
          </g>
        ))}
        <line
          x1="48"
          x2="906"
          y1={170 - (values.reduce((a, b) => a + b, 0) / days / max) * 140}
          y2={170 - (values.reduce((a, b) => a + b, 0) / days / max) * 140}
          className="average-line"
        />
        <polygon
          points={`48,170 ${points.join(" ")} 900,170`}
          className="chart-area"
        />
        <polyline points={points.join(" ")} className="chart-line" />
        {values.map((value, i) => (
          <g
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <rect
              x={35 + (i / (days - 1)) * 852}
              y="0"
              width={days > 7 ? 26 : 90}
              height="180"
              fill="transparent"
            />
            <circle
              cx={48 + (i / (days - 1)) * 852}
              cy={170 - (value / max) * 140}
              r={hover === i ? 5 : days === 7 ? 3 : 0}
              className="chart-dot"
            />
            <title>{`${dates[i]}: ${money(value)}`}</title>
            {(days === 7 || i % 5 === 0 || i === days - 1) && (
              <text
                x={48 + (i / (days - 1)) * 852}
                y="203"
                textAnchor={i === days - 1 ? "end" : "middle"}
                className="chart-text"
              >
                {new Date(dates[i] + "T12:00:00").toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div className="chart-tooltip">
          {dates[hover]} · {money(values[hover])}
        </div>
      )}
    </div>
  );
}
export function CategoryBreakdown({
  expenses,
  limit = 5,
}: {
  expenses: Expense[];
  limit?: number;
}) {
  const { data } = useLedger();
  const total = sum(expenses);
  const rows = data.categories
    .map((c) => ({
      ...c,
      spent: sum(expenses.filter((e) => e.categoryId === c.id)),
    }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, limit);
  return (
    <div className="category-breakdown">
      {rows.length ? (
        rows.map((c) => (
          <div className="breakdown-row" key={c.id}>
            <CategoryIcon name={c.icon} />
            <div>
              <div className="breakdown-heading">
                <span>{c.name}</span>
                <MoneyAmount amount={c.spent} />
              </div>
              <div className="breakdown-track">
                <span style={{ width: `${(c.spent / total) * 100}%` }} />
              </div>
            </div>
            <small>{Math.round((c.spent / total) * 100)}%</small>
          </div>
        ))
      ) : (
        <EmptyState title="No spending yet." />
      )}
    </div>
  );
}
export function DailyBars({ expenses }: { expenses: Expense[] }) {
  const values = Array.from({ length: 7 }, (_, i) =>
    sum(
      expenses.filter(
        (e) => new Date(e.date + "T12:00:00").getDay() === (i + 1) % 7,
      ),
    ),
  );
  return (
    <div className="daily-bars">
      {values.map((v, i) => (
        <div key={i}>
          <span
            className="daily-bar"
            style={{
              height: `${Math.max(2, (v / Math.max(1, ...values)) * 125)}px`,
            }}
            title={money(v)}
          />
          <small>{["M", "T", "W", "T", "F", "S", "S"][i]}</small>
          <span className="sr-only">{money(v)}</span>
        </div>
      ))}
    </div>
  );
}
