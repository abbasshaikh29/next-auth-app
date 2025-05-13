"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useSession } from "next-auth/react";
import { initRealtimeChannel, closeRealtimeChannel } from "@/lib/realtime";

// Define the context type
interface RealtimeContextType {
  isEnabled: boolean;
}

// Create the context with default values
const RealtimeContext = createContext<RealtimeContextType>({
  isEnabled: false,
});

// Custom hook to use the realtime context
export const useRealtime = () => useContext(RealtimeContext);

// Provider component
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Only initialize realtime if user is authenticated
    if (!session?.user) return;

    try {
      // Initialize the realtime channel
      const channel = initRealtimeChannel();
      if (channel) {
        setIsEnabled(true);
        console.log("Realtime communication enabled");
      }
    } catch (error) {
      console.error("Error initializing realtime:", error);
      setIsEnabled(false);
    }

    // Clean up on unmount
    return () => {
      closeRealtimeChannel();
      setIsEnabled(false);
    };
  }, [session]);

  return (
    <RealtimeContext.Provider value={{ isEnabled }}>
      {children}
    </RealtimeContext.Provider>
  );
}
