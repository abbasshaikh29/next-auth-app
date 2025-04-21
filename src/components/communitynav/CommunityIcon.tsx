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
  }, [iconUrl]);

  // Check if image is already cached
  useEffect(() => {
    if (iconUrl && iconUrl.trim() !== "" && imgRef.current) {
      if (imgRef.current.complete) {
        setIsLoading(false);
      }
    }
  }, [iconUrl]);

  // Preload image
  useEffect(() => {
    if (iconUrl && iconUrl.trim() !== "" && priority) {
      const img = new Image();
      img.src = iconUrl;
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setImageError(true);
        setIsLoading(false);
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
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
          onLoad={() => {
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
