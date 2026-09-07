"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight, Settings, X } from "lucide-react";
import { useLedger } from "./provider";
import { Modal, CategoryIcon, MoneyAmount } from "./ui";

type SearchFilter = "all" | "expenses" | "categories" | "settings";

export function SearchCommand({ onClose }: { onClose: () => void }) {
  const { data } = useLedger();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const router = useRouter();
  const q = query.toLowerCase().replace("₹", "").replaceAll(",", "").trim();

  const items = data.expenses
    .filter((e) =>
      `${e.merchant} ${e.amount} ${e.categoryId} ${e.note} ${new Date(e.date + "T12:00:00").toLocaleDateString("en-IN", { month: "long" })}`
        .toLowerCase()
        .includes(q),
    )
    .slice(0, filter === "expenses" ? 15 : 7);

  const categories = data.categories
    .filter((c) => c.name.toLowerCase().includes(q) && !c.archived)
    .slice(0, filter === "categories" ? 12 : 4);

  const showSettings =
    (filter === "all" || filter === "settings") &&
    (!q || "settings theme currency preferences name".includes(q));

  const showExpenses = filter === "all" || filter === "expenses";
  const showCategories = filter === "all" || filter === "categories";

  const totalResults =
    (showExpenses ? items.length : 0) +
    (showCategories ? categories.length : 0) +
    (showSettings ? 1 : 0);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Modal title="Search your Finora" onClose={onClose}>
      <div className="search-field command-input">
        <Search size={18} className="search-field-icon" />
        <input
          autoFocus
          placeholder="Merchant, category, amount, or month…"
          aria-label="Search Finora"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              (
                e.currentTarget
                  .closest(".sheet-inner")
                  ?.querySelector(".command-result") as HTMLElement
              )?.focus();
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="search-field-kbd">ESC</kbd>
        )}
      </div>

      {/* Quick Filter Tabs */}
      <div className="search-filter-pills" role="tablist" aria-label="Search filter">
        {(
          [
            { id: "all", label: "All" },
            { id: "expenses", label: "Transactions" },
            { id: "categories", label: "Categories" },
            { id: "settings", label: "Settings" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            className={`search-filter-pill ${filter === tab.id ? "active" : ""}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {q && (
          <span className="search-results-count">
            {totalResults} {totalResults === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      <div
        className="command-results"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const buttons = Array.from(
              e.currentTarget.querySelectorAll<HTMLButtonElement>(
                ".command-result",
              ),
            );
            const index = buttons.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            buttons[
              (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
                buttons.length
            ]?.focus();
          }
        }}
      >
        {showExpenses && items.length > 0 && (
          <>
            <div className="eyebrow">
              {q ? "TRANSACTIONS" : "RECENT TRANSACTIONS"}
            </div>
            {items.map((e) => (
              <button
                className="command-result"
                key={e.id}
                onClick={() => go(`/transactions/${e.id}`)}
              >
                <CategoryIcon
                  name={
                    data.categories.find((c) => c.id === e.categoryId)?.icon ??
                    "Other"
                  }
                />
                <span>
                  {e.merchant}
                  <small>{e.date}</small>
                </span>
                <MoneyAmount amount={e.amount} />
              </button>
            ))}
          </>
        )}

        {showCategories && categories.length > 0 && (
          <>
            <div className="eyebrow">CATEGORIES</div>
            {categories.map((c) => (
              <button
                className="command-result"
                key={c.id}
                onClick={() => go("/categories")}
              >
                <CategoryIcon name={c.icon} />
                <span>{c.name}</span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </>
        )}

        {showSettings && (
          <>
            <div className="eyebrow">SETTINGS</div>
            <button className="command-result" onClick={() => go("/settings")}>
              <Settings size={18} />
              <span>Settings & preferences</span>
              <ArrowUpRight size={15} />
            </button>
          </>
        )}

        {totalResults === 0 && (
          <div className="search-empty-state">
            <p className="muted">No results match &ldquo;{query}&rdquo;</p>
            <small>Try a different keyword, category, or clear filters</small>
          </div>
        )}
      </div>

      <div className="command-footer">
        <div className="command-footer-hints">
          <span className="footer-hint">
            <kbd className="hint-kbd">↑</kbd>
            <kbd className="hint-kbd">↓</kbd>
            <span>navigate</span>
          </span>
          <span className="footer-hint">
            <kbd className="hint-kbd">↵</kbd>
            <span>select</span>
          </span>
          <span className="footer-hint">
            <kbd className="hint-kbd">esc</kbd>
            <span>close</span>
          </span>
        </div>
      </div>
    </Modal>
  );
}
