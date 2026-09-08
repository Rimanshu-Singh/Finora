"use client";
import { useState } from "react";
import { Plus, ArrowUpRight, Archive } from "lucide-react";
import { useLedger } from "./provider";
import { PageHeader, CategoryIcon, MoneyAmount, Modal } from "./ui";
import { BudgetEditor } from "./budgets";
import { sum, MONTH } from "@/lib/format";
import { saveCategoryAction } from "@/lib/db/mutations/categories";
import type { Category } from "@/lib/types";
export function CategoriesPage() {
  const { data, setData, notify } = useLedger();
  const [edit, setEdit] = useState<Category | null | undefined>(),
    [budget, setBudget] = useState<string>(),
    [showArchived, setShowArchived] = useState(false);
  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organize spending around your life."
        action={
          <button className="button primary" onClick={() => setEdit(null)}>
            <Plus size={16} />
            New category
          </button>
        }
      />
      <div className="section-heading">
        <span className="muted small">
          {data.categories.filter((c) => !c.archived).length} categories ·
          September spending
        </span>
        <label className="check-label small">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </div>
      <div className="category-grid">
        {data.categories
          .filter((c) => showArchived || !c.archived)
          .map((c) => {
            const expenses = data.expenses.filter(
              (e) => e.categoryId === c.id && e.date.startsWith(MONTH),
            );
            const b = data.budgets.find((b) => b.categoryId === c.id);
            return (
              <article
                className={`category-tile ${c.archived ? "archived" : ""}`}
                key={c.id}
              >
                <div className="section-top">
                  <CategoryIcon name={c.icon} />
                  <button
                    className="icon-button"
                    aria-label={`Edit ${c.name}`}
                    onClick={() => setEdit(c)}
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                <h3>
                  {c.name}
                  {c.archived ? " · Archived" : ""}
                </h3>
                <small className="muted">
                  {expenses.length} expenses this month
                </small>
                <div className="category-tile-bottom">
                  <MoneyAmount amount={sum(expenses)} />
                  <button
                    className="text-button small"
                    onClick={() => setBudget(c.id)}
                  >
                    {b ? (
                      <>
                        of <MoneyAmount amount={b.limit} />
                      </>
                    ) : (
                      "Set budget"
                    )}
                  </button>
                </div>
              </article>
            );
          })}
      </div>
      {edit !== undefined && (
        <Modal
          title={edit ? "Edit category" : "New category"}
          onClose={() => setEdit(undefined)}
        >
          <form
            className="standard-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const name = String(f.get("name")).trim();
              if (!name) return;
              const item: Category = {
                id: edit?.id ?? crypto.randomUUID(),
                name,
                icon: String(f.get("icon")),
                parentId: String(f.get("parent")) || undefined,
                archived: edit?.archived ?? false,
                sortOrder: edit?.sortOrder ?? data.categories.length,
              };
              if (
                data.categories.some(
                  (c) =>
                    c.id !== item.id &&
                    c.name.toLowerCase() === name.toLowerCase(),
                )
              ) {
                notify("A category with that name already exists");
                return;
              }
              setData((d) => ({
                ...d,
                categories: edit
                  ? d.categories.map((c) => (c.id === edit.id ? item : c))
                  : [...d.categories, item],
                budgets:
                  Number(f.get("budget")) > 0
                    ? [
                        ...d.budgets.filter((b) => b.categoryId !== item.id),
                        {
                          id: crypto.randomUUID(),
                          categoryId: item.id,
                          limit: Number(f.get("budget")),
                          spent: 0,
                          period: MONTH,
                          carry: false,
                        },
                      ]
                    : d.budgets,
              }));
              notify("Category saved");
              setEdit(undefined);

              try {
                await saveCategoryAction(item.id, {
                  name: item.name,
                  icon: item.icon,
                  parentId: item.parentId,
                });
              } catch (err) {
                console.error("Failed to persist category:", err);
              }
            }}
          >
            <label>
              Name
              <input
                autoFocus
                name="name"
                required
                maxLength={40}
                defaultValue={edit?.name}
              />
            </label>
            <label>
              Icon
              <select name="icon" defaultValue={edit?.icon ?? "Other"}>
                {[
                  "Food",
                  "Groceries",
                  "Transport",
                  "Shopping",
                  "Clothing",
                  "Bills",
                  "Subscriptions",
                  "Entertainment",
                  "Health",
                  "Education",
                  "Travel",
                  "Personal Care",
                  "Gifts",
                  "Other",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Parent category
              <select name="parent" defaultValue={edit?.parentId ?? ""}>
                <option value="">None</option>
                {data.categories
                  .filter(
                    (c) => c.id !== edit?.id && !c.parentId && !c.archived,
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Monthly budget (optional)
              <input
                name="budget"
                type="number"
                min="1"
                max="100000000"
                defaultValue={
                  data.budgets.find((b) => b.categoryId === edit?.id)?.limit
                }
              />
            </label>
            <div className="form-actions">
              {edit && (
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setData((d) => ({
                      ...d,
                      categories: d.categories.map((c) =>
                        c.id === edit.id ? { ...c, archived: !c.archived } : c,
                      ),
                    }));
                    notify(
                      edit.archived ? "Category restored" : "Category archived",
                    );
                    setEdit(undefined);
                  }}
                >
                  <Archive size={15} />
                  {edit.archived ? "Restore" : "Archive"}
                </button>
              )}
              <button className="button primary">Save category</button>
            </div>
          </form>
        </Modal>
      )}
      {budget && (
        <BudgetEditor
          categoryId={budget}
          budget={data.budgets.find((b) => b.categoryId === budget)}
          onClose={() => setBudget(undefined)}
        />
      )}
    </>
  );
}
