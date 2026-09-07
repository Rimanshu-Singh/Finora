"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export function UserMenu() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <span className="avatar avatar-skeleton" aria-hidden="true" />;
  }

  if (!isSignedIn) {
    return (
      <Link href="/sign-in" className="avatar" aria-label="Sign in">
        ?
      </Link>
    );
  }

  return (
    <div className="user-menu-root" aria-label="Account menu">
      <UserButton
        appearance={{
          elements: {
            rootBox: "flex items-center justify-center",
            userButtonAvatarBox: "w-7 h-7",
            userButtonTrigger: "focus:outline-none focus:ring-0",
          },
        }}
      />
    </div>
  );
}

/**
 * Hook to retrieve the user's preferred greeting display name
 * Fallback order:
 * 1. firstName
 * 2. fullName
 * 3. email username
 * 4. fallbackName (e.g. from settings)
 * 5. "there"
 */
export function useClerkDisplayName(fallbackName?: string): string {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return fallbackName || "there";
  }

  if (user.firstName?.trim()) {
    return user.firstName.trim();
  }

  if (user.fullName?.trim()) {
    return user.fullName.trim();
  }

  const email = user.emailAddresses?.[0]?.emailAddress;
  if (email) {
    return email.split("@")[0];
  }

  return fallbackName || "there";
}
