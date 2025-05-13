import React from "react";

// This is a server component that tests R2 public access
async function testR2PublicAccess() {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/r2-public-test`, {
      cache: "no-store",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to run R2 public test: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("Error testing R2 public access:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default async function R2PublicTestPage() {
  const testResult = await testR2PublicAccess();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">R2 Public Access Test</h1>
      
      {testResult.success ? (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              <div>
                <strong>Public Access Status:</strong>{" "}
                {testResult.isPubliclyAccessible ? (
                  <span className="text-green-600 font-bold">Working Correctly ✓</span>
                ) : (
                  <span className="text-red-600 font-bold">Not Working ✗</span>
                )}
              </div>
              
              <div><strong>Test File:</strong> {testResult.testFilePath}</div>
              <div>
                <strong>Public URL:</strong>{" "}
                <a 
                  href={testResult.publicUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {testResult.publicUrl}
                </a>
              </div>
              
              <div><strong>Bucket Name:</strong> {testResult.bucketInfo.name}</div>
              <div><strong>Public URL Base:</strong> {testResult.bucketInfo.publicUrl}</div>
            </div>
          </div>
          
          {!testResult.isPubliclyAccessible && (
            <div className="p-4 border rounded-lg bg-red-50">
              <h2 className="text-xl font-semibold mb-4 text-red-700">Public Access Not Working</h2>
              
              {testResult.fetchResponse && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 mb-2">HTTP Response:</h3>
                  <div><strong>Status:</strong> {testResult.fetchResponse.status} {testResult.fetchResponse.statusText}</div>
                  <div className="mt-2"><strong>Headers:</strong></div>
                  <pre className="bg-white p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(testResult.fetchResponse.headers, null, 2)}
                  </pre>
                </div>
              )}
              
              {testResult.fetchError && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 mb-2">Error:</h3>
                  <div>{testResult.fetchError}</div>
                </div>
              )}
              
              <div className="mt-4">
                <h3 className="font-medium text-red-700 mb-2">How to Fix:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Enable Public Access:</strong> Go to Cloudflare Dashboard → R2 → Select your bucket → Settings → Enable "Public Development URL"
                  </li>
                  <li>
                    <strong>Check ACL Settings:</strong> Make sure you're uploading files with <code>ACL: "public-read"</code>
                  </li>
                  <li>
                    <strong>Verify Public URL:</strong> Make sure your <code>NEXT_PUBLIC_R2_PUBLIC_URL</code> environment variable matches the URL shown in the Cloudflare dashboard
                  </li>
                  <li>
                    <strong>Configure CORS:</strong> Set up CORS to allow access from your domains
                  </li>
                </ol>
              </div>
            </div>
          )}
          
          {testResult.isPubliclyAccessible && (
            <div className="p-4 border rounded-lg bg-green-50">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Public Access Working Correctly</h2>
              <p>
                Your R2 bucket is correctly configured for public access. Files uploaded with <code>ACL: "public-read"</code> are accessible via the public URL.
              </p>
              <div className="mt-4">
                <h3 className="font-medium text-green-700 mb-2">Next Steps:</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Update Upload Code:</strong> Make sure all your file uploads include <code>ACL: "public-read"</code>
                  </li>
                  <li>
                    <strong>Re-upload Existing Files:</strong> You may need to re-upload existing files with the correct ACL
                  </li>
                  <li>
                    <strong>Configure CORS:</strong> If you haven't already, set up CORS to allow access from your domains
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-red-50 text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error Running Test</h2>
          <div>{testResult.error}</div>
        </div>
      )}
      
      <div className="mt-6">
        <a href="/settings" className="text-blue-500 hover:underline">← Back to Settings</a>
      </div>
    </div>
  );
}
