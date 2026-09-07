"use client";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useLedger } from "./provider";
import {
  PageHeader,
  MoneyAmount,
  BudgetProgress,
  CategoryIcon,
  Modal,
} from "./ui";
import { sum, MONTH } from "@/lib/format";
import type { Budget } from "@/lib/types";
export function BudgetEditor({
  budget,
  onClose,
  categoryId,
}: {
  budget?: Budget;
  onClose: () => void;
  categoryId?: string;
}) {
  const { data, setData, notify } = useLedger();
  return (
    <Modal
      title={budget ? "Edit budget" : "A little room for what matters."}
      onClose={onClose}
    >
      <form
        className="standard-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const cat = String(f.get("category") || "");
          const period = String(f.get("period"));
          const existing = data.budgets.find(
            (b) => b.categoryId === (cat || undefined) && b.period === period,
          );
          const item: Budget = {
            id: budget?.id ?? existing?.id ?? crypto.randomUUID(),
            categoryId: cat || undefined,
            limit: Number(f.get("limit")),
            spent: 0,
            period,
            carry: f.get("carry") === "on",
          };
          setData((d) => ({
            ...d,
            budgets: [...d.budgets.filter((b) => b.id !== item.id), item],
          }));
          notify("Budget saved");
          onClose();
        }}
      >
        <label>
          Category
          <select
            aria-label="Category"
            name="category"
            defaultValue={budget?.categoryId ?? categoryId ?? ""}
          >
            <option value="">Overall monthly budget</option>
            {data.categories
              .filter((c) => !c.archived)
              .map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          Monthly limit (₹)
          <input
            autoFocus
            type="number"
            min="1"
            max="100000000"
            step="0.01"
            name="limit"
            required
            defaultValue={budget?.limit}
            placeholder="7,000"
          />
        </label>
        <label>
          Start month
          <input
            name="period"
            type="month"
            defaultValue={budget?.period ?? MONTH}
            required
          />
        </label>
        <label className="check-label">
          <input name="carry" type="checkbox" defaultChecked={budget?.carry} />
          Carry unused amount into next month
        </label>
        <div className="form-actions">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary">Save budget</button>
        </div>
      </form>
    </Modal>
  );
}
export function BudgetsPage() {
  const { data } = useLedger();
  const [edit, setEdit] = useState<Budget | null | undefined>();
  const monthly = data.expenses.filter((e) => e.date.startsWith(MONTH));
  const overall = data.budgets.find((b) => !b.categoryId && b.period === MONTH);
  const total = sum(monthly),
    limit = overall?.limit ?? 30000;
  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Set limits without obsessing over them."
        action={
          <button className="button primary" onClick={() => setEdit(null)}>
            <Plus size={16} />
            New budget
          </button>
        }
      />
      <section className="budget-overview">
        <div className="section-heading">
          <span className="eyebrow">SEPTEMBER MONTHLY BUDGET</span>
          <button
            className="text-button"
            onClick={() => setEdit(overall ?? null)}
          >
            <Pencil size={14} />
            Edit limit
          </button>
        </div>
        <MoneyAmount amount={limit} className="analytics-amount" />
        <div className="budget-stats">
          <div>
            <span>Spent</span>
            <MoneyAmount amount={total} />
          </div>
          <div>
            <span>{total > limit ? "Over budget" : "Remaining"}</span>
            <MoneyAmount amount={Math.abs(limit - total)} />
          </div>
          <strong>{Math.round((total / limit) * 100)}%</strong>
        </div>
        <BudgetProgress spent={total} limit={limit} />
        <p className="muted small">
          Your budget is a guide. Make it work for you.
        </p>
      </section>
      <div className="section-heading">
        <h2>Category budgets</h2>
        <span className="muted small">Monthly limits</span>
      </div>
      <div className="budget-rows">
        {data.budgets
          .filter((b) => b.categoryId)
          .map((b) => {
            const c = data.categories.find((c) => c.id === b.categoryId);
            const spent = sum(
              data.expenses.filter(
                (e) =>
                  e.categoryId === b.categoryId && e.date.startsWith(b.period),
              ),
            );
            return (
              <button
                className="budget-row"
                key={b.id}
                onClick={() => setEdit(b)}
              >
                <CategoryIcon name={c?.icon ?? "Other"} />
                <div>
                  <div className="budget-row-top">
                    <h3>{c?.name}</h3>
                    <span>
                      <MoneyAmount amount={spent} />{" "}
                      <span className="muted">
                        of <MoneyAmount amount={b.limit} />
                      </span>
                    </span>
                  </div>
                  <BudgetProgress spent={spent} limit={b.limit} />
                  <div className="budget-caption">
                    <span>
                      {b.period}
                      {b.carry ? " · Carry forward on" : ""}
                    </span>
                    <span>
                      {Math.round((spent / b.limit) * 100)}%
                      {spent > b.limit ? " · Over budget" : ""}
                    </span>
                  </div>
                </div>
                <Pencil size={15} />
              </button>
            );
          })}
      </div>
      {edit !== undefined && (
        <BudgetEditor
          budget={edit ?? undefined}
          onClose={() => setEdit(undefined)}
        />
      )}
    </>
  );
}
