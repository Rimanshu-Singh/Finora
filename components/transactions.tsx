"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";
import { useLedger } from "./provider";
import {
  CategoryIcon,
  MoneyAmount,
  PageHeader,
  AddButton,
  EmptyState,
  Modal,
  ConfirmDialog,
} from "./ui";
import { dateLabel, sum, inPeriod } from "@/lib/format";
import type { Expense, Period } from "@/lib/types";
import { paymentMethods } from "./expense-form";
export function TransactionRow({
  expense,
  onSelect,
}: {
  expense: Expense;
  onSelect?: (e: Expense) => void;
}) {
  const { data } = useLedger();
  const c = data.categories.find((c) => c.id === expense.categoryId);
  const body = (
    <>
      <CategoryIcon name={c?.icon ?? "Other"} />
      <span className="transaction-info">
        <strong>{expense.merchant}</strong>
        <small>
          {c?.name ?? "Other"} <span>·</span> {dateLabel(expense.date)}
          {expense.date === "2026-09-07" &&
            `, ${new Date(`2000-01-01T${expense.time}`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`}
        </small>
      </span>
      <span className="transaction-payment">{expense.paymentMethod}</span>
      <span className="transaction-amount">
        − <MoneyAmount amount={expense.amount} />
      </span>
    </>
  );
  return onSelect ? (
    <button className="transaction-row" onClick={() => onSelect(expense)}>
      {body}
    </button>
  ) : (
    <Link className="transaction-row" href={`/transactions/${expense.id}`}>
      {body}
    </Link>
  );
}
export function TransactionList({ expenses }: { expenses: Expense[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const item = expenses.find((e) => e.id === selected);
  return (
    <>
      {expenses.map((e) => (
        <TransactionRow
          key={e.id}
          expense={e}
          onSelect={(x) => setSelected(x.id)}
        />
      ))}
      {item && (
        <Modal title="Expense details" onClose={() => setSelected(null)}>
          <TransactionDetail expense={item} onClose={() => setSelected(null)} />
        </Modal>
      )}
    </>
  );
}
export function TransactionDetail({
  expense,
  onClose,
}: {
  expense: Expense;
  onClose?: () => void;
}) {
  const { data, setData, openExpense, notify } = useLedger();
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  const category = data.categories.find((c) => c.id === expense.categoryId);
  return (
    <>
      <div className="detail-hero">
        <CategoryIcon name={category?.icon ?? "Other"} />
        <MoneyAmount amount={expense.amount} />
        <h2>{expense.merchant}</h2>
        <span className="chip">{category?.name}</span>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Date</dt>
          <dd>
            {new Date(expense.date + "T12:00:00").toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{expense.time}</dd>
        </div>
        <div>
          <dt>Paid using</dt>
          <dd>{expense.paymentMethod}</dd>
        </div>
        <div>
          <dt>Note</dt>
          <dd>{expense.note || "No note added"}</dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd>{expense.tags.join(", ") || "No tags"}</dd>
        </div>
        {expense.location && (
          <div>
            <dt>Location</dt>
            <dd>{expense.location}</dd>
          </div>
        )}
        {expense.attachment && (
          <div>
            <dt>Receipt</dt>
            <dd>{expense.attachment}</dd>
          </div>
        )}
        {expense.isRecurring && (
          <div>
            <dt>Recurring</dt>
            <dd>Yes</dd>
          </div>
        )}
        {!!expense.split && expense.split > 1 && (
          <div>
            <dt>Your share · {expense.split} people</dt>
            <dd>
              <MoneyAmount amount={expense.amount / expense.split} />
            </dd>
          </div>
        )}
      </dl>
      <div className="detail-actions">
        <button
          className="button primary"
          onClick={() => {
            onClose?.();
            openExpense(expense);
          }}
        >
          <Pencil size={15} />
          Edit
        </button>
        <button
          className="button"
          onClick={() => {
            const copy = {
              ...expense,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setData((d) => ({ ...d, expenses: [copy, ...d.expenses] }));
            notify("Expense duplicated");
          }}
        >
          <Copy size={15} />
          Duplicate
        </button>
        <button
          className="icon-button"
          aria-label="Delete expense"
          onClick={() => setConfirm(true)}
        >
          <Trash2 size={17} />
        </button>
      </div>
      {confirm && (
        <ConfirmDialog
          title="Delete this expense?"
          description="This expense will be removed from your spending totals for this session."
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            setData((d) => ({
              ...d,
              expenses: d.expenses.filter((e) => e.id !== expense.id),
            }));
            setConfirm(false);
            notify("Expense deleted");
            if (onClose) onClose();
            else router.push("/transactions");
          }}
        />
      )}
    </>
  );
}
export function TransactionDetailPage({ id }: { id: string }) {
  const { data } = useLedger();
  const item = data.expenses.find((e) => e.id === id);
  return (
    <div className="detail-page">
      <Link className="text-button" href="/transactions">
        <ArrowLeft size={16} />
        All transactions
      </Link>
      {item ? (
        <TransactionDetail expense={item} />
      ) : (
        <EmptyState
          title="Expense not found."
          description="It may have been deleted, or belonged to a previous demo session."
        />
      )}
    </div>
  );
}
export function TransactionsPage() {
  const { data } = useLedger();
  const [query, setQuery] = useState(""),
    [period, setPeriod] = useState("All"),
    [category, setCategory] = useState(""),
    [payment, setPayment] = useState(""),
    [sort, setSort] = useState("Newest"),
    [filters, setFilters] = useState(false),
    [min, setMin] = useState(""),
    [max, setMax] = useState(""),
    [start, setStart] = useState(""),
    [end, setEnd] = useState("");
  const items = useMemo(
    () =>
      data.expenses
        .filter(
          (e) =>
            (period === "All" || inPeriod(e, period as Period)) &&
            (!category || e.categoryId === category) &&
            (!payment || e.paymentMethod === payment) &&
            (!min || e.amount >= Number(min)) &&
            (!max || e.amount <= Number(max)) &&
            (!start || e.date >= start) &&
            (!end || e.date <= end) &&
            `${e.merchant} ${e.note} ${e.amount} ${data.categories.find((c) => c.id === e.categoryId)?.name}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "Highest"
            ? b.amount - a.amount
            : sort === "Lowest"
              ? a.amount - b.amount
              : sort === "Oldest"
                ? `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
                : `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
        ),
    [data, period, category, payment, min, max, start, end, query, sort],
  );
  const groups = Object.groupBy(items, (e) => e.date);
  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Every expense, in one place."
        action={<AddButton />}
      />
      <div className="filter-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Search transactions"
            placeholder="Search transactions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          className="button"
          aria-expanded={filters}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
        <select
          aria-label="Sort transactions"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {["Newest", "Oldest", "Highest", "Lowest"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="transaction-tabs">
        {["All", "Today", "Week", "Month"].map((p) => (
          <button
            className={period === p ? "active" : ""}
            key={p}
            onClick={() => setPeriod(p)}
          >
            {p === "Week" ? "This week" : p === "Month" ? "This month" : p}
          </button>
        ))}
        <span>
          {items.length} expenses · <MoneyAmount amount={sum(items)} />
        </span>
      </div>
      {filters && (
        <div className="filters">
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {data.categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Payment
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="">All methods</option>
              {paymentMethods.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Minimum amount
            <input
              type="number"
              min="0"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </label>
          <label>
            Maximum amount
            <input
              type="number"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </label>
          <label>
            From
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <button
            className="text-button"
            onClick={() => {
              setCategory("");
              setPayment("");
              setMin("");
              setMax("");
              setStart("");
              setEnd("");
              setQuery("");
              setPeriod("All");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {items.length ? (
        Object.entries(groups).map(([date, expenses]) => (
          <section className="transaction-group" key={date}>
            <div className="group-label">
              <span>{dateLabel(date)}</span>
              <MoneyAmount amount={sum(expenses ?? [])} />
            </div>
            <TransactionList expenses={expenses ?? []} />
          </section>
        ))
      ) : (
        <EmptyState
          title="No matching expenses."
          description="Try a different search or clear your filters."
        />
      )}
    </>
  );
}
