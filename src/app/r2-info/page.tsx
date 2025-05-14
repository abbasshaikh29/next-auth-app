import React from "react";

// This is a server component that fetches R2 info on the server side
async function getR2Info() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/r2-info`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch R2 info: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching R2 info:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default async function R2InfoPage() {
  const r2Info = await getR2Info();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">R2 Bucket Information</h1>

      {r2Info.success ? (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Bucket Configuration</h2>
            <div className="space-y-2">
              <div>
                <strong>Bucket Name:</strong> {r2Info.bucketInfo.name}
              </div>
              <div>
                <strong>Endpoint:</strong> {r2Info.bucketInfo.endpoint}
              </div>
              <div>
                <strong>Public URL:</strong> {r2Info.bucketInfo.publicUrl}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Objects in Bucket (Limited to 10)
            </h2>
            {r2Info.objects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {r2Info.objects.map((obj: any) => (
                      <tr key={obj.key}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {obj.key}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {obj.size} bytes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(obj.lastModified).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                          <a
                            href={obj.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500">
                No objects found in the bucket.
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Public Access Test Results
            </h2>
            {r2Info.accessResults.length > 0 ? (
              <div className="space-y-4">
                {r2Info.accessResults.map((result: any) => (
                  <div key={result.key} className="p-3 border rounded">
                    <div>
                      <strong>Object Key:</strong> {result.key}
                    </div>
                    <div>
                      <strong>Public URL:</strong>{" "}
                      <a
                        href={result.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        {result.publicUrl}
                      </a>
                    </div>
                    <div>
                      <strong>Publicly Accessible:</strong>{" "}
                      {result.accessible ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </div>
                    {result.status && (
                      <div>
                        <strong>Status:</strong> {result.status}{" "}
                        {result.statusText}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-red-600">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">
                No access test results available.
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              R2 Configuration Guide
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Public Access</h3>
                <p>Make sure Public Access is enabled for your R2 bucket:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Go to Cloudflare Dashboard → R2</li>
                  <li>Select your bucket (thetribelab)</li>
                  <li>Go to Settings tab</li>
                  <li>
                    Under "Public Development URL", make sure it's enabled
                  </li>
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
                  When uploading files, make sure to set the ACL to
                  "public-read":
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
      ) : (
        <div className="p-4 border rounded-lg bg-red-50 text-red-600">
          <h2 className="text-xl font-semibold mb-2">
            Error Fetching R2 Information
          </h2>
          <div>{r2Info.error}</div>
        </div>
      )}
    </div>
  );
}
