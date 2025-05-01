"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SessionDebugOverlay() {
  const { data: session, status, update } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [imageStatus, setImageStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Check if the debug mode is enabled in localStorage
    const debugEnabled = localStorage.getItem("debug_mode") === "true";
    setIsVisible(debugEnabled);

    // Add keyboard shortcut (Ctrl+Shift+D) to toggle debug mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        const newState = !isVisible;
        setIsVisible(newState);
        localStorage.setItem("debug_mode", newState.toString());
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  // Test if the profile image loads
  useEffect(() => {
    if (session?.user?.profileImage) {
      setImageStatus("loading");
      const img = new Image();
      img.onload = () => setImageStatus("success");
      img.onerror = () => setImageStatus("error");
      img.src = session.user.profileImage;
    }
  }, [session?.user?.profileImage]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg shadow-lg z-50 max-w-md max-h-[80vh] overflow-auto text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Session Debug</h3>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await update();
                alert("Session refreshed!");
              } catch (error) {
                console.error("Error refreshing session:", error);
              }
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
          >
            Refresh Session
          </button>
          <button
            onClick={() => {
              setIsVisible(false);
              localStorage.setItem("debug_mode", "false");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
          >
            Close
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="font-semibold">Status: <span className={
          status === "authenticated" ? "text-green-400" : 
          status === "loading" ? "text-yellow-400" : "text-red-400"
        }>{status}</span></div>
      </div>

      {session?.user?.profileImage && (
        <div className="mb-4 border border-gray-700 p-2 rounded">
          <div className="font-semibold mb-1">Profile Image:</div>
          <div className="break-all text-gray-300 mb-2">{session.user.profileImage}</div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 relative">
              <img 
                src={session.user.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onLoad={() => setImageStatus("success")}
                onError={() => setImageStatus("error")}
              />
            </div>
            <div className={`text-xs ${
              imageStatus === "success" ? "text-green-400" : 
              imageStatus === "error" ? "text-red-400" : "text-yellow-400"
            }`}>
              {imageStatus === "success" ? "✓ Image loaded" : 
               imageStatus === "error" ? "✗ Failed to load" : "Loading..."}
            </div>
          </div>
        </div>
      )}

      <div className="mb-2">
        <div className="font-semibold mb-1">Session Data:</div>
        <pre className="text-xs overflow-auto max-h-40 bg-gray-900 p-2 rounded">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="text-xs text-gray-400 mt-2">
        Press Ctrl+Shift+D to toggle this debug panel
      </div>
    </div>
  );
}
