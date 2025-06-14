import Providers from "../components/Provider";
import ErrorBoundary from "../components/ErrorBoundary";
import { poppins, thunder } from "./fonts";
import ClientLayout from "./client-layout";
import "../styles/theme-variables.css"; // Load theme variables first
import "./critical-styles.css"; // Load critical CSS next
import "./globals.css"; // Load full CSS after

// Force a consistent default theme for SSR to avoid hydration mismatch
const DEFAULT_THEME = 'light';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${thunder.variable}`} data-theme={DEFAULT_THEME}>
      <head>
        <title>TheTribelab - Modern Community Platform</title>
        <meta name="description" content="A modern community platform for building and connecting tribes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        {/* Razorpay Checkout Script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        {/* Theme script moved to client component */}
      </head>
      <body className={poppins.className}>
        <ErrorBoundary>
          <Providers>
            {/* Use the client component for client-side functionality */}
            <ClientLayout>{children}</ClientLayout>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
