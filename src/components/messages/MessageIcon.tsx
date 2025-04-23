"use client";

import { MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "../Notification";
import MessageDropdown from "./MessageDropdown";
import MessageModal from "./MessageModal";

export default function MessageIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to fetch unread message count
  const fetchUnreadCount = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const conversations = await response.json();

        // Calculate total unread messages
        let total = 0;
        conversations.forEach((conversation: any) => {
          const userUnreadCount = conversation.unreadCounts?.find(
            (count: any) => count.userId === session?.user?.id
          );
          if (userUnreadCount) {
            total += userUnreadCount.count;
          }
        });

        setUnreadCount(total);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Set up fetching of unread counts
  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount();

      // Set up interval to check for new messages
      const intervalId = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds

      return () => clearInterval(intervalId);
    }
  }, [session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (!session) {
      showNotification("Please sign in to use messages", "info");
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="btn btn-ghost btn-circle relative"
        aria-label="Messages"
        title="Messages"
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <MessageDropdown
          onClose={() => setIsOpen(false)}
          onSelectConversation={(userId) => {
            setSelectedConversation(userId);
            setShowModal(true);
            setIsOpen(false);
          }}
        />
      )}

      {/* Chat Modal */}
      {showModal && selectedConversation && (
        <MessageModal
          userId={selectedConversation}
          onClose={() => {
            setShowModal(false);
            setSelectedConversation(null);
          }}
          onMessageSent={() => {
            // Refresh unread counts after sending a message
            fetchUnreadCount();
          }}
        />
      )}
    </div>
  );
}
