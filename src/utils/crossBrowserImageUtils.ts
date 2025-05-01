/**
 * Cross-browser image utilities
 */

/**
 * Adds cache busting parameters to an image URL
 * @param url The original image URL
 * @returns The URL with cache-busting parameters
 */
export const addCacheBusting = (url: string): string => {
  if (!url) return url;

  // Skip cache busting for Google profile images
  if (url.includes("googleusercontent.com")) {
    return url;
  }

  // Skip cache busting for S3 URLs with query parameters
  if (url.includes("amazonaws.com") && url.includes("?")) {
    return url;
  }

  const timestamp = Date.now();
  return url.includes("?") ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;
};

/**
 * Preloads an image to ensure it's in the browser cache
 * @param url The image URL to preload
 */
export const preloadImage = (url: string): void => {
  if (!url) return;

  // Create a new image element
  const img = new Image();

  // Set the source to preload the image
  img.src = addCacheBusting(url);
};

/**
 * Checks if an image URL is valid and accessible
 * @param url The image URL to check
 * @returns Promise that resolves to true if the image is valid, false otherwise
 */
export const isImageValid = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();

    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);

    img.src = addCacheBusting(url);
  });
};

/**
 * Creates a data URL for a fallback avatar with the first letter of the name
 * @param name The name to use for the fallback
 * @param bgColor Background color (default: primary color)
 * @param textColor Text color (default: white)
 * @returns A data URL for the fallback avatar
 */
export const createFallbackAvatar = (
  name: string = "?",
  bgColor: string = "#6b21a8", // Halloween purple
  textColor: string = "#ffffff"
): string => {
  // For server-side rendering, return empty string
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 200;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Draw background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  const letter = name.charAt(0).toUpperCase();
  ctx.fillStyle = textColor;
  ctx.font = "bold 100px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
};
