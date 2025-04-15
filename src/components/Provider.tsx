"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "./Notification";
import { ImageKitProvider } from "imagekitio-next";
import { useState, useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [ikConfig, setIkConfig] = useState({
    urlEndpoint: "",
    publicKey: "",
  });

  // Load ImageKit config from environment variables
  useEffect(() => {
    const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

    if (urlEndpoint && publicKey) {
      setIkConfig({
        urlEndpoint,
        publicKey,
      });
      console.log("ImageKit config loaded", { urlEndpoint });
    } else {
      console.error("Missing ImageKit configuration in environment variables");
    }
  }, []);

  const authenticator = async () => {
    try {
      const res = await fetch("/api/imagekitauth");
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to authenticate: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      console.log("ImageKit authentication successful");
      return data;
    } catch (error) {
      console.error("ImageKit authentication error:", error);
      throw error;
    }
  };

  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <NotificationProvider>
        {ikConfig.urlEndpoint && ikConfig.publicKey ? (
          <ImageKitProvider
            publicKey={ikConfig.publicKey}
            urlEndpoint={ikConfig.urlEndpoint}
            authenticator={authenticator}
          >
            {children}
          </ImageKitProvider>
        ) : (
          <>
            {children}
            <div className="fixed bottom-4 left-4 bg-red-100 text-red-800 p-2 rounded text-xs">
              ImageKit not configured
            </div>
          </>
        )}
      </NotificationProvider>
    </SessionProvider>
  );
}
