"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import MessageThread from "./MessageThread";

interface MessageModalProps {
  userId: string;
  onClose: () => void;
  onMessageSent: () => void;
}

export default function MessageModal({
  userId,
  onClose,
  onMessageSent,
}: MessageModalProps) {
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Prevent scrolling of the background when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal content */}
        <div
          className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col message-modal"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
            title="Close"
          >
            <X size={20} />
          </button>

          {/* Message thread */}
          <div className="flex-1 overflow-hidden">
            <MessageThread
              userId={userId}
              onBack={onClose}
              onMessageSent={onMessageSent}
              isModal={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
