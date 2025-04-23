"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface CommunityIconProps {
  iconUrl?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}

const CommunityIcon: React.FC<CommunityIconProps> = ({
  iconUrl,
  name,
  size = "md",
  className = "",
  priority = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset error state if iconUrl changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    console.log("CommunityIcon: iconUrl changed:", iconUrl);

    // Attempt to preload the image
    if (iconUrl && iconUrl.trim() !== "") {
      const img = new Image();
      // Add cache-busting parameter to force a fresh load
      const cacheBustUrl = iconUrl.includes("?")
        ? `${iconUrl}&t=${Date.now()}`
        : `${iconUrl}?t=${Date.now()}`;
      img.src = cacheBustUrl;
      img.onload = () => {
        console.log(
          "CommunityIcon: Image preloaded successfully:",
          cacheBustUrl
        );
        setIsLoading(false);
      };
      img.onerror = (e) => {
        console.error("CommunityIcon: Image preload error:", cacheBustUrl, e);
        // Don't set error state yet, the actual img tag will try again
      };
    }
  }, [iconUrl]);

  // Check if image is already cached
  useEffect(() => {
    if (iconUrl && iconUrl.trim() !== "" && imgRef.current) {
      if (imgRef.current.complete) {
        setIsLoading(false);
      }
    }
  }, [iconUrl]);

  // Preload image with priority
  useEffect(() => {
    if (iconUrl && iconUrl.trim() !== "" && priority) {
      const img = new Image();
      // Add cache-busting parameter for priority loads
      const cacheBustUrl = iconUrl.includes("?")
        ? `${iconUrl}&t=${Date.now()}`
        : `${iconUrl}?t=${Date.now()}`;
      img.src = cacheBustUrl;
      img.onload = () => {
        console.log(
          "CommunityIcon: Priority image loaded successfully:",
          cacheBustUrl
        );
        setIsLoading(false);
      };
      img.onerror = (e) => {
        console.error(
          "CommunityIcon: Priority image load error:",
          cacheBustUrl,
          e
        );
        // Try one more time without cache busting
        const retryImg = new Image();
        retryImg.src = iconUrl;
        retryImg.onload = () => {
          console.log("CommunityIcon: Retry successful:", iconUrl);
          setIsLoading(false);
        };
        retryImg.onerror = () => {
          console.error("CommunityIcon: Retry failed:", iconUrl);
          setImageError(true);
          setIsLoading(false);
        };
      };
    }
  }, [iconUrl, priority]);

  // Size classes
  const sizeClasses = {
    sm: "w-6 h-6 min-w-6 min-h-6",
    md: "w-8 h-8 sm:w-10 sm:h-10 min-w-8 min-h-8 sm:min-w-10 sm:min-h-10",
    lg: "w-12 h-12 sm:w-16 sm:h-16 min-w-12 min-h-12 sm:min-w-16 sm:min-h-16",
  };

  // Font size classes
  const fontSizeClasses = {
    sm: "text-xs",
    md: "text-sm sm:text-lg",
    lg: "text-lg sm:text-2xl",
  };

  // Border classes
  const borderClasses = "border-2 border-primary";

  // Shadow classes
  const shadowClasses =
    "shadow-sm hover:shadow-md transition-shadow duration-200";

  // If we have a valid icon URL and no error loading it
  if (iconUrl && iconUrl.trim() !== "" && !imageError) {
    // Try to validate the URL format
    let isValidUrl = false;
    try {
      new URL(iconUrl); // This will throw if the URL is invalid
      isValidUrl = true;
    } catch (e) {
      console.error("CommunityIcon: Invalid URL format:", iconUrl, e);
      // Don't set imageError here, still try to load it
    }

    return (
      <div
        className={`${sizeClasses[size]} rounded-md overflow-hidden ${borderClasses} ${shadowClasses} flex-shrink-0 ${className}`}
        title={name}
      >
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center bg-base-200">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
        <img
          ref={imgRef}
          src={iconUrl}
          alt={`${name} icon`}
          className={`w-full h-full object-cover ${isLoading ? "hidden" : ""}`}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          onError={(e) => {
            console.error("CommunityIcon: Image load error:", iconUrl, e);
            // Try with a cache-busting parameter if it's a valid URL
            if (isValidUrl) {
              console.log(
                "CommunityIcon: Retrying with cache-busting parameter"
              );
              const imgElement = e.target as HTMLImageElement;
              // Always add a fresh timestamp, even if URL already has parameters
              const cacheBustUrl = iconUrl.includes("?")
                ? `${iconUrl}&t=${Date.now()}`
                : `${iconUrl}?t=${Date.now()}`;
              imgElement.src = cacheBustUrl;

              // Set a timeout to handle the case where the retry also fails
              setTimeout(() => {
                if (imgRef.current && !imgRef.current.complete) {
                  console.error(
                    "CommunityIcon: Retry timed out:",
                    cacheBustUrl
                  );
                  setImageError(true);
                  setIsLoading(false);
                }
              }, 5000); // 5 second timeout

              return; // Don't set error state yet, give it another chance
            }
            setImageError(true);
            setIsLoading(false);
          }}
          onLoad={() => {
            console.log("CommunityIcon: Image loaded successfully:", iconUrl);
            setIsLoading(false);
          }}
        />
      </div>
    );
  }

  // Fallback to first letter of community name
  return (
    <div
      className={`${sizeClasses[size]} rounded-md overflow-hidden ${borderClasses} ${shadowClasses} flex-shrink-0 bg-primary/20 flex items-center justify-center ${className}`}
      title={name}
    >
      <span className={`${fontSizeClasses[size]} font-bold text-primary`}>
        {name ? name.charAt(0).toUpperCase() : "C"}
      </span>
    </div>
  );
};

export default CommunityIcon;
