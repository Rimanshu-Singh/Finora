"use client";
import Link from "next/link";
import {
  Wallet,
  Shapes,
  Repeat,
  CalendarDays,
  Settings,
  ChevronRight,
  Search,
} from "lucide-react";
import { useLedger } from "./provider";
import { PageHeader, MoneyAmount } from "./ui";
import { sum, MONTH } from "@/lib/format";
export function MorePage() {
  const { data, openSearch } = useLedger();
  return (
    <>
      <PageHeader
        title="Your Finora"
        subtitle="A little more control. A lot more clarity."
      />
      <section className="more-summary">
        <span className="eyebrow">SEPTEMBER SPENDING</span>
        <MoneyAmount
          className="analytics-amount"
          amount={sum(data.expenses.filter((e) => e.date.startsWith(MONTH)))}
        />
      </section>
      <nav className="more-links">
        {[
          { label: "Budgets", href: "/budgets", icon: Wallet },
          { label: "Categories", href: "/categories", icon: Shapes },
          { label: "Recurring", href: "/recurring", icon: Repeat },
          { label: "Calendar", href: "/calendar", icon: CalendarDays },
          { label: "Settings", href: "/settings", icon: Settings },
        ].map((n) => (
          <Link key={n.href} href={n.href}>
            <n.icon size={19} />
            <span>{n.label}</span>
            <ChevronRight size={17} />
          </Link>
        ))}
        <button onClick={openSearch}>
          <Search size={19} />
          <span>Search</span>
          <ChevronRight size={17} />
        </button>
      </nav>
    </>
  );
}
