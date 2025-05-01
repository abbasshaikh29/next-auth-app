"use client";

import { useState, useEffect } from "react";

export default function S3TestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/test-s3-upload");
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      console.error("Error running S3 test:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">S3 Upload Test</h1>
      
      <div className="mb-6">
        <button 
          onClick={runTest}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Testing..." : "Run S3 Upload Test"}
        </button>
      </div>
      
      {error && (
        <div className="alert alert-error mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {testResult && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-bold mb-2">Test Result</h2>
            <p className="mb-2">
              <span className="font-semibold">Status:</span>{" "}
              <span className={testResult.success ? "text-success" : "text-error"}>
                {testResult.success ? "Success" : "Failed"}
              </span>
            </p>
            <p className="mb-2">
              <span className="font-semibold">Message:</span> {testResult.message}
            </p>
            {testResult.url && (
              <p className="mb-2">
                <span className="font-semibold">URL:</span>{" "}
                <a href={testResult.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {testResult.url}
                </a>
              </p>
            )}
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-bold mb-2">S3 Configuration</h2>
            {testResult.config && (
              <ul className="space-y-1">
                <li>
                  <span className="font-semibold">Region:</span> {testResult.config.region}
                </li>
                <li>
                  <span className="font-semibold">Bucket:</span> {testResult.config.bucket}
                </li>
                <li>
                  <span className="font-semibold">Public URL:</span> {testResult.config.publicUrl}
                </li>
                <li>
                  <span className="font-semibold">Access Key ID Length:</span> {testResult.config.accessKeyIdLength}
                </li>
                <li>
                  <span className="font-semibold">Secret Access Key Length:</span> {testResult.config.secretAccessKeyLength}
                </li>
              </ul>
            )}
          </div>
          
          {testResult.error && (
            <div className="p-4 border rounded-lg bg-error/10">
              <h2 className="text-xl font-bold mb-2">Error Details</h2>
              <p className="mb-2">
                <span className="font-semibold">Error:</span> {testResult.error}
              </p>
              {testResult.code && (
                <p className="mb-2">
                  <span className="font-semibold">Code:</span> {testResult.code}
                </p>
              )}
              {testResult.name && (
                <p className="mb-2">
                  <span className="font-semibold">Name:</span> {testResult.name}
                </p>
              )}
              {testResult.stack && (
                <pre className="p-2 bg-base-300 rounded text-xs overflow-auto max-h-40">
                  {testResult.stack}
                </pre>
              )}
            </div>
          )}
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-bold mb-2">Raw Response</h2>
            <pre className="p-2 bg-base-300 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
