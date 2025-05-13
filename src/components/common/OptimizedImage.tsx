import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { convertS3UrlToR2, isS3Url } from "@/utils/s3-to-r2-migration";
import styles from "./OptimizedImage.module.css";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string | React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
  objectFit?: "contain" | "cover" | "fill";
  sizes?: string;
  placeholder?: "blur" | "empty";
}

// Simple placeholder blur data URL (light gray)
const PLACEHOLDER_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4=";

export default function OptimizedImage({
  src,
  alt,
  width = 100,
  height = 100,
  className = "",
  priority = false,
  fallback,
  onError,
  onLoad,
  objectFit = "cover",
  sizes = "100vw",
  placeholder = "blur",
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!priority); // Don't show loading state for priority images

  // Process the image URL - avoid cache busting for better performance
  // Only add cache busting for development environment
  const imageSrc = useMemo(() => {
    if (!src) return "";

    // Convert S3 URLs to R2 URLs if needed
    const convertedSrc = isS3Url(src) ? convertS3UrlToR2(src) : src;

    // Skip cache busting for Google images and production environment
    if (
      convertedSrc.includes("googleusercontent.com") ||
      process.env.NODE_ENV === "production"
    ) {
      return convertedSrc;
    }

    // Only add cache busting in development for debugging
    if (
      process.env.NODE_ENV === "development" &&
      !convertedSrc.includes("t=")
    ) {
      const timestamp = Date.now();
      return convertedSrc.includes("?")
        ? `${convertedSrc}&t=${timestamp}`
        : `${convertedSrc}?t=${timestamp}`;
    }

    return convertedSrc;
  }, [src]);

  const handleError = () => {
    console.error("Image failed to load:", src);
    setError(true);
    setLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  // If there's an error and we have a fallback, show it
  if (error && fallback) {
    return typeof fallback === "string" ? (
      <div className={className}>
        <div className={styles.fallbackContainer}>{fallback}</div>
      </div>
    ) : (
      fallback
    );
  }

  // Special handling for Google profile images
  if (src && src.includes("googleusercontent.com")) {
    return (
      <div className={`${styles.imageContainer} ${className}`}>
        {loading && (
          <div className={styles.loading}>
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <div className={styles.imageContainer}>
          {/* Use regular img tag for Google images */}
          <img
            src={src}
            alt={alt}
            className={`${styles.image} ${
              objectFit === "contain"
                ? styles.imageContain
                : objectFit === "fill"
                  ? styles.imageFill
                  : styles.imageCover
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
      </div>
    );
  }

  // For all other images, use Next.js Image component with optimizations
  return (
    <div className={`${styles.imageContainer} ${className}`}>
      {loading && placeholder !== "blur" && (
        <div className={styles.loading}>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${styles.image} ${
          objectFit === "contain"
            ? styles.imageContain
            : objectFit === "fill"
              ? styles.imageFill
              : styles.imageCover
        }`}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        quality={80} // Slightly lower quality for better performance
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        placeholder={placeholder === "blur" ? "blur" : "empty"}
        blurDataURL={
          placeholder === "blur" ? PLACEHOLDER_BLUR_DATA_URL : undefined
        }
      />
    </div>
  );
}
