import { auth } from "@/auth";

/**
 * Helper function to get the server session in Auth.js v5
 * This replaces the getServerSession function from next-auth v4
 */
export async function getServerSession() {
  return await auth();
}
