"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useNotification } from "@/components/Notification";
import { LogOut, MessageSquare, AlertTriangle } from "lucide-react";

interface CommunityData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  admin: string;
  subAdmins: string[];
  members: string[];
}

export default function UserCommunitySettings() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();

  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Fetch community data
  const fetchCommunity = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/community/${slug}`);
      if (!res.ok) {
        throw new Error("Failed to fetch community data");
      }
      const data = await res.json();
      setCommunity(data);

      // Check user roles
      const userId = session?.user?.id;
      setIsAdmin(data.admin === userId);
      setIsSubAdmin(data.subAdmins?.includes(userId) || false);
      setIsMember(data.members?.includes(userId) || false);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching community:", error);
      showNotification("Failed to fetch community data", "error");
      setLoading(false);
    }
  };

  // Fetch user messaging preferences
  const fetchMessagingPreferences = async () => {
    try {
      const res = await fetch("/api/user/messaging-preferences");
      if (!res.ok) {
        throw new Error("Failed to fetch messaging preferences");
      }
      const data = await res.json();

      // Check if this community is in the blocked list
      const isBlocked = data.messagingPreferences?.blockedCommunities?.includes(
        community?._id
      );
      setAllowMessages(!isBlocked);
    } catch (error) {
      console.error("Error fetching messaging preferences:", error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCommunity();
    }
  }, [session, slug]);

  useEffect(() => {
    if (community && session?.user) {
      fetchMessagingPreferences();
    }
  }, [community, session]);

  // Handle messaging preference toggle
  const handleMessagingToggle = async () => {
    try {
      const newAllowMessages = !allowMessages;

      const res = await fetch("/api/user/messaging-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId: community?._id,
          allowMessages: newAllowMessages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update messaging preferences");
      }

      setAllowMessages(newAllowMessages);
      showNotification(
        `Messages from community members ${
          newAllowMessages ? "enabled" : "disabled"
        }`,
        "success"
      );
    } catch (error) {
      console.error("Error updating messaging preferences:", error);
      showNotification("Failed to update messaging preferences", "error");
    }
  };

  // Handle leaving community
  const handleLeaveCommunity = async () => {
    if (!confirmLeave) {
      setConfirmLeave(true);
      return;
    }

    try {
      const res = await fetch("/api/community/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId: community?._id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to leave community");
      }

      showNotification("You have successfully left the community", "success");
      // Redirect to home page after leaving
      router.push("/");
    } catch (error: any) {
      console.error("Error leaving community:", error);
      showNotification(error.message || "Failed to leave community", "error");
      setConfirmLeave(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isMember && !isAdmin && !isSubAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-base-100 rounded-box shadow-lg">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-4">
            You are not a member of this community
          </h2>
          <p className="text-gray-500">
            You need to join this community to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-base-100 rounded-box shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Your Community Settings</h2>

      {/* Messaging Preferences */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Messaging Preferences</h3>
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={allowMessages}
              onChange={handleMessagingToggle}
            />
            <span className="label-text">
              Allow members of this community to message me
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-2 ml-14">
            When disabled, members of this community won't be able to send you
            direct messages.
          </p>
        </div>
      </div>

      {/* Leave Community */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3 text-error">Danger Zone</h3>
        <div className="p-4 border border-error rounded-lg">
          {isAdmin ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-error mt-1" size={20} />
              <div>
                <p className="font-medium">
                  You are the admin of this community
                </p>
                <p className="text-sm mt-1">
                  As the admin, you cannot leave this community. You need to
                  either transfer ownership to another member or delete the
                  community.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogOut className="text-error" size={20} />
                  <span>Leave Community</span>
                </div>
                <button
                  type="button"
                  className={`btn ${
                    confirmLeave ? "btn-error" : "btn-outline btn-error"
                  }`}
                  onClick={handleLeaveCommunity}
                >
                  {confirmLeave ? "Confirm Leave" : "Leave"}
                </button>
              </div>
              {confirmLeave && (
                <div className="mt-3 p-3 bg-error bg-opacity-10 rounded-md">
                  <p className="text-sm text-error">
                    Are you sure you want to leave this community? This action
                    cannot be undone.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-error"
                      onClick={handleLeaveCommunity}
                    >
                      Yes, leave community
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => setConfirmLeave(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
