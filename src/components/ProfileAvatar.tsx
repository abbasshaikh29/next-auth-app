"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { addCacheBusting, preloadImage } from "@/utils/crossBrowserImageUtils";
import styles from "./ProfileAvatar.module.css";

// Helper function to get initials from name or email
const getInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    // Get first letter of first name and first letter of last name if available
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  // Fallback to email
  if (email && email.trim()) {
    return email.charAt(0).toUpperCase();
  }

  // Default fallback
  return "?";
};

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

  // Check if it's an S3 image - include both amazonaws.com and any custom S3 URL
  const isS3Image =
    imageUrl?.includes("amazonaws.com") ||
    (imageUrl?.includes(".s3.") && imageUrl?.includes(".amazonaws.com"));

  // Add a timestamp to force cache refresh
  const timestamp = Date.now();

  // Process the image source with forced cache busting for S3 images
  const processedSrc = imageUrl
    ? isS3Image
      ? `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}t=${timestamp}`
      : addCacheBusting(imageUrl)
    : "";

  // Silently test if the image is accessible
  useEffect(() => {
    if (imageUrl) {
      const testImg = document.createElement("img");
      testImg.onload = () => {
        // Image loaded successfully, no need to log
      };
      testImg.onerror = () => {
        // If a Google image fails to load, we could be dealing with an outdated URL
        // Just let the component's error handling take over
      };
      testImg.src = processedSrc;
    }
  }, [imageUrl, processedSrc]);

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

  // For S3 images, use Next.js Image component for optimization
  if (isS3Image) {
    return (
      <div
        className={`${styles.avatar} ${sizeClasses[size]} ${className} overflow-hidden relative`}
      >
        <Image
          src={processedSrc}
          alt={name || "User"}
          fill
          sizes={size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}
          priority={size === "lg"} // Only prioritize large avatars
          className="object-cover"
          onLoadingComplete={handleImageLoad}
          onError={(e) => {
            // Fall back to initials on error
            handleImageError();
            // Add a data attribute to mark this as failed
            e.currentTarget.parentElement?.setAttribute(
              "data-image-failed",
              "true"
            );
            // Force a re-render to show initials
            e.currentTarget.parentElement?.classList.add(styles.initialsAvatar);

            // Add initials text
            const initialsSpan = document.createElement("span");
            initialsSpan.className = styles.initials;
            initialsSpan.textContent = getInitials(name, email);
            e.currentTarget.parentElement?.appendChild(initialsSpan);
          }}
        />
        {isLoading && (
          <div className={styles.loading}>
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>
    );
  }

  // For all other images, use Next.js Image component
  return (
    <div
      className={`${styles.avatar} ${sizeClasses[size]} ${className} relative`}
    >
      {isLoading && (
        <div className={styles.loading}>
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
      <Image
        src={processedSrc}
        alt={name || "User profile"}
        fill
        sizes={size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}
        className={styles.image}
        onLoadingComplete={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}
