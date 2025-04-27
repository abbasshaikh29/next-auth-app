"use client";

import React, { useState } from 'react';

interface GoogleProfileImageProps {
  imageUrl: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A component specifically designed to display Google profile images
 * Uses CSS background-image which is the most reliable method for Google images
 */
export default function GoogleProfileImage({
  imageUrl,
  name = '?',
  size = 'md',
  className = '',
}: GoogleProfileImageProps) {
  const [error, setError] = useState(false);
  
  // Get the first letter for the fallback
  const firstLetter = name.charAt(0) || '?';
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  // If there's an error or no image URL, show fallback
  if (error || !imageUrl) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-primary text-primary-content ${className}`}
      >
        <span className="text-lg font-bold">{firstLetter.toUpperCase()}</span>
      </div>
    );
  }
  
  // For Google images, use a direct div with background-image
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full ${className}`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onError={() => setError(true)}
    />
  );
}
