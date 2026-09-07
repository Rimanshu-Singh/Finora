"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Wallet,
  Repeat,
  CalendarDays,
  Shapes,
  Settings,
  Search,
  Sun,
  Moon,
  Plus,
  Ellipsis,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { useLedger } from "./provider";
const navigation = [
  { label: "Overview", href: "/", icon: House, group: "" },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    group: "MONEY",
  },
  { label: "Budgets", href: "/budgets", icon: Wallet },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  {
    label: "Analytics",
    href: "/analytics",
    icon: ChartNoAxesCombined,
    group: "INSIGHTS",
  },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Categories", href: "/categories", icon: Shapes, group: "MANAGE" },
];
export function DesktopSidebar() {
  const pathname = usePathname();
  const { data } = useLedger();
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark">
          <i />
          <i />
          <i />
        </span>
        finora<span className="brand-dot">.</span>
      </Link>
      <div className="workspace">
        <span className="avatar">{data.settings.name.charAt(0) || "R"}</span>
        <span>
          Personal space<small>Make room for clarity.</small>
        </span>
        <ChevronDown size={14} />
      </div>
      <nav aria-label="Main navigation">
        {navigation.map((n) => (
          <div key={n.href}>
            {n.group && <div className="nav-label">{n.group}</div>}
            <Link
              href={n.href}
              className={`nav-link ${pathname === n.href ? "selected" : ""}`}
              aria-current={pathname === n.href ? "page" : undefined}
            >
              <n.icon size={18} strokeWidth={1.65} />
              <span>{n.label}</span>
              {pathname === n.href && <span className="nav-dot" />}
            </Link>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="quiet-note">
          <span className="tiny-mark">✳</span>
          <p>
            A little awareness.
            <br />A lot more possibility.
          </p>
        </div>
        <Link
          className={`nav-link ${pathname === "/settings" ? "selected" : ""}`}
          href="/settings"
        >
          <Settings size={18} />
          Settings
        </Link>
        <div className="sidebar-footer">
          A space for your everyday.
          <ArrowUpRight size={13} />
        </div>
      </div>
    </aside>
  );
}
export function ThemeToggle() {
  const { data, setData } = useLedger();
  return (
    <button
      className="icon-button"
      aria-label="Toggle theme"
      onClick={() =>
        setData((d) => ({
          ...d,
          settings: {
            ...d.settings,
            theme:
              document.documentElement.dataset.theme === "dark"
                ? "Light"
                : "Dark",
          },
        }))
      }
    >
      {data.settings.theme === "Dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
export function MobileBottomNav() {
  const path = usePathname();
  const { openExpense } = useLedger();
  const items = [
    { label: "Home", href: "/", icon: House },
    { label: "Activity", href: "/transactions", icon: ArrowLeftRight },
    { label: "Insights", href: "/analytics", icon: ChartNoAxesCombined },
    { label: "More", href: "/more", icon: Ellipsis },
  ];
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.slice(0, 2).map((n) => (
        <Link
          key={n.href}
          href={n.href}
          aria-current={path === n.href ? "page" : undefined}
        >
          <n.icon size={20} />
          <span>{n.label}</span>
        </Link>
      ))}
      <button
        aria-label="Add expense"
        className="mobile-add"
        onClick={() => openExpense()}
      >
        <Plus size={24} />
      </button>
      {items.slice(2).map((n) => (
        <Link
          key={n.href}
          href={n.href}
          aria-current={path === n.href ? "page" : undefined}
        >
          <n.icon size={20} />
          <span>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const { openSearch, data } = useLedger();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <DesktopSidebar />
      <div className="app-content">
        <header className="topbar">
          <span className="topbar-label">Personal finance, thoughtfully.</span>
          <Link href="/" className="mobile-brand">
            finora.
          </Link>
          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={openSearch}
              aria-label="Search Finora"
            >
              <Search size={17} />
              <span>Search anything</span>
              <kbd>Ctrl K</kbd>
            </button>
            <div className="topbar-divider" />
            <ThemeToggle />
            <Link
              href="/settings"
              className="avatar"
              aria-label="Profile settings"
            >
              {data.settings.name.charAt(0) || "R"}
            </Link>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          <span>LESS GUESSWORK. MORE PEACE OF MIND.</span>
          <span>Finora · Your everyday, understood.</span>
        </footer>
      </div>
      <MobileBottomNav />
    </>
  );
}
