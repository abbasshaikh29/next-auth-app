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
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchQuestions();
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

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `/api/community/questions?communityId=${communityId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch questions");
      }

      setQuestions(data.questions);
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

  const handleUpdateQuestions = async (newQuestions: string[]) => {
    setLoading(true);
    try {
      const response = await fetch("/api/community/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId,
          questions: newQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update questions");
      }

      setQuestions(data.questions);
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
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Questions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Join Questions</h2>
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[index] = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Question ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => handleUpdateQuestions(questions)}
          disabled={loading || questions.length > 3}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Update Questions
        </button>
      </div>

      {/* Join Requests Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Join Requests</h2>
        {requests.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.userId}
                className="p-4 border border-gray-200 rounded-md"
              >
                <div className="space-y-2">
                  <p className="font-medium">User ID: {request.userId}</p>
                  {request.answers.map((answer, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-600">
                        Q: {questions[index]}
                      </p>
                      <p className="text-sm">A: {answer}</p>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handleRequestAction(request.userId, "approve")
                      }
                      disabled={loading}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleRequestAction(request.userId, "reject")
                      }
                      disabled={loading}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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
