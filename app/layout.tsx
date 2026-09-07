import type { Metadata } from "next";
import { LedgerProvider } from "@/components/provider";
import { AppShell } from "@/components/app-shell";
import { getLedgerData } from "@/lib/data";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Ledger — Your everyday, understood",
    template: "%s · Ledger",
  },
  description: "A calm, considered space for everyday spending.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LedgerProvider initial={getLedgerData()}>
          <AppShell>{children}</AppShell>
        </LedgerProvider>
      </body>
    </html>
  );
}
