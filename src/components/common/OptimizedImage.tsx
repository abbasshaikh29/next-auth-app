import Image from "next/image";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
}

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
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(src);

  // Process the image URL to ensure it's compatible with Next.js Image component
  useEffect(() => {
    setError(false);
    setLoading(true);

    // Add cache busting for non-Google images
    let processedSrc = src;
    if (src && !src.includes("googleusercontent.com") && !src.includes("t=")) {
      const timestamp = Date.now();
      processedSrc = src.includes("?")
        ? `${src}&t=${timestamp}`
        : `${src}?t=${timestamp}`;
    }

    setImageSrc(processedSrc);
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
          <img
            src={src}
            alt={alt}
            className="hidden"
            onLoad={handleLoad}
            onError={handleError}
          />
          <div
            className={`${styles.backgroundImage} ${
              objectFit === "contain"
                ? styles.backgroundContain
                : styles.backgroundCover
            } ${styles.googleImage1}`}
            style={{
              ["--bg-image-url" as any]: `url(${src})`,
            }}
          />
        </div>
      </div>
    );
  }

  // For all other images, use Next.js Image component
  return (
    <div className={`${styles.imageContainer} ${className}`}>
      {loading && (
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
          loading ? styles.hidden : styles.visible
        }`}
        style={{ objectFit }}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        quality={90}
        loading={priority ? "eager" : "lazy"}
        unoptimized={src.includes("googleusercontent.com")}
      />
    </div>
  );
}
