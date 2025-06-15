"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCommunityBilling } from "@/contexts/CommunityBillingContext";

interface ApiTestComponentProps {
  slug?: string;
}

export default function ApiTestComponent({ slug: propSlug }: ApiTestComponentProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const { slug: contextSlug } = useCommunityBilling();
  const slug = propSlug || contextSlug || paramSlug;
  const { data: session } = useSession();
  const [statusResult, setStatusResult] = useState<any>(null);
  const [communityResult, setCommunityResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testStatusEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/${slug}/status`, {
        method: 'GET',
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setStatusResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      setStatusResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCommunityEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/community/${slug}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      const data = await response.json();
      setCommunityResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error) {
      setCommunityResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-100 p-4 rounded-lg text-xs space-y-4">
      <h4 className="font-bold text-blue-700">API Test Component</h4>
      
      <div>
        <strong>Current Slug:</strong> {slug || 'N/A'}
      </div>
      
      <div>
        <strong>Session User ID:</strong> {session?.user?.id || 'N/A'}
      </div>
      
      <div className="space-x-2">
        <button 
          onClick={testStatusEndpoint}
          disabled={loading}
          className="btn btn-xs btn-primary"
        >
          Test Status Endpoint
        </button>
        
        <button 
          onClick={testCommunityEndpoint}
          disabled={loading}
          className="btn btn-xs btn-secondary"
        >
          Test Community Endpoint
        </button>
      </div>

      {statusResult && (
        <div className="bg-white p-2 rounded border">
          <strong>Status Endpoint Result:</strong>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(statusResult, null, 2)}
          </pre>
        </div>
      )}

      {communityResult && (
        <div className="bg-white p-2 rounded border">
          <strong>Community Endpoint Result:</strong>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(communityResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
