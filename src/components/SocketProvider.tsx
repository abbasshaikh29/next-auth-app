"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

// Define the context type
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Create the context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Custom hook to use the socket
export const useSocket = () => useContext(SocketContext);

// Provider component
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (!session?.user) return;

    // Create socket connection
    // Always use window.location.origin to ensure we connect to the same server
    const socketUrl = window.location.origin;
    console.log("Connecting to socket at:", socketUrl);

    // Create socket with simpler settings to avoid connection issues
    const socketInstance = io(socketUrl, {
      // Basic settings that should work in most environments
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      // Don't use path - let it use the default
    });

    // Set up event listeners
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setIsConnected(false);
    });

    // Save socket instance to state
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
