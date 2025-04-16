import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface JoinRequest {
  userId: string;
  status: "pending" | "approved" | "rejected";
  answers: string[];
  createdAt: string;
}

interface CommunityAdminPanelProps {
  communityId: string;
}

export default function CommunityAdminPanel({
  communityId,
}: CommunityAdminPanelProps) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [communityId]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `/api/community/requests?communityId=${communityId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch requests");
      }

      setRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleRequestAction = async (
    userId: string,
    action: "approve" | "reject"
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/community/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId,
          userId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      // Refresh requests after action
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div>Please sign in to access admin panel</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm sm:text-base">
          {error}
        </div>
      )}

      {/* Join Requests Section */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Join Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm sm:text-base">No pending requests</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {requests.map((request) => (
              <div
                key={request.userId}
                className="p-3 sm:p-4 border border-gray-200 rounded-md"
              >
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium">
                    User ID: {request.userId}
                  </p>
                  {request.answers.map((answer, index) => (
                    <div key={index}>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Q: Question {index + 1}
                      </p>
                      <p className="text-xs sm:text-sm">A: {answer}</p>
                    </div>
                  ))}
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleRequestAction(request.userId, "approve")
                      }
                      disabled={loading}
                      className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleRequestAction(request.userId, "reject")
                      }
                      disabled={loading}
                      className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
