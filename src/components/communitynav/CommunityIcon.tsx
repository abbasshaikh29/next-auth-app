"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { addCacheBusting, preloadImage } from "@/utils/crossBrowserImageUtils";

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

  // Preload the image - moved to top to follow React Hooks rules
  useEffect(() => {
    if (iconUrl) {
      preloadImage(iconUrl);
    }
  }, [iconUrl]);

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

  // Handle image load
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Fallback component
  const renderFallback = () => (
    <div
      className={`${sizeClasses[size]} rounded-md overflow-hidden ${borderClasses} ${shadowClasses} flex-shrink-0 bg-primary/20 flex items-center justify-center ${className}`}
      title={name}
    >
      <span className={`${fontSizeClasses[size]} font-bold text-primary`}>
        {name ? name.charAt(0).toUpperCase() : "C"}
      </span>
    </div>
  );

  // If we don't have a valid icon URL, show fallback
  if (!iconUrl || iconUrl.trim() === "" || imageError) {
    return renderFallback();
  }

  // Use utility function to add cache busting
  const processedSrc = addCacheBusting(iconUrl);

  return (
    <div
      className={`${sizeClasses[size]} rounded-md overflow-hidden ${borderClasses} ${shadowClasses} flex-shrink-0 ${className}`}
      title={name}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      )}
      <img
        src={processedSrc}
        alt={`${name} icon`}
        className="w-full h-full object-cover"
        loading={priority ? "eager" : "lazy"}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default CommunityIcon;
