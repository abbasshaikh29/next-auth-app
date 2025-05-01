"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "./Notification";
import { useState, useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [s3Config, setS3Config] = useState({
    configured: false,
  });

  // Check if AWS S3 is configured
  useEffect(() => {
    const s3Url = process.env.NEXT_PUBLIC_S3_URL;
    const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

    if (s3Url || cloudfrontDomain) {
      setS3Config({
        configured: true,
      });
    }
  }, []);

  return (
    <SessionProvider
      refetchInterval={5 * 60} // Back to 5 minutes (300 seconds)
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      <NotificationProvider>
        {children}
        {!s3Config.configured && (
          <div className="fixed bottom-4 left-4 bg-yellow-100 text-yellow-800 p-2 rounded text-xs">
            S3 storage not configured
          </div>
        )}
      </NotificationProvider>
    </SessionProvider>
  );
}
