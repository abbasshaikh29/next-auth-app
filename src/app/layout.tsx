import Providers from "../components/Provider";
import ErrorBoundary from "../components/ErrorBoundary";
import { poppins } from "./fonts";
import ClientLayout from "./client-layout";
import "./critical-styles.css"; // Load critical CSS first
import "./globals.css"; // Load full CSS after

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <title>TheTribelab - Halloween Edition</title>
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
