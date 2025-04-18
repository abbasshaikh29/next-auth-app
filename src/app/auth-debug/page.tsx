"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DebugInfo {
  environment: string;
  baseUrl: string;
  expectedCallbackUrls: string[];
  configuredNextAuthUrl: string;
  googleClientId: string;
  googleClientIdConfigured: boolean;
  googleClientSecretConfigured: boolean;
  nextAuthSecretConfigured: boolean;
  message: string;
}

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        const response = await fetch("/api/auth/debug");
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setDebugInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div className="container mx-auto p-8">Loading debug information...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-red-500">Error: {error}</div>;
  }

  if (!debugInfo) {
    return <div className="container mx-auto p-8">No debug information available</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Configuration Debug</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
        <p className="mb-2"><span className="font-medium">Environment:</span> {debugInfo.environment}</p>
        <p className="mb-2"><span className="font-medium">Base URL:</span> {debugInfo.baseUrl}</p>
        <p className="mb-2"><span className="font-medium">Configured NEXTAUTH_URL:</span> {debugInfo.configuredNextAuthUrl}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Google OAuth Configuration</h2>
        <p className="mb-2">
          <span className="font-medium">Google Client ID:</span>{" "}
          <span className={debugInfo.googleClientIdConfigured ? "text-green-600" : "text-red-600"}>
            {debugInfo.googleClientId}
          </span>
        </p>
        <p className="mb-2">
          <span className="font-medium">Google Client Secret:</span>{" "}
          <span className={debugInfo.googleClientSecretConfigured ? "text-green-600" : "text-red-600"}>
            {debugInfo.googleClientSecretConfigured ? "Configured" : "Not configured"}
          </span>
        </p>
        <p className="mb-2">
          <span className="font-medium">NextAuth Secret:</span>{" "}
          <span className={debugInfo.nextAuthSecretConfigured ? "text-green-600" : "text-red-600"}>
            {debugInfo.nextAuthSecretConfigured ? "Configured" : "Not configured"}
          </span>
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Expected Callback URLs</h2>
        <p className="mb-4 text-red-600 font-medium">
          Add these URLs to your Google OAuth configuration in Google Cloud Console:
        </p>
        <ul className="bg-gray-100 p-4 rounded">
          {debugInfo.expectedCallbackUrls.map((url, index) => (
            <li key={index} className="mb-2 break-all font-mono text-sm">
              {url}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
          <li>Select your project</li>
          <li>Find and edit your OAuth 2.0 Client ID</li>
          <li>Add the callback URLs listed above to the "Authorized redirect URIs" section</li>
          <li>Make sure your production domain is added to "Authorized JavaScript origins"</li>
          <li>Save your changes</li>
          <li>Wait a few minutes for changes to propagate</li>
        </ol>
      </div>
      
      <div className="flex space-x-4">
        <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Home
        </Link>
        <Link href="/auth-test" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Auth Test
        </Link>
      </div>
    </div>
  );
}
