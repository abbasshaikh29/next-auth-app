"use client";

import React, { useState } from "react";

interface R2ImageTestProps {
  imageUrl?: string;
}

export default function R2ImageTest({ imageUrl }: R2ImageTestProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Default test image if none provided
  const testImageUrl =
    imageUrl ||
    "https://pub-65971ea78c843b59c97073ccfe523c5.r2.dev/profiles/68224087e539f65ec36b23c1/72af7e5f-178d-4f0d-b238-38bf2be1d843.jpg";

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("[R2ImageTest] Failed to load image:", testImageUrl);
    console.error("[R2ImageTest] Error event:", e);
    setError(true);
  };

  const handleLoad = () => {
    console.log("[R2ImageTest] Successfully loaded image:", testImageUrl);
    setLoaded(true);
  };

  // Try to fetch the image using the Fetch API to get more error details
  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(testImageUrl);
        console.log("[R2ImageTest] Fetch response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
          ok: response.ok,
        });

        if (!response.ok) {
          console.error(`[R2ImageTest] HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error("[R2ImageTest] Fetch error:", error);
      }
    };

    fetchImage();
  }, [testImageUrl]);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-2">R2 Image Test</h3>
      <p className="mb-2">
        Testing image URL:{" "}
        <a
          href={testImageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {testImageUrl}
        </a>
      </p>

      <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
        {!error ? (
          <img
            src={testImageUrl}
            alt="R2 Test Image"
            className="w-full h-full object-cover"
            onError={handleError}
            crossOrigin="anonymous"
            onLoad={handleLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-500">
            Failed to load
          </div>
        )}
      </div>

      <div className="mt-2 text-sm">
        <p>
          If the image doesn't load, you need to configure CORS for your R2
          bucket:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Log in to your Cloudflare dashboard</li>
          <li>Navigate to R2 in the sidebar</li>
          <li>Select your bucket (thetribelab)</li>
          <li>Go to the "Settings" tab</li>
          <li>
            Under "CORS Policy", add the following settings:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>
                Allowed Origins: <code>http://localhost:3000</code>,{" "}
                <code>
                  https://the-tribelab-cx8u84enk-abbas-projects-2ef642c3.vercel.app
                </code>
              </li>
              <li>Allowed Methods: GET, PUT, POST, DELETE, HEAD</li>
              <li>Allowed Headers: *</li>
            </ul>
          </li>
          <li>Save your changes</li>
        </ol>
      </div>

      <div className="mt-2">
        Status:{" "}
        {error ? (
          <span className="text-red-500">Error loading image</span>
        ) : loaded ? (
          <span className="text-green-500">Image loaded successfully</span>
        ) : (
          <span className="text-yellow-500">Loading...</span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-sm">Try these test pages:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            <a
              href="/r2-test.html"
              target="_blank"
              className="text-blue-500 underline"
            >
              Static HTML Test Page
            </a>{" "}
            - Tests direct access to R2 images
          </li>
          <li>
            <a
              href="/r2-test"
              target="_blank"
              className="text-blue-500 underline"
            >
              R2 Configuration Test
            </a>{" "}
            - Tests R2 bucket configuration and uploads a test file
          </li>
          <li>
            <a
              href="/r2-info"
              target="_blank"
              className="text-blue-500 underline"
            >
              R2 Bucket Information
            </a>{" "}
            - Server-side view of your R2 bucket
          </li>
          <li>
            <a
              href="/r2-public-test"
              target="_blank"
              className="text-blue-500 underline"
            >
              R2 Public Access Test
            </a>{" "}
            - Tests if your R2 bucket is correctly configured for public access
          </li>
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="text-lg font-bold mb-2">Server-side Proxy Test</h3>
        <p className="text-sm mb-2">
          This tests loading the image through a server-side API endpoint:
        </p>
        <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
          <img
            src="/api/test-r2"
            alt="Server-side proxied R2 image"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
