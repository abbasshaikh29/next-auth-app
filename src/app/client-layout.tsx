"use client";

import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Get the theme from localStorage or use default
    const savedTheme = localStorage.getItem("theme") || "whiteHalloween";
    // If the saved theme was skoolTheme, default to whiteHalloween
    const validTheme =
      savedTheme === "skoolTheme" ? "whiteHalloween" : savedTheme;
    
    // Apply theme to both document and body elements
    document.documentElement.setAttribute("data-theme", validTheme);
    document.body.setAttribute("data-theme", validTheme);
    
    // Apply theme to document and body elements only
    // Let CSS variables handle the colors instead of inline styles
    document.documentElement.setAttribute("data-theme", validTheme);
    document.body.setAttribute("data-theme", validTheme);
    
    // Remove any inline styles that might override CSS variables
    document.body.style.removeProperty("backgroundColor");
    document.body.style.removeProperty("color");
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">{children}</div>
    </div>
  );
}
