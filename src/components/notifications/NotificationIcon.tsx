"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "../Notification";
import NotificationDropdown from "./NotificationDropdown";
import { useRealtime } from "../RealtimeProvider";
import { listenForRealtimeEvents } from "@/lib/realtime";

export default function NotificationIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isEnabled } = useRealtime();

  // Function to fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        "/api/notifications/user?unreadOnly=true&limit=1"
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
    }
  };

  // Set up fetching of unread counts
  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount();

      // Set up interval to check for new notifications
      const intervalId = setInterval(fetchUnreadCount, 60000); // Check every 60 seconds (reduced from 30 seconds since we have real-time updates)

      return () => clearInterval(intervalId);
    }
  }, [session]);

  // Set up real-time notification listener
  useEffect(() => {
    if (!isEnabled || !session?.user?.id) {
      return;
    }

    console.log(
      "Setting up real-time notification listener for user:",
      session.user.id
    );

    // Listen for new notifications
    const notificationCleanup = listenForRealtimeEvents(
      "notification-created",
      (data: any) => {
        console.log("Received new notification event:", data);

        // Only process if it's for this user
        if (data.userId === session.user.id) {
          // Increment the unread count
          setUnreadCount((prevCount) => prevCount + 1);

          // Show a toast notification
          showNotification(
            `New notification: ${data.notification.title}`,
            "info"
          );

          // Refresh the notification count to ensure accuracy
          fetchUnreadCount();
        }
      }
    );

    return () => {
      notificationCleanup();
    };
  }, [isEnabled, session?.user?.id, showNotification]);

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
      showNotification("Please sign in to view notifications", "info");
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
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-primary text-primary-content rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          onMarkAllRead={fetchUnreadCount}
          onViewAll={() => {
            setIsOpen(false);
            window.location.href = "/notifications/feed";
          }}
        />
      )}
    </div>
  );
}
