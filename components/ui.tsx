"use client";
import { useEffect, useRef, useId, type ReactNode } from "react";
import {
  Utensils,
  ShoppingBasket,
  Car,
  ShoppingBag,
  Shirt,
  Receipt,
  Repeat,
  Film,
  HeartPulse,
  BookOpen,
  Plane,
  Scissors,
  Gift,
  Shapes,
  X,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import type { Period } from "@/lib/types";
import { money } from "@/lib/format";
import { useLedger } from "./provider";
const icons: Record<string, typeof Utensils> = {
  Food: Utensils,
  Groceries: ShoppingBasket,
  Transport: Car,
  Shopping: ShoppingBag,
  Clothing: Shirt,
  Bills: Receipt,
  Subscriptions: Repeat,
  Entertainment: Film,
  Health: HeartPulse,
  Education: BookOpen,
  Travel: Plane,
  "Personal Care": Scissors,
  Gifts: Gift,
  Other: Shapes,
};
export function CategoryIcon({ name }: { name: string }) {
  const Icon = icons[name] ?? Shapes;
  return (
    <span className="category-icon">
      <Icon size={18} strokeWidth={1.6} />
    </span>
  );
}
export function MoneyAmount({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const { data } = useLedger();
  return (
    <span className={`money ${className}`}>
      {money(amount, data.settings.currency, data.settings.locale)}
    </span>
  );
}
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">YOUR PERSONAL LEDGER</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}
export function AddButton() {
  const { openExpense } = useLedger();
  return (
    <button className="button primary" onClick={() => openExpense()}>
      <Plus size={17} />
      Add expense
    </button>
  );
}
export function PeriodSelector<T extends string = Period>({
  value,
  onChange,
  options = ["Today", "Week", "Month", "Year"] as T[],
}: {
  value: T;
  onChange: (p: T) => void;
  options?: T[];
}) {
  return (
    <div className="periods" aria-label="Spending period">
      {options.map((p) => (
        <button key={p} aria-pressed={value === p} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
    </div>
  );
}
export function BudgetProgress({
  spent,
  limit,
}: {
  spent: number;
  limit: number;
}) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label="Budget used"
      aria-valuenow={Math.round((spent / limit) * 100)}
      aria-valuemin={0}
      aria-valuemax={Math.max(100, Math.round((spent / limit) * 100))}
    >
      <span style={{ width: `${Math.min(100, (spent / limit) * 100)}%` }} />
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = ref.current;
    dialog?.showModal();
    const firstInput =
      dialog?.querySelector<HTMLElement>("[data-autofocus]") ??
      dialog?.querySelector<HTMLElement>(
        'input:not([type="checkbox"]), textarea',
      );
    firstInput?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`sheet ${wide ? "wide" : ""}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet-inner">
        <div className="sheet-header">
          <h2 id={id}>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="muted">{description}</p>
      <div className="form-actions">
        <button className="button" onClick={onClose}>
          Cancel
        </button>
        <button className="button danger" onClick={onConfirm}>
          Delete expense
        </button>
      </div>
    </Modal>
  );
}
export function EmptyState({
  title = "No expenses here.",
  description = "A little clarity starts with your first expense.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Receipt size={28} strokeWidth={1} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <EmptyState
      title="Something went wrong."
      description="Please try opening this page again."
      action={
        <button className="button" onClick={retry}>
          Try again <ArrowUpRight size={16} />
        </button>
      }
    />
  );
}
