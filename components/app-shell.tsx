"use client";
import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { useLedger } from "./provider";
import { useUser } from "@clerk/nextjs";
import { UserMenu } from "./auth/user-menu";
const navigation = [
  { label: "Overview", href: "/dashboard", icon: House, group: "" },
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
export function DesktopSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { data } = useLedger();
  const { user } = useUser();
  const avatarLetter = (
    user?.firstName?.charAt(0) ||
    data.settings.name.charAt(0) ||
    "R"
  ).toUpperCase();
  const spaceLabel = user?.firstName
    ? `${user.firstName}'s space`
    : "Personal space";

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar-mobile-open" : ""}`}
      aria-label="Main navigation sidebar"
    >
      <div className="sidebar-brand-row">
        <Link href="/dashboard" className="brand" onClick={onClose}>
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          finora<span className="brand-dot">.</span>
        </Link>
        <button
          type="button"
          className="mobile-sidebar-close icon-button"
          onClick={onClose}
          aria-label="Close navigation sidebar"
        >
          <X size={18} />
        </button>
      </div>
      <div className="workspace">
        <span className="avatar">
          {user?.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.imageUrl}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            avatarLetter
          )}
        </span>
        <span>
          {spaceLabel}
          <small>Make room for clarity.</small>
        </span>
        <ChevronDown size={14} />
      </div>
      <nav aria-label="Main navigation" className="sidebar-nav">
        {navigation.map((n) => (
          <div key={n.href}>
            {n.group && <div className="nav-label">{n.group}</div>}
            <Link
              href={n.href}
              className={`nav-link ${pathname === n.href ? "selected" : ""}`}
              aria-current={pathname === n.href ? "page" : undefined}
              onClick={onClose}
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
          onClick={onClose}
        >
          <Settings size={18} />
          <span>Settings</span>
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
  const isDark =
    data.settings.theme === "Dark" ||
    (typeof document !== "undefined" &&
      document.documentElement.dataset.theme === "dark");

  return (
    <button
      className="icon-button"
      aria-label="Toggle theme"
      onClick={() => {
        const nextTheme = isDark ? "Light" : "Dark";
        try {
          localStorage.setItem("finora_theme", nextTheme);
        } catch {}
        setData((d) => ({
          ...d,
          settings: {
            ...d.settings,
            theme: nextTheme,
          },
        }));
      }}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
export function MobileBottomNav() {
  const path = usePathname();
  const { openExpense } = useLedger();
  const items = [
    { label: "Home", href: "/dashboard", icon: House },
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
  const { openSearch } = useLedger();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSidebarOpen(false);
  }

  if (pathname === "/") return <>{children}</>;

  // Auth pages (sign-in, sign-up) render centered without the application dashboard shell
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Backdrop for Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <DesktopSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-content">
        <header className="topbar">
          <div className="topbar-left-group">
            <button
              type="button"
              className="mobile-sidebar-toggle icon-button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={
                sidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={sidebarOpen}
            >
              <Menu size={20} />
            </button>
            <span className="topbar-label">
              Personal finance, thoughtfully.
            </span>
            <Link href="/dashboard" className="mobile-brand">
              finora.
            </Link>
          </div>

          <div className="topbar-actions">
            <button
              className="search-trigger"
              onClick={openSearch}
              aria-label="Search Finora"
            >
              <Search size={14} className="search-trigger-icon" />
              <span className="search-trigger-text">Search anything…</span>
              <kbd className="search-trigger-kbd">
                <span className="kbd-cmd">⌘</span>K
              </kbd>
            </button>
            <div className="topbar-divider" />
            <ThemeToggle />
            <UserMenu />
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
