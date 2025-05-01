"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * This component forces a session refresh when mounted
 * It's useful for ensuring the session data is up-to-date
 * after operations like profile image updates
 */
export default function ForceSessionRefresh() {
  const { update } = useSession();

  useEffect(() => {
    const refreshSession = async () => {
      console.log("ForceSessionRefresh: Forcing session refresh");
      try {
        await update();
        console.log("ForceSessionRefresh: Session refreshed successfully");
      } catch (error) {
        console.error("ForceSessionRefresh: Error refreshing session:", error);
      }
    };

    refreshSession();
  }, [update]);

  return null; // This component doesn't render anything
}
