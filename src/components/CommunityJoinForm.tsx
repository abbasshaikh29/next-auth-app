import { useState } from "react";
import { useSession } from "next-auth/react";

interface CommunityJoinFormProps {
  communityId: string;
  questions: string[];
  onSuccess?: () => void;
}

export default function CommunityJoinForm({
  communityId,
  questions,
  onSuccess,
}: CommunityJoinFormProps) {
  const { data: session } = useSession();
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/community/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId,
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send join request");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  if (!session) {
    return <div>Please sign in to join this community</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm sm:text-base">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-gray-700 mb-3 text-sm sm:text-base">
          This community doesn't require any questions to be answered to join.
        </div>
      ) : (
        questions.map((question, index) => (
          <div key={index} className="space-y-1 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              {question}
            </label>
            <textarea
              value={answers[index] || ""}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              rows={2}
              required
              placeholder={`Enter your answer for: ${question}`}
            />
          </div>
        ))
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-1 px-3 sm:py-2 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Sending request..." : "Send Join Request"}
      </button>
    </form>
  );
}
