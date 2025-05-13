"use client";

import React from "react";

export default function R2TestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">R2 Configuration Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Check Existing Object</h2>
          <p className="mb-4">
            Check if an object exists in your R2 bucket and if it's publicly
            accessible.
          </p>
          <div className="mb-4">
            <label
              htmlFor="objectKey"
              className="block text-sm font-medium mb-1"
            >
              Object Key (path in bucket):
            </label>
            <input
              type="text"
              id="objectKey"
              className="w-full p-2 border rounded"
              placeholder="profiles/68224087e539f65ec36b23c1/72af7e5f-178d-4f0d-b238-38bf2be1d843.jpg"
              defaultValue="profiles/68224087e539f65ec36b23c1/72af7e5f-178d-4f0d-b238-38bf2be1d843.jpg"
            />
          </div>
          <button
            type="button"
            id="checkButton"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={async () => {
              try {
                const objectKey = (
                  document.getElementById("objectKey") as HTMLInputElement
                ).value;
                if (!objectKey) {
                  document.getElementById("checkResult")!.innerHTML =
                    "Please enter an object key";
                  return;
                }

                document.getElementById("checkResult")!.innerHTML =
                  "Checking...";

                const response = await fetch(
                  `/api/check-r2-object?key=${encodeURIComponent(objectKey)}`
                );
                const data = await response.json();

                const resultElement = document.getElementById("checkResult")!;
                if (data.success) {
                  if (data.objectExists) {
                    const publicAccessStatus = data.isPubliclyAccessible
                      ? '<span class="text-green-600">Yes</span>'
                      : '<span class="text-red-600">No</span>';

                    resultElement.innerHTML = `
                      <div class="text-green-600 mb-2">Object exists!</div>
                      <div class="mb-2">
                        <div>Content Type: ${data.objectMetadata.contentType}</div>
                        <div>Size: ${data.objectMetadata.contentLength} bytes</div>
                        <div>Last Modified: ${new Date(data.objectMetadata.lastModified).toLocaleString()}</div>
                      </div>
                      <div class="mb-2">Public URL: <a href="${data.publicUrl}" target="_blank" class="text-blue-500 underline">${data.publicUrl}</a></div>
                      <div class="mb-2">Publicly Accessible: ${publicAccessStatus}</div>
                      ${data.fetchError ? `<div class="text-red-600">Fetch Error: ${JSON.stringify(data.fetchError)}</div>` : ""}
                    `;

                    // Display the image if it's an image
                    if (data.objectMetadata.contentType?.startsWith("image/")) {
                      resultElement.innerHTML += `
                        <div class="mt-4">
                          <div class="text-sm font-medium mb-1">Image Preview:</div>
                          <div class="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src="${data.publicUrl}"
                              alt="R2 Object"
                              class="w-full h-full object-cover"
                              onerror="this.parentNode.innerHTML = '<div class=\\'flex items-center justify-center w-full h-full text-red-500 text-sm\\'>Failed to load</div>'"
                            />
                          </div>
                        </div>
                      `;
                    }
                  } else {
                    resultElement.innerHTML = `
                      <div class="text-red-600 mb-2">Object does not exist or access denied</div>
                      <div>${data.error}</div>
                    `;
                  }
                } else {
                  resultElement.innerHTML = `
                    <div class="text-red-600 mb-2">Check failed:</div>
                    <div>${data.error}</div>
                  `;
                }
              } catch (error) {
                document.getElementById("checkResult")!.innerHTML = `
                  <div class="text-red-600 mb-2">Error:</div>
                  <div>${error instanceof Error ? error.message : String(error)}</div>
                `;
              }
            }}
          >
            Check Object
          </button>
          <div id="checkResult" className="mt-4"></div>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Upload Test File</h2>
          <p className="mb-4">
            This will upload a small text file to your R2 bucket with
            public-read ACL to test if your bucket is properly configured.
          </p>
          <button
            type="button"
            id="uploadButton"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={async () => {
              try {
                document.getElementById("uploadResult")!.innerHTML =
                  "Uploading...";

                const response = await fetch("/api/upload-test-r2");
                const data = await response.json();

                const resultElement = document.getElementById("uploadResult")!;
                if (data.success) {
                  resultElement.innerHTML = `
                    <div class="text-green-600 mb-2">Upload successful!</div>
                    <div class="mb-2">Public URL: <a href="${data.publicUrl}" target="_blank" class="text-blue-500 underline">${data.publicUrl}</a></div>
                    <div class="text-sm text-gray-600">
                      <div>Bucket: ${data.env.R2_BUCKET_NAME}</div>
                      <div>Endpoint: ${data.env.R2_ENDPOINT_URL}</div>
                      <div>Public URL: ${data.env.NEXT_PUBLIC_R2_PUBLIC_URL}</div>
                    </div>
                  `;

                  // Try to fetch the file to verify it's publicly accessible
                  document.getElementById("fetchResult")!.innerHTML =
                    "Fetching the uploaded file...";

                  try {
                    const fetchResponse = await fetch(data.publicUrl);
                    if (fetchResponse.ok) {
                      const content = await fetchResponse.text();
                      document.getElementById("fetchResult")!.innerHTML = `
                        <div class="text-green-600 mb-2">File is publicly accessible!</div>
                        <div class="p-2 bg-gray-100 rounded">
                          <pre>${content}</pre>
                        </div>
                      `;
                    } else {
                      document.getElementById("fetchResult")!.innerHTML = `
                        <div class="text-red-600 mb-2">File is not publicly accessible.</div>
                        <div>Status: ${fetchResponse.status} ${fetchResponse.statusText}</div>
                      `;
                    }
                  } catch (fetchError) {
                    document.getElementById("fetchResult")!.innerHTML = `
                      <div class="text-red-600 mb-2">Error fetching the file:</div>
                      <div>${fetchError instanceof Error ? fetchError.message : String(fetchError)}</div>
                    `;
                  }
                } else {
                  resultElement.innerHTML = `
                    <div class="text-red-600 mb-2">Upload failed:</div>
                    <div>${data.error}</div>
                  `;
                }
              } catch (error) {
                document.getElementById("uploadResult")!.innerHTML = `
                  <div class="text-red-600 mb-2">Error:</div>
                  <div>${error instanceof Error ? error.message : String(error)}</div>
                `;
              }
            }}
          >
            Upload Test File
          </button>
          <div id="uploadResult" className="mt-4"></div>
          <div id="fetchResult" className="mt-4"></div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">R2 Configuration Guide</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Public Access</h3>
              <p>Make sure Public Access is enabled for your R2 bucket:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Go to Cloudflare Dashboard → R2</li>
                <li>Select your bucket (thetribelab)</li>
                <li>Go to Settings tab</li>
                <li>Under "Public Development URL", make sure it's enabled</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">2. CORS Configuration</h3>
              <p>Configure CORS for your R2 bucket:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>In the same Settings tab</li>
                <li>Under "CORS Policy", add the following:</li>
                <li>
                  Allowed Origins: <code>http://localhost:3000</code>, your
                  production domain
                </li>
                <li>Allowed Methods: GET, PUT, POST, DELETE, HEAD</li>
                <li>Allowed Headers: * (wildcard)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">3. Object Permissions</h3>
              <p>
                When uploading files, make sure to set the ACL to "public-read":
              </p>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                {`const params = {
  Bucket: "thetribelab",
  Key: "path/to/file.jpg",
  Body: fileData,
  ContentType: "image/jpeg",
  ACL: "public-read"  // This is important!
};`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
