"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthDebugPage() {
  const [baseUrl, setBaseUrl] = useState("");
  
  useEffect(() => {
    // Get the base URL from the browser
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Configuration Debug</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
        <p className="mb-2"><span className="font-medium">Base URL:</span> {baseUrl}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Expected Callback URLs</h2>
        <p className="mb-4 text-red-600 font-medium">
          Add these URLs to your Google OAuth configuration in Google Cloud Console:
        </p>
        <ul className="bg-gray-100 p-4 rounded">
          <li className="mb-2 break-all font-mono text-sm">
            {baseUrl}/api/auth/callback/google
          </li>
          <li className="mb-2 break-all font-mono text-sm">
            {baseUrl}/api/auth/callback/credentials
          </li>
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
