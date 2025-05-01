"use client";

import { useState, useEffect } from "react";
import AuthDebug from "../components/AuthDebug";
import SessionDebugOverlay from "../components/SessionDebugOverlay";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production environment
    setIsProduction(window.location.hostname !== "localhost");

    // Get the theme from localStorage or use default
    const savedTheme = localStorage.getItem("theme") || "whiteHalloween";
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <>
      {/* Halloween-themed decorative elements */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-halloween-purple via-halloween-orange to-halloween-green opacity-70"></div>

      {children}

      {/* Only show AuthDebug in production */}
      {isProduction && <AuthDebug />}

      {/* Debug overlay for session issues */}
      <SessionDebugOverlay />
    </>
  );
}
