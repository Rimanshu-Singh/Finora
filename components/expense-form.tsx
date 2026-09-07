"use client";
import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { useLedger } from "./provider";
import { Modal, CategoryIcon } from "./ui";
import type { Expense, PaymentMethod } from "@/lib/types";
import { TODAY, money } from "@/lib/format";
export const paymentMethods: PaymentMethod[] = [
  "UPI",
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Wallet",
  "Other",
];
export function ExpenseForm({
  expense,
  onClose,
}: {
  expense: Expense | null;
  onClose: () => void;
}) {
  const { data, setData, notify } = useLedger();
  const [amount, setAmount] = useState(expense?.amount.toString() ?? ""),
    [category, setCategory] = useState(expense?.categoryId ?? "food"),
    [merchant, setMerchant] = useState(expense?.merchant ?? ""),
    [more, setMore] = useState(!!expense),
    [quick, setQuick] = useState(""),
    [note, setNote] = useState(expense?.note ?? ""),
    [error, setError] = useState("");
  function parseQuick(value: string) {
    setQuick(value);
    const match = value.match(/(?:₹\s*)?([\d,]+(?:\.\d{1,2})?)\s+(.+)/);
    if (!match) return;
    setAmount(match[1].replaceAll(",", ""));
    setMerchant(match[2]);
    const text = match[2].toLowerCase();
    setCategory(
      /uber|metro|taxi/.test(text)
        ? "transport"
        : /clothes|shirt|h&m/.test(text)
          ? "clothing"
          : /grocery|groceries|fresh/.test(text)
            ? "groceries"
            : "food",
    );
  }
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = Number(amount.replaceAll(",", ""));
    if (!Number.isFinite(value) || value < 0.01 || value > 100000000) {
      setError("Enter an amount between ₹0.01 and ₹10,00,00,000.");
      return;
    }
    const f = new FormData(e.currentTarget);
    const now = new Date().toISOString();
    const item: Expense = {
      id: expense?.id ?? crypto.randomUUID(),
      amount: Math.round(value * 100) / 100,
      categoryId: category,
      merchant:
        merchant.trim() ||
        data.categories.find((c) => c.id === category)?.name ||
        "Expense",
      description: merchant,
      date: String(f.get("date") || TODAY),
      time: String(f.get("time") || "12:00"),
      paymentMethod: String(
        f.get("payment") || data.settings.paymentMethod,
      ) as PaymentMethod,
      note,
      tags: String(f.get("tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isRecurring: f.get("recurring") === "on",
      createdAt: expense?.createdAt ?? now,
      updatedAt: now,
      location: String(f.get("location") || ""),
      attachment: (f.get("attachment") as File)?.name || expense?.attachment,
      split: Number(f.get("split") || 1),
    };
    setData((d) => ({
      ...d,
      expenses: expense
        ? d.expenses.map((x) => (x.id === expense.id ? item : x))
        : [item, ...d.expenses],
    }));
    notify(
      `${expense ? "Expense updated" : "Expense added"} · ${money(item.amount)} · ${data.categories.find((c) => c.id === category)?.name}`,
    );
    onClose();
  }
  return (
    <Modal
      title={expense ? "Edit expense" : "A little spent. All accounted for."}
      onClose={onClose}
    >
      <form onSubmit={save} className="expense-form">
        {!expense && data.settings.suggestions && (
          <div className="quick-entry">
            <Sparkles size={16} />
            <input
              aria-label="Quick entry"
              placeholder="Try “450 uber” or “320 dinner”"
              value={quick}
              onChange={(e) => parseQuick(e.target.value)}
            />
            <span>QUICK ENTRY</span>
          </div>
        )}
        <label className="field-label" htmlFor="expense-amount">
          AMOUNT
        </label>
        <div className="amount-input">
          <span>₹</span>
          <input
            id="expense-amount"
            data-autofocus
            autoFocus
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "amount-error" : undefined}
            required
          />
        </div>
        {error && (
          <p className="error-text" id="amount-error">
            {error}
          </p>
        )}
        <fieldset className="category-picker">
          <legend>Category</legend>
          <div>
            {data.categories
              .filter((c) => !c.archived || c.id === category)
              .map((c) => (
                <button
                  type="button"
                  key={c.id}
                  aria-pressed={category === c.id}
                  aria-label={c.name}
                  className={category === c.id ? "active" : ""}
                  onClick={() => setCategory(c.id)}
                >
                  <CategoryIcon name={c.icon} />
                  {c.name}
                </button>
              ))}
          </div>
        </fieldset>
        <label>
          Merchant / paid to
          <input
            placeholder="Where did it go? (optional)"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            maxLength={100}
          />
        </label>
        <div className="form-grid">
          <label>
            Date
            <input
              name="date"
              type="date"
              defaultValue={expense?.date ?? TODAY}
              required
            />
          </label>
          <label>
            Payment method
            <select
              name="payment"
              defaultValue={
                expense?.paymentMethod ?? data.settings.paymentMethod
              }
            >
              {paymentMethods.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
        {data.settings.askNote && !more && (
          <label>
            Note
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was it for?"
            />
          </label>
        )}
        <button
          className="text-button more-details"
          type="button"
          onClick={() => setMore(!more)}
          aria-expanded={more}
        >
          More details <ChevronDown size={16} />
        </button>
        <div className="advanced-fields" hidden={!more}>
          <div className="form-grid">
            <label>
              Time
              <input
                type="time"
                name="time"
                defaultValue={expense?.time ?? "12:00"}
              />
            </label>
            <label>
              Tags
              <input
                name="tags"
                placeholder="work, essentials"
                defaultValue={expense?.tags.join(", ")}
              />
            </label>
          </div>
          <label>
            Note
            <textarea
              name="note"
              placeholder="Anything to remember?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="form-grid">
            <label>
              Location
              <input
                name="location"
                defaultValue={expense?.location}
                placeholder="Optional"
              />
            </label>
            <label>
              Split between
              <input
                name="split"
                type="number"
                min="1"
                max="100"
                defaultValue={expense?.split ?? 1}
              />
            </label>
          </div>
          <label>
            Attachment
            <input name="attachment" type="file" accept="image/*,.pdf" />
            <small>Receipt name is kept for this session only.</small>
          </label>
          <label className="check-label">
            <input
              name="recurring"
              type="checkbox"
              defaultChecked={expense?.isRecurring}
            />
            Mark as recurring
          </label>
        </div>
        <div className="sticky-save">
          <button type="button" className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            {expense ? "Save changes" : "Add expense"}
            <span aria-hidden="true">↵</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
