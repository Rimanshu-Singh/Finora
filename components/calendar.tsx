"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLedger } from "./provider";
import { PageHeader, MoneyAmount, EmptyState, AddButton } from "./ui";
import { TransactionList } from "./transactions";
import { sum, TODAY } from "@/lib/format";
export function CalendarPage() {
  const { data } = useLedger();
  const [month, setMonth] = useState(new Date(`${TODAY}T12:00:00`)),
    [selected, setSelected] = useState(TODAY);
  const year = month.getFullYear(),
    m = month.getMonth();
  const monday = data.settings.weekStarts === "Monday";
  const offset = (new Date(year, m, 1).getDay() + (monday ? 6 : 0)) % 7;
  const count = new Date(year, m + 1, 0).getDate();
  const prefix = `${year}-${String(m + 1).padStart(2, "0")}`;
  const selectedExpenses = data.expenses.filter((e) => e.date === selected);
  const total = sum(data.expenses.filter((e) => e.date.startsWith(prefix)));
  const shift = (n: number) => {
    const next = new Date(year, m + n, 1, 12);
    setMonth(next);
    setSelected(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`,
    );
  };
  return (
    <>
      <PageHeader title="Calendar" subtitle="Your everyday, at a glance." />
      <div className="calendar-layout">
        <section>
          <div className="section-heading">
            <h2>
              {month.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="calendar-controls">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() => shift(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="text-button"
                onClick={() => {
                  setMonth(new Date(`${TODAY}T12:00:00`));
                  setSelected(TODAY);
                }}
              >
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() => shift(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {(monday
              ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
              : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            ).map((d) => (
              <div className="calendar-weekday" key={d}>
                {d}
              </div>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <div className="calendar-blank" key={`blank-${i}`} />
            ))}
            {Array.from({ length: count }, (_, i) => {
              const date = `${prefix}-${String(i + 1).padStart(2, "0")}`;
              const spent = sum(data.expenses.filter((e) => e.date === date));
              return (
                <button
                  key={date}
                  className={`calendar-day ${selected === date ? "selected" : ""} ${date === TODAY ? "today" : ""}`}
                  aria-label={`${date}, ${spent} rupees spent`}
                  aria-pressed={selected === date}
                  onClick={() => setSelected(date)}
                >
                  <span>{i + 1}</span>
                  {spent > 0 && <MoneyAmount amount={spent} />}
                </button>
              );
            })}
          </div>
          <div className="calendar-total">
            <span>Monthly spending</span>
            <MoneyAmount amount={total} />
          </div>
        </section>
        <section className="calendar-detail">
          <div className="section-heading">
            <h2>
              {new Date(selected + "T12:00:00").toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
              })}
            </h2>
          </div>
          <MoneyAmount
            amount={sum(selectedExpenses)}
            className="calendar-day-total"
          />
          <p className="muted small">{selectedExpenses.length} expenses</p>
          {selectedExpenses.length ? (
            <TransactionList expenses={selectedExpenses} />
          ) : (
            <EmptyState
              title="No expenses this day."
              description="A quiet day in your Finora."
              action={<AddButton />}
            />
          )}
        </section>
      </div>
    </>
  );
}
