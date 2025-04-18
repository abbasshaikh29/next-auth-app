"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie.split(";");
    console.log("All cookies:", allCookies);

    // Filter for auth-related cookies
    const authCookies = allCookies.filter(
      (cookie) =>
        cookie.trim().startsWith("next-auth") ||
        cookie.trim().startsWith("__Secure-next-auth") ||
        cookie.trim().startsWith("__Host-next-auth")
    );

    setCookies(authCookies);

    // Log authentication status
    console.log("Auth Debug - Session status:", status);
    console.log("Auth Debug - Session data:", session);
    console.log("Auth Debug - Auth cookies:", authCookies);
  }, [session, status]);

  if (!showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs"
        >
          Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md text-sm border border-gray-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <button
          type="button"
          onClick={() => setShowDetails(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-2">
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Session:</strong> {session ? "Yes" : "No"}
        </p>
      </div>

      {session && (
        <div className="mb-2">
          <p>
            <strong>User ID:</strong> {session.user?.id || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {session.user?.email || "N/A"}
          </p>
        </div>
      )}

      <div>
        <p className="font-semibold mb-1">Auth Cookies ({cookies.length}):</p>
        {cookies.length > 0 ? (
          <ul className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-24">
            {cookies.map((cookie, index) => (
              <li key={index} className="truncate">
                {cookie.trim()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500 text-xs">No auth cookies found!</p>
        )}
      </div>
    </div>
  );
}
