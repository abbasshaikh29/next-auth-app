"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Providers from "../components/Provider";
import { ThemeProvider } from "../components/ThemeProvider";
import "./globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import { metadata } from "./layout.server";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Providers>
            <ThemeProvider>{children}</ThemeProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
