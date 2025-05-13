"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "../Notification";
import { Bell, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import NotificationList from "./NotificationList";

interface NotificationDropdownProps {
  onClose: () => void;
  onMarkAllRead: () => void;
  onViewAll?: () => void;
}

export default function NotificationDropdown({
  onClose,
  onMarkAllRead,
  onViewAll,
}: NotificationDropdownProps) {
  const { data: session } = useSession();
  const { showNotification } = useNotification();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch("/api/notifications/user?limit=20");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        showNotification("Failed to load notifications", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session, showNotification]);

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id || markingRead) return;

    try {
      setMarkingRead(true);
      const response = await fetch("/api/notifications/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ all: true }),
      });

      if (response.ok) {
        // Update local state to mark all as read
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            read: true,
          }))
        );

        // Call the callback to update the unread count
        onMarkAllRead();

        showNotification("All notifications marked as read", "success");
      } else {
        throw new Error("Failed to mark notifications as read");
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      showNotification("Failed to mark notifications as read", "error");
    } finally {
      setMarkingRead(false);
    }
  };

  return (
    <div className="dropdown-content z-[1] shadow-lg bg-base-100 rounded-box w-80 sm:w-96 mt-4 overflow-hidden absolute right-0">
      <div className="flex flex-col">
        <div className="p-3 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="btn btn-ghost btn-sm gap-1"
              disabled={markingRead || loading || notifications.length === 0}
              title="Mark all as read"
            >
              {markingRead ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span className="hidden sm:inline">Mark all</span>
            </button>
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="btn btn-ghost btn-sm"
                title="View all notifications"
              >
                <span>View all</span>
              </button>
            )}
          </div>
        </div>

        <NotificationList
          notifications={notifications}
          loading={loading}
          onClose={onClose}
          onMarkAllRead={onMarkAllRead}
        />
      </div>
    </div>
  );
}
