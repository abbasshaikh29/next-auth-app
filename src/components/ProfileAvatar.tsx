"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { addCacheBusting, preloadImage } from "@/utils/crossBrowserImageUtils";
import styles from "./ProfileAvatar.module.css";

interface ProfileAvatarProps {
  imageUrl?: string | null;
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ProfileAvatar({
  imageUrl,
  name,
  email,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!imageUrl);

  // For Google images, we need a unique ID - create it unconditionally
  const [avatarId] = useState(`google-avatar-${Date.now()}`);

  // Get the first letter for the fallback
  const firstLetter = name?.charAt(0) || email?.charAt(0) || "?";

  // Size classes from CSS module
  const sizeClasses = {
    sm: styles.avatarSm,
    md: styles.avatarMd,
    lg: styles.avatarLg,
  };

  // Check if it's a Google profile image - do this before any conditional returns
  const isGoogleImage = imageUrl?.includes("googleusercontent.com");

  // Process the image source
  const processedSrc = imageUrl ? addCacheBusting(imageUrl) : "";

  // Preload the image - this hook is now unconditional
  useEffect(() => {
    if (imageUrl) {
      preloadImage(imageUrl);
    }
  }, [imageUrl]);

  // For Google images, add a style tag to the document head
  useEffect(() => {
    // Only proceed if we have a Google image
    if (!isGoogleImage || !imageUrl) return;

    // Create a style element
    const styleEl = document.createElement("style");
    styleEl.id = avatarId;
    styleEl.innerHTML = `
      .${avatarId} {
        background-image: url(${imageUrl});
      }
    `;
    document.head.appendChild(styleEl);

    // Clean up when component unmounts
    return () => {
      const el = document.getElementById(avatarId);
      if (el) el.remove();
    };
  }, [imageUrl, avatarId, isGoogleImage]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Handle image error
  const handleImageError = () => {
    console.error("Failed to load profile image:", imageUrl);
    setImageError(true);
    setIsLoading(false);
  };

  // Render the fallback avatar with the first letter
  const renderFallback = () => (
    <div
      className={`${styles.avatar} ${sizeClasses[size]} ${styles.fallback} ${className}`}
    >
      <span className={styles.fallbackText}>{firstLetter.toUpperCase()}</span>
    </div>
  );

  // If there's no image or there was an error loading it, show fallback
  if (!imageUrl || imageError) {
    return renderFallback();
  }

  // For Google images, use a simple div with background image
  if (isGoogleImage) {
    return (
      <div
        className={`${styles.avatar} ${sizeClasses[size]} ${styles.googleAvatar} ${avatarId} ${className}`}
      />
    );
  }

  // For all other images, use img tag
  return (
    <div className={`${styles.avatar} ${sizeClasses[size]} ${className}`}>
      {isLoading && (
        <div className={styles.loading}>
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
      <img
        src={processedSrc}
        alt={name || "User profile"}
        className={styles.image}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}
