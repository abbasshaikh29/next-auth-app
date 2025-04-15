"use client";

import { useSession } from "next-auth/react";

export default function SessionDebug() {
  const { data: session, status } = useSession();

  return (
    <div className="fixed bottom-4 right-4 bg-base-300 p-4 rounded-lg shadow-lg z-50 max-w-md text-sm">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <p>Status: {status}</p>
      {session ? (
        <div>
          <p>User: {session.user?.name || "N/A"}</p>
          <p>Email: {session.user?.email || "N/A"}</p>
          <p>ID: {session.user?.id || "N/A"}</p>
        </div>
      ) : (
        <p>No session</p>
      )}
    </div>
  );
}
