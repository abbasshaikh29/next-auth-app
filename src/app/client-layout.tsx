"use client";

import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // This useEffect runs only on the client side after hydration is complete
    // Get the theme from localStorage or use default
    const savedTheme = localStorage.getItem("theme") || "whiteHalloween";
    // If the saved theme was skoolTheme, default to whiteHalloween
    const validTheme =
      savedTheme === "skoolTheme" ? "whiteHalloween" : savedTheme;
    
    // Apply theme to document element - this won't cause hydration errors
    // because it happens after hydration is complete
    document.documentElement.setAttribute("data-theme", validTheme);
    document.body.setAttribute("data-theme", validTheme);
    
    // Apply the background color if needed based on theme
    if (validTheme === "halloween") {
      document.body.style.backgroundColor = "#2b2b2e";
    } else {
      document.body.style.backgroundColor = "#f5f5ee";
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">{children}</div>
    </div>
  );
}
