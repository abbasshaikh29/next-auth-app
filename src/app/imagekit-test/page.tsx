"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IKImage } from "imagekitio-next";

export default function ImageKitTestPage() {
  const [urlEndpoint, setUrlEndpoint] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [error, setError] = useState("");

  const [apiResponse, setApiResponse] = useState<any>(null);
  const [sampleImageUrl, setSampleImageUrl] = useState("");

  useEffect(() => {
    // Get environment variables
    const endpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
    const key = process.env.NEXT_PUBLIC_PUBLIC_KEY;

    setUrlEndpoint(endpoint || "");
    setPublicKey(key || "");

    // Create a direct URL for testing
    if (endpoint) {
      setDirectUrl(`${endpoint}/community-banners/image.jpg`);
    }

    // Test authentication
    const testAuth = async () => {
      try {
        const res = await fetch("/api/imagekitauth");
        const data = await res.json();
        console.log("ImageKit auth response:", data);
      } catch (err) {
        console.error("ImageKit auth error:", err);
        setError("Authentication error: " + String(err));
      }
    };

    // Check ImageKit configuration
    const checkImageKit = async () => {
      try {
        const res = await fetch("/api/imagekit-check");
        const data = await res.json();
        console.log("ImageKit check response:", data);
        setApiResponse(data);

        // If we have a sample file, use its URL
        if (data.success && data.sampleFile) {
          setSampleImageUrl(data.sampleFile.url);
        }
      } catch (err) {
        console.error("ImageKit check error:", err);
        setError("ImageKit check error: " + String(err));
      }
    };

    testAuth();
    checkImageKit();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">ImageKit Test Page</h1>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <p>
          <strong>URL Endpoint:</strong> {urlEndpoint || "Not set"}
        </p>
        <p>
          <strong>Public Key:</strong> {publicKey ? "Set" : "Not set"}
        </p>
        {error && <p className="text-red-500 mt-2">{error}</p>}

        {apiResponse && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold">API Check Result:</h3>
            <p>
              <strong>Success:</strong> {apiResponse.success ? "Yes" : "No"}
            </p>
            {apiResponse.message && (
              <p>
                <strong>Message:</strong> {apiResponse.message}
              </p>
            )}
            {apiResponse.error && (
              <p className="text-red-500">
                <strong>Error:</strong> {apiResponse.error}
              </p>
            )}
            {apiResponse.fileCount !== undefined && (
              <p>
                <strong>Files found:</strong> {apiResponse.fileCount}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Test 1: Direct URL with Next.js Image */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Test 1: Next.js Image</h2>
          <p className="text-sm mb-2">Using direct URL with Next.js Image</p>
          {directUrl ? (
            <div className="h-48 relative">
              <Image
                src={directUrl}
                alt="Test image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span>No URL endpoint</span>
            </div>
          )}
        </div>

        {/* Test 2: IKImage with hardcoded path */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">
            Test 2: IKImage Component
          </h2>
          <p className="text-sm mb-2">Using IKImage with hardcoded path</p>
          {urlEndpoint ? (
            <div className="h-48">
              <IKImage
                urlEndpoint={urlEndpoint}
                path="community-banners/image.jpg"
                transformation={[{ height: 200, width: 300 }]}
                loading="eager"
                alt="Test image"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span>No URL endpoint</span>
            </div>
          )}
        </div>

        {/* Test 3: Public demo ImageKit */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Test 3: Public Demo</h2>
          <p className="text-sm mb-2">Using public ImageKit demo account</p>
          <div className="h-48">
            <IKImage
              urlEndpoint="https://ik.imagekit.io/demo"
              path="default-image.jpg"
              transformation={[{ height: 200, width: 300 }]}
              loading="eager"
              alt="Demo image"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Raw HTML Image Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <p className="text-sm mb-2">Using direct URL with HTML img tag</p>
            {directUrl ? (
              <img
                src={directUrl}
                alt="Direct URL test"
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span>No URL endpoint</span>
              </div>
            )}
          </div>

          <div className="border p-4 rounded">
            <p className="text-sm mb-2">Using public demo with HTML img tag</p>
            <img
              src="https://ik.imagekit.io/demo/default-image.jpg"
              alt="Public demo test"
              className="h-48 w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Sample image from API response */}
      {sampleImageUrl && (
        <div className="mt-6 border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">
            Sample Image from Your Account
          </h2>
          <p className="text-sm mb-2">
            This image was found in your ImageKit account
          </p>
          <div className="h-64 relative">
            <Image
              src={sampleImageUrl}
              alt="Sample image from your account"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
