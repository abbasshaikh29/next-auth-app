"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  className?: string;
  showIcon?: boolean;
  onFollowStatusChange?: (newStatus: boolean) => void; // Added callback prop
}

export default function FollowButton({ 
  userId, 
  isFollowing: initialIsFollowing, 
  className,
  showIcon = true,
  onFollowStatusChange // Destructure new prop
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFollowToggle = async () => {
    try {
      setIsLoading(true);
      
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update follow status");
      }

      const newFollowStatus = !isFollowing;
      setIsFollowing(newFollowStatus);
      if (onFollowStatusChange) {
        onFollowStatusChange(newFollowStatus); // Call the callback
      }
      router.refresh(); // Refresh the page to update UI
    } catch (error) {
      console.error("Follow action error:", error);
      // You could add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`flex items-center justify-center py-2 px-3 rounded-md font-medium text-xs transition-colors duration-150 ${className}`}
      style={{
        backgroundColor: isFollowing ? "var(--bg-tertiary)" : "var(--primary-color, #2563eb)",
        color: isFollowing ? "var(--text-secondary)" : "white",
      }}
    >
      {showIcon && (
        isFollowing 
          ? <UserMinus size={14} className="mr-1.5" /> 
          : <UserPlus size={14} className="mr-1.5" />
      )}
      {isLoading ? "..." : isFollowing ? "UNFOLLOW" : "FOLLOW"}
    </button>
  );
}
