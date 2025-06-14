"use client";

import { useState, useEffect } from "react";

type ThemeOption = "light" | "dark" | "system";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Detect system theme preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  // Resolve theme based on current selection
  const resolveTheme = (themeOption: ThemeOption): "light" | "dark" => {
    if (themeOption === "system") {
      return getSystemTheme();
    }
    return themeOption;
  };

  useEffect(() => {
    // This useEffect runs only on the client side after hydration is complete
    // Get the theme from localStorage or use system default
    const savedThemeRaw = localStorage.getItem("theme") || "system";

    // Handle legacy theme names first, before casting to ThemeOption
    let validTheme: ThemeOption;
    if (savedThemeRaw === "whiteHalloween" || savedThemeRaw === "skoolTheme") {
      validTheme = "light";
      localStorage.setItem("theme", "light");
    } else if (savedThemeRaw === "halloween") {
      validTheme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      // Cast to ThemeOption only after handling legacy themes
      validTheme = (savedThemeRaw as ThemeOption) || "system";
    }

    const resolvedTheme = resolveTheme(validTheme);

    // Apply theme to document element - this won't cause hydration errors
    // because it happens after hydration is complete
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.body.setAttribute("data-theme", resolvedTheme);

    // Apply CSS variables for smooth transitions
    document.documentElement.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');

    // Apply the background color using CSS variables
    document.body.style.backgroundColor = "var(--bg-primary)";
    document.body.style.color = "var(--text-primary)";

    // Listen for system theme changes if using system theme
    if (validTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = () => {
        const newResolvedTheme = getSystemTheme();
        document.documentElement.setAttribute("data-theme", newResolvedTheme);
        document.body.setAttribute("data-theme", newResolvedTheme);
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, []);

  return (
    <div
      className="flex flex-col min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        minHeight: "100vh"
      }}
    >
      <div className="flex-grow">{children}</div>
    </div>
  );
}
