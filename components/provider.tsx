"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { LedgerData, Expense } from "@/lib/types";
import { ExpenseForm } from "./expense-form";
import { SearchCommand } from "./search-command";
type Context = {
  data: LedgerData;
  setData: React.Dispatch<React.SetStateAction<LedgerData>>;
  openExpense: (expense?: Expense) => void;
  openSearch: () => void;
  notify: (message: string) => void;
};
const LedgerContext = createContext<Context | null>(null);
export function useLedger() {
  const c = useContext(LedgerContext);
  if (!c) throw Error("Ledger provider missing");
  return c;
}
export function LedgerProvider({
  initial,
  children,
}: {
  initial: LedgerData;
  children: ReactNode;
}) {
  const [data, setData] = useState(initial),
    [editor, setEditor] = useState<Expense | null | undefined>(undefined),
    [search, setSearch] = useState(false),
    [toast, setToast] = useState("");
  const openExpense = useCallback(
    (expense?: Expense) => setEditor(expense ?? null),
    [],
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () =>
      (document.documentElement.dataset.theme =
        data.settings.theme === "System"
          ? media.matches
            ? "dark"
            : "light"
          : data.settings.theme.toLowerCase());
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [data.settings.theme]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  return (
    <LedgerContext.Provider
      value={{
        data,
        setData,
        openExpense,
        openSearch: () => setSearch(true),
        notify: setToast,
      }}
    >
      {children}
      {editor !== undefined && (
        <ExpenseForm expense={editor} onClose={() => setEditor(undefined)} />
      )}{" "}
      {search && <SearchCommand onClose={() => setSearch(false)} />}
      <div className={`toast ${toast ? "visible" : ""}`} role="status">
        {toast}
      </div>
    </LedgerContext.Provider>
  );
}
