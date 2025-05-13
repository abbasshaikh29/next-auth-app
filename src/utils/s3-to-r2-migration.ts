/**
 * Utility functions to help with the migration from S3 to R2
 */

/**
 * Converts an S3 URL to an R2 URL
 * @param s3Url The original S3 URL
 * @returns The equivalent R2 URL or the original URL if it's not an S3 URL
 */
export function convertS3UrlToR2(s3Url: string): string {
  if (!s3Url) return s3Url;

  // Check if it's an S3 URL
  const isS3Url =
    s3Url.includes("thetribelabbucket.s3.ap-southeast-1.amazonaws.com") ||
    (s3Url.includes(".s3.") && s3Url.includes(".amazonaws.com"));

  if (!isS3Url) return s3Url;

  // Extract the path from the S3 URL
  let path = "";

  try {
    const url = new URL(s3Url);
    path = url.pathname;

    // Remove leading slash if present
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
  } catch (error) {
    return s3Url;
  }

  // Hardcoded R2 public URL from .env.development
  const hardcodedR2Url = "https://pub-895f71ea78c843b59c97073ccfe523c5.r2.dev";

  // Get the R2 public URL from environment variables or use hardcoded fallback
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || hardcodedR2Url;
  const customDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN;

  // Construct the R2 URL
  let convertedUrl = "";

  if (r2PublicUrl) {
    // Use the environment variable R2 public URL
    convertedUrl = `${r2PublicUrl}/${path}`;
    return convertedUrl;
  }

  // If using custom domain
  if (customDomain) {
    convertedUrl = `${customDomain}/${path}`;
    return convertedUrl;
  }

  // This should never happen since we're using the hardcoded fallback above,
  // but just in case, use the hardcoded fallback again
  convertedUrl = `${hardcodedR2Url}/${path}`;
  return convertedUrl;
}

/**
 * Checks if a URL is an S3 URL
 * @param url The URL to check
 * @returns True if it's an S3 URL, false otherwise
 */
export function isS3Url(url: string): boolean {
  if (!url) return false;

  return (
    url.includes("thetribelabbucket.s3.ap-southeast-1.amazonaws.com") ||
    (url.includes(".s3.") && url.includes(".amazonaws.com"))
  );
}

/**
 * Checks if a URL is an R2 URL
 * @param url The URL to check
 * @returns True if it's an R2 URL, false otherwise
 */
export function isR2Url(url: string): boolean {
  if (!url) return false;

  // Hardcoded R2 public URL from .env.development
  const hardcodedR2Url = "https://pub-895f71ea78c843b59c97073ccfe523c5.r2.dev";

  // Get environment variables
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || hardcodedR2Url;
  const customDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN;

  // Create an array of all possible R2 domains to check
  const r2Domains = [
    // Current R2 URL from .env.development
    "pub-895f71ea78c843b59c97073ccfe523c5.r2.dev",
    // Hardcoded fallback URL
    "pub-65971ea78c843b59c97073ccfe523c5.r2.dev",
    // Older URL formats for backward compatibility
    "pub-thetribelab.r2.dev",
    "pub-fa626969086b44f788fa6d3ad94f6b2f.r2.dev",
    // General patterns
    ".r2.dev",
    ".r2.cloudflarestorage.com",
  ];

  // Add environment variables to the list if they exist
  if (r2PublicUrl) {
    // Extract the domain part from the URL
    try {
      const domain = new URL(r2PublicUrl).hostname;
      if (!r2Domains.includes(domain)) {
        r2Domains.push(domain);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  if (customDomain) {
    try {
      const domain = new URL(customDomain).hostname;
      if (!r2Domains.includes(domain)) {
        r2Domains.push(domain);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // Check if the URL includes any of the R2 domains
  for (const domain of r2Domains) {
    if (url.includes(domain)) {
      return true;
    }
  }

  return false;
}
