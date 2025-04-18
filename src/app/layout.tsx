"use client";
import Providers from "../components/Provider";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import AuthDebug from "../components/AuthDebug";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production environment
    setIsProduction(window.location.hostname !== "localhost");
    console.log(
      "Environment:",
      window.location.hostname !== "localhost" ? "production" : "development"
    );
  }, []);

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Providers>
            {children}
            {/* Only show AuthDebug in production */}
            {isProduction && <AuthDebug />}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
