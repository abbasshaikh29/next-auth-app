"use client";
import Providers from "../components/Provider";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import AuthDebug from "../components/AuthDebug";
import { useState, useEffect } from "react";
import { poppins } from "./fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en" className={poppins.variable}>
      <head>
        <title>TheTribelab - Halloween Edition</title>
      </head>
      <body className={poppins.className}>
        <ErrorBoundary>
          <Providers>
            {/* Halloween-themed decorative elements */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-halloween-purple via-halloween-orange to-halloween-green opacity-70"></div>

            {children}

            {/* Only show AuthDebug in production */}
            {isProduction && <AuthDebug />}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
