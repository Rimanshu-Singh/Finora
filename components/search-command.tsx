"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight, Settings } from "lucide-react";
import { useLedger } from "./provider";
import { Modal, CategoryIcon, MoneyAmount } from "./ui";
export function SearchCommand({ onClose }: { onClose: () => void }) {
  const { data } = useLedger();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const q = query.toLowerCase().replace("₹", "").replaceAll(",", "").trim();
  const items = data.expenses
    .filter((e) =>
      `${e.merchant} ${e.amount} ${e.categoryId} ${e.note} ${new Date(e.date + "T12:00:00").toLocaleDateString("en-IN", { month: "long" })}`
        .toLowerCase()
        .includes(q),
    )
    .slice(0, 7);
  const categories = data.categories
    .filter((c) => c.name.toLowerCase().includes(q) && !c.archived)
    .slice(0, 4);
  const go = (path: string) => {
    onClose();
    router.push(path);
  };
  return (
    <Modal title="Search your Ledger" onClose={onClose}>
      <div className="search-field command-input">
        <Search size={19} />
        <input
          autoFocus
          placeholder="Merchant, category, amount, or month…"
          aria-label="Search Ledger"
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
        {!items.length && (
          <p className="muted">No transactions match your search.</p>
        )}
        {categories.length > 0 && <div className="eyebrow">CATEGORIES</div>}
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
        {(!q || "settings theme currency preferences".includes(q)) && (
          <>
            <div className="eyebrow">SETTINGS</div>
            <button className="command-result" onClick={() => go("/settings")}>
              <Settings size={18} />
              <span>Settings & preferences</span>
              <ArrowUpRight size={15} />
            </button>
          </>
        )}
      </div>
      <div className="command-footer">
        ↑ ↓ to navigate <span>↵ to open · esc to close</span>
      </div>
    </Modal>
  );
}
