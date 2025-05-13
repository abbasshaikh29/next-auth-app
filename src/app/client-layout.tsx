"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

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
    document.documentElement.setAttribute("data-theme", validTheme);
    document.body.setAttribute("data-theme", validTheme);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">{children}</div>

      <Footer />
    </div>
  );
}
