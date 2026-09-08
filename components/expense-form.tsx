"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Sparkles } from "lucide-react";
import { useLedger } from "./provider";
import { Modal, CategoryIcon } from "./ui";
import type { Expense, PaymentMethod } from "@/lib/types";
import { TODAY, money } from "@/lib/format";
import {
  createExpenseAction,
  updateExpenseAction,
} from "@/lib/db/mutations/expenses";
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
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [amount, setAmount] = useState(expense?.amount.toString() ?? ""),
    [category, setCategory] = useState(expense?.categoryId ?? "food"),
    [merchant, setMerchant] = useState(expense?.merchant ?? ""),
    [date, setDate] = useState(expense?.date ?? TODAY),
    [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
      expense?.paymentMethod ?? data.settings.paymentMethod,
    ),
    [time, setTime] = useState(expense?.time ?? "12:00"),
    [tags, setTags] = useState(expense?.tags.join(", ") ?? ""),
    [note, setNote] = useState(expense?.note ?? ""),
    [location, setLocation] = useState(expense?.location ?? ""),
    [split, setSplit] = useState(expense?.split ?? 1),
    [more, setMore] = useState(!!expense),
    [quick, setQuick] = useState(""),
    [quickLoading, setQuickLoading] = useState(false),
    [quickError, setQuickError] = useState(""),
    [error, setError] = useState("");

  function applyQuickEntryResult(result: {
    amount?: number | null;
    category?: string | null;
    merchant?: string | null;
    description?: string | null;
    date?: string | null;
    time?: string | null;
    paymentMethod?: PaymentMethod | null;
    tags?: string[] | null;
    note?: string | null;
    location?: string | null;
    split?: number | null;
  }) {
    if (result.amount != null) {
      setAmount(result.amount.toString());
      setError("");
    }

    if (result.category) {
      const catId = result.category.toLowerCase().replaceAll(" ", "-");
      const match = data.categories.find(
        (c) =>
          c.id === catId ||
          c.name.toLowerCase() === result.category!.toLowerCase(),
      );
      if (match) {
        setCategory(match.id);
      }
    }

    if (result.merchant != null && result.merchant.trim() !== "") {
      setMerchant(result.merchant.trim());
    } else if (result.description != null && result.description.trim() !== "") {
      setMerchant(result.description.trim());
    }

    if (result.date != null && result.date.trim() !== "") {
      setDate(result.date.trim());
    }

    if (result.paymentMethod != null) {
      setPaymentMethod(result.paymentMethod);
    }

    let hasAdvancedDetails = false;

    if (result.time != null && result.time.trim() !== "") {
      setTime(result.time.trim());
      hasAdvancedDetails = true;
    }

    if (result.tags != null && result.tags.length > 0) {
      setTags(result.tags.join(", "));
      hasAdvancedDetails = true;
    }

    if (result.note != null && result.note.trim() !== "") {
      setNote(result.note.trim());
      hasAdvancedDetails = true;
    }

    if (result.location != null && result.location.trim() !== "") {
      setLocation(result.location.trim());
      hasAdvancedDetails = true;
    }

    if (result.split != null && result.split > 1) {
      setSplit(result.split);
      hasAdvancedDetails = true;
    }

    if (hasAdvancedDetails) {
      setMore(true);
    }
  }

  async function handleQuickEntry() {
    const trimmed = quick.trim();
    if (!trimmed || quickLoading) return;

    setQuickLoading(true);
    setQuickError("");

    try {
      const res = await fetch("/api/ai/quick-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setQuickError(
          json.error || "Couldn't understand that. Try ‘450 Uber’.",
        );
        return;
      }

      applyQuickEntryResult(json.data);
    } catch {
      setQuickError(
        "Quick Entry isn't available right now. You can still enter the expense manually.",
      );
    } finally {
      setQuickLoading(false);
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = Number(amount.replaceAll(",", ""));
    if (!Number.isFinite(value) || value < 0.01 || value > 100000000) {
      setError("Enter an amount between ₹0.01 and ₹10,00,00,000.");
      return;
    }
    const f = new FormData(e.currentTarget);
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      amount: value,
      categoryId: category,
      merchant:
        merchant.trim() ||
        data.categories.find((c) => c.id === category)?.name ||
        "Expense",
      description: merchant.trim() || undefined,
      date: date || String(f.get("date") || TODAY),
      time: time || String(f.get("time") || "12:00"),
      paymentMethod,
      note: note.trim() || undefined,
      tags: tagList,
      location: location.trim() || undefined,
      split: Number(split || 1),
      isRecurring: f.get("recurring") === "on",
    };

    setIsSaving(true);

    try {
      if (expense) {
        const res = await updateExpenseAction(expense.id, payload);
        if (res.success && res.data) {
          setData((d) => ({
            ...d,
            expenses: d.expenses.map((x) => (x.id === expense.id ? res.data! : x)),
          }));
          notify(
            `Expense updated · ${money(res.data.amount)} · ${data.categories.find((c) => c.id === res.data!.categoryId)?.name ?? "Expense"}`,
          );
          onClose();
          router.refresh();
        } else {
          notify(res.error || "Could not update expense. Please try again.");
        }
      } else {
        const res = await createExpenseAction(payload, !!quick);
        if (res.success && res.data) {
          setData((d) => ({
            ...d,
            expenses: [res.data!, ...d.expenses],
          }));
          notify(
            `Expense added · ${money(res.data.amount)} · ${data.categories.find((c) => c.id === res.data!.categoryId)?.name ?? "Expense"}`,
          );
          onClose();
          router.refresh();
        } else {
          notify(res.error || "Could not save expense. Please try again.");
        }
      }
    } catch (err) {
      console.error("Failed to persist expense:", err);
      notify("Could not save expense. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={expense ? "Edit expense" : "A little spent. All accounted for."}
      onClose={onClose}
    >
      <form onSubmit={save} className="expense-form">
        {!expense && data.settings.suggestions && (
          <>
            <div className="quick-entry">
              <Sparkles
                size={16}
                className={
                  quickLoading
                    ? "quick-entry-sparkle is-loading"
                    : "quick-entry-sparkle"
                }
              />
              <input
                aria-label="Quick entry"
                placeholder="Try “450 uber” or “320 dinner”"
                value={quick}
                disabled={quickLoading}
                onChange={(e) => {
                  setQuick(e.target.value);
                  if (quickError) setQuickError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuickEntry();
                  }
                }}
              />
              <button
                type="button"
                className="quick-entry-action"
                disabled={quickLoading || !quick.trim()}
                onClick={handleQuickEntry}
              >
                {quickLoading ? "Parsing..." : "QUICK ENTRY"}
              </button>
            </div>
            {quickError && (
              <p className="quick-entry-error" role="alert">
                {quickError}
              </p>
            )}
          </>
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label>
            Payment method
            <select
              name="payment"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
            >
              {paymentMethods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
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
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
            <label>
              Tags
              <input
                name="tags"
                placeholder="work, essentials"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                value={split}
                onChange={(e) =>
                  setSplit(Math.max(1, Number(e.target.value)))
                }
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
          <button className="button primary" type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : (expense ? "Save changes" : "Add expense")}
            <span aria-hidden="true">↵</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
