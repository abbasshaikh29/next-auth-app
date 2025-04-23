"use client";

import { Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/date-utils";
import { useSession } from "next-auth/react";

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    username: string;
    profileImage?: string;
  }[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCounts: {
    userId: string;
    count: number;
  }[];
}

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  onSelectConversation: (userId: string) => void;
}

export default function ConversationList({
  conversations,
  loading,
  onSelectConversation,
}: ConversationListProps) {
  const { data: session } = useSession();
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a new message to chat with someone</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[400px]">
      {conversations.map((conversation) => {
        const otherUser = conversation.participants[0]; // The first participant is the other user
        if (!otherUser) return null;

        return (
          <div
            key={conversation._id}
            className="flex items-center p-3 hover:bg-base-200 cursor-pointer border-b border-base-200"
            onClick={() => onSelectConversation(otherUser._id)}
          >
            <div className="avatar mr-3">
              <div className="w-10 h-10 rounded-full">
                {otherUser.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={otherUser.username}
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center">
                    {otherUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h4 className="font-medium truncate">{otherUser.username}</h4>
                {conversation.lastMessageTime && (
                  <span className="text-xs text-gray-500">
                    {formatRelativeTime(new Date(conversation.lastMessageTime))}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage || "No messages yet"}
              </p>
            </div>
            {conversation.unreadCounts?.some(
              (count) => count.userId === session?.user?.id && count.count > 0
            ) && (
              <div className="badge badge-primary badge-sm ml-2">
                {conversation.unreadCounts.find(
                  (count) => count.userId === session?.user?.id
                )?.count || 0}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
