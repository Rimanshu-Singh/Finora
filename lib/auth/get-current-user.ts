import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import type { User } from "@prisma/client";

/**
 * Safely returns the authenticated Clerk user.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentUser() {
  try {
    return await currentUser();
  } catch {
    return null;
  }
}

/**
 * Retrieves the application database User record corresponding to the
 * authenticated Clerk user. Creates the record on first login if it doesn't exist.
 */
export async function getOrCreateCurrentUser(): Promise<User | null> {
  const clerkUser = await getCurrentUser();
  if (!clerkUser) return null;

  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          currency: "INR",
          timezone: "Asia/Kolkata",
        },
      });
    }

    return user;
  } catch (err) {
    console.error("Error in getOrCreateCurrentUser:", err);
    return null;
  }
}

/**
 * Requires an authenticated database User record, redirecting to /sign-in if unauthenticated.
 */
export async function requireCurrentUser(): Promise<User> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}
