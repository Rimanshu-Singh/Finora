"use client";
import { useState } from "react";
import { Plus, Pause, Play, Pencil, Trash2, Repeat } from "lucide-react";
import { useLedger } from "./provider";
import {
  PageHeader,
  MoneyAmount,
  CategoryIcon,
  Modal,
  EmptyState,
  ConfirmDialog,
} from "./ui";
import { paymentMethods } from "./expense-form";
import type { RecurringExpense, PaymentMethod } from "@/lib/types";
export function RecurringPage() {
  const { data, setData, notify } = useLedger();
  const [edit, setEdit] = useState<RecurringExpense | null | undefined>(),
    [remove, setRemove] = useState<string>();
  const total = data.recurring
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
        title="Recurring"
        subtitle="Know what’s leaving your account automatically."
        action={
          <button className="button primary" onClick={() => setEdit(null)}>
            <Plus size={16} />
            Add recurring
          </button>
        }
      />
      <div className="recurring-summary">
        <div>
          <span className="eyebrow">MONTHLY COMMITMENTS</span>
          <MoneyAmount amount={total} className="analytics-amount" />
          <p>{data.recurring.filter((r) => r.active).length} active payments</p>
        </div>
        <div>
          <Repeat size={23} strokeWidth={1.3} />
          <span className="muted">Projected annually</span>
          <MoneyAmount amount={total * 12} />
        </div>
      </div>
      <div className="section-heading">
        <h2>Your regulars</h2>
        <span className="small muted">Upcoming payments</span>
      </div>
      {data.recurring.length ? (
        [...data.recurring]
          .sort((a, b) => a.nextDate.localeCompare(b.nextDate))
          .map((r) => (
            <article
              className={`recurring-row ${!r.active ? "paused" : ""}`}
              key={r.id}
            >
              <CategoryIcon
                name={
                  data.categories.find((c) => c.id === r.categoryId)?.icon ??
                  "Other"
                }
              />
              <div className="recurring-name">
                <h3>{r.name}</h3>
                <small>
                  {r.frequency} ·{" "}
                  {r.active
                    ? `Next: ${new Date(r.nextDate + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                    : "Paused"}
                </small>
              </div>
              <MoneyAmount amount={r.amount} />
              <div className="row-actions">
                <button
                  className="icon-button"
                  aria-label={`${r.active ? "Pause" : "Resume"} ${r.name}`}
                  onClick={() => {
                    setData((d) => ({
                      ...d,
                      recurring: d.recurring.map((x) =>
                        x.id === r.id ? { ...x, active: !x.active } : x,
                      ),
                    }));
                    notify(
                      r.active
                        ? "Recurring payment paused"
                        : "Recurring payment resumed",
                    );
                  }}
                >
                  {r.active ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  className="icon-button"
                  aria-label={`Edit ${r.name}`}
                  onClick={() => setEdit(r)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Delete ${r.name}`}
                  onClick={() => setRemove(r.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
      ) : (
        <EmptyState
          title="No recurring payments yet."
          description="Add subscriptions or bills you pay regularly."
          action={
            <button className="button" onClick={() => setEdit(null)}>
              Add recurring expense
            </button>
          }
        />
      )}
      <p className="footnote">
        A view of your commitments. Recording an expense doesn’t happen
        automatically.
      </p>
      {edit !== undefined && (
        <Modal
          title={edit ? "Edit recurring expense" : "Add recurring expense"}
          onClose={() => setEdit(undefined)}
        >
          <form
            className="standard-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const item: RecurringExpense = {
                id: edit?.id ?? crypto.randomUUID(),
                name: String(f.get("name")).trim(),
                amount: Number(f.get("amount")),
                categoryId: String(f.get("category")),
                frequency: String(
                  f.get("frequency"),
                ) as RecurringExpense["frequency"],
                nextDate: String(f.get("nextDate")),
                paymentMethod: String(f.get("payment")) as PaymentMethod,
                active: edit?.active ?? true,
              };
              setData((d) => ({
                ...d,
                recurring: edit
                  ? d.recurring.map((r) => (r.id === item.id ? item : r))
                  : [...d.recurring, item],
              }));
              notify("Recurring expense saved");
              setEdit(undefined);
            }}
          >
            <label>
              Name
              <input
                name="name"
                autoFocus
                required
                maxLength={80}
                defaultValue={edit?.name}
                placeholder="e.g. Netflix"
              />
            </label>
            <div className="form-grid">
              <label>
                Amount (₹)
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  max="100000000"
                  step="0.01"
                  required
                  defaultValue={edit?.amount}
                />
              </label>
              <label>
                Frequency
                <select
                  name="frequency"
                  defaultValue={edit?.frequency ?? "Monthly"}
                >
                  {["Monthly", "Weekly", "Yearly"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Category
              <select
                name="category"
                defaultValue={edit?.categoryId ?? "subscriptions"}
              >
                {data.categories
                  .filter((c) => !c.archived)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Next payment
                <input
                  type="date"
                  name="nextDate"
                  defaultValue={edit?.nextDate ?? "2026-09-12"}
                  required
                />
              </label>
              <label>
                Payment method
                <select
                  name="payment"
                  defaultValue={
                    edit?.paymentMethod ?? data.settings.paymentMethod
                  }
                >
                  {paymentMethods.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button
                className="button"
                type="button"
                onClick={() => setEdit(undefined)}
              >
                Cancel
              </button>
              <button className="button primary">Save recurring expense</button>
            </div>
          </form>
        </Modal>
      )}
      {remove && (
        <ConfirmDialog
          title="Delete recurring expense?"
          description="This removes the schedule. Your recorded expenses will remain."
          onClose={() => setRemove(undefined)}
          onConfirm={() => {
            setData((d) => ({
              ...d,
              recurring: d.recurring.filter((r) => r.id !== remove),
            }));
            setRemove(undefined);
            notify("Recurring expense deleted");
          }}
        />
      )}
    </>
  );
}
