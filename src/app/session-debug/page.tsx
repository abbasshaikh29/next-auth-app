"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ForceSessionRefresh from "@/components/ForceSessionRefresh";

export default function SessionDebugPage() {
  const { data: session, status, update } = useSession();
  const [refreshCount, setRefreshCount] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  // Add current session to history whenever it changes
  useEffect(() => {
    if (session) {
      setSessionHistory((prev) => [
        {
          timestamp: new Date().toISOString(),
          session: JSON.parse(JSON.stringify(session)),
        },
        ...prev,
      ].slice(0, 10)); // Keep only the last 10 sessions
    }
  }, [session]);

  const handleManualRefresh = async () => {
    try {
      await update();
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  const handleForceReload = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Session Debug Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Current Session</h2>
          <p className="mb-4">
            <span className="font-semibold">Status:</span> {status}
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleManualRefresh}
              className="btn btn-primary"
            >
              Refresh Session ({refreshCount})
            </button>
            <button
              onClick={handleForceReload}
              className="btn btn-secondary"
            >
              Force Page Reload
            </button>
          </div>

          {session ? (
            <div>
              <div className="mb-4">
                <h3 className="font-medium mb-2">User Info:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-semibold">ID:</span> {session.user.id}
                  </li>
                  <li>
                    <span className="font-semibold">Name:</span> {session.user.name}
                  </li>
                  <li>
                    <span className="font-semibold">Email:</span> {session.user.email}
                  </li>
                  <li>
                    <span className="font-semibold">Username:</span> {session.user.username}
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Profile Image:</h3>
                {session.user.profileImage ? (
                  <div className="space-y-4">
                    <p className="break-all text-xs">{session.user.profileImage}</p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img
                          src={session.user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <div
                          style={{
                            backgroundImage: `url(${session.user.profileImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No profile image in session</p>
                )}
              </div>
            </div>
          ) : (
            <p>No session data available</p>
          )}
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Session History</h2>
          {sessionHistory.length > 0 ? (
            <div className="space-y-4">
              {sessionHistory.map((entry, index) => (
                <div key={index} className="p-4 border rounded">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                  <div className="text-xs overflow-auto max-h-40">
                    <pre>{JSON.stringify(entry.session, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No session history yet</p>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Raw Session Data</h2>
        <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      {/* This component forces a session refresh when the page loads */}
      <ForceSessionRefresh />
    </div>
  );
}
