"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [cookies, setCookies] = useState<string[]>([]);
  const [environment, setEnvironment] = useState<string>("unknown");

  useEffect(() => {
    // Get all cookies
    const allCookies = document.cookie.split(";");
    
    // Filter for auth-related cookies
    const authCookies = allCookies.filter(
      (cookie) =>
        cookie.trim().startsWith("next-auth") ||
        cookie.trim().startsWith("__Secure-next-auth") ||
        cookie.trim().startsWith("__Host-next-auth")
    );
    
    setCookies(authCookies);
    
    // Determine environment
    setEnvironment(window.location.hostname === "localhost" ? "development" : "production");
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        <p className="mb-1">
          <span className="font-medium">Environment:</span> {environment}
        </p>
        <p className="mb-1">
          <span className="font-medium">Status:</span>{" "}
          <span className={status === "authenticated" ? "text-green-600" : "text-red-600"}>
            {status}
          </span>
        </p>
        <p className="mb-1">
          <span className="font-medium">Session:</span> {session ? "Yes" : "No"}
        </p>
      </div>
      
      {session && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p className="mb-1">
            <span className="font-medium">ID:</span> {session.user?.id || "N/A"}
          </p>
          <p className="mb-1">
            <span className="font-medium">Name:</span> {session.user?.name || "N/A"}
          </p>
          <p className="mb-1">
            <span className="font-medium">Email:</span> {session.user?.email || "N/A"}
          </p>
          <p className="mb-1">
            <span className="font-medium">Username:</span> {session.user?.username || "N/A"}
          </p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Auth Cookies ({cookies.length})</h2>
        {cookies.length > 0 ? (
          <ul className="bg-gray-100 p-3 rounded">
            {cookies.map((cookie, index) => (
              <li key={index} className="mb-1 break-all">{cookie.trim()}</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">No auth cookies found!</p>
        )}
      </div>
      
      <div className="flex space-x-4">
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Home
        </Link>
        <Link href="/profile" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Profile (Protected)
        </Link>
        <Link href="/communityform" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          Create Community (Protected)
        </Link>
      </div>
    </div>
  );
}
