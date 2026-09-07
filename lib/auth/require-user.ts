import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Returns the authenticated userId on the server.
 * Redirects to /sign-in if unauthenticated.
 */
export async function requireUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}
