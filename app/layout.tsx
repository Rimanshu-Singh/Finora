import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { LedgerProvider } from "@/components/provider";
import { AppShell } from "@/components/app-shell";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { getUserLedgerData } from "@/lib/data/user-ledger";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Finora — Your everyday, understood",
    template: "%s · Finora",
  },
  description: "A calm, considered space for everyday spending.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await getUserLedgerData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#171717",
              colorBackground: "#ffffff",
              borderRadius: "7px",
            },
          }}
        >
          <PostHogProvider>
            <LedgerProvider initial={initialData}>
              <AppShell>{children}</AppShell>
            </LedgerProvider>
          </PostHogProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
