/**
 * Utility functions for handling images
 */

/**
 * Adds cache-busting parameters to an image URL
 * @param url The original image URL
 * @returns The URL with cache-busting parameters
 */
export const addCacheBusting = (url: string): string => {
  if (!url) return url;

  // Skip cache busting for Google profile images as they have their own caching mechanism
  if (url.includes("googleusercontent.com")) {
    return url;
  }

  const timestamp = Date.now();
  return url.includes("?") ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`;
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

/**
 * Handles image loading errors by replacing with a fallback
 * @param event The error event
 * @param name The name to use for the fallback
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  name: string = "?"
): void => {
  const imgElement = event.currentTarget;
  console.error("Image failed to load:", imgElement.src);

  const originalSrc = imgElement.src;

  // Special handling for Google profile images
  if (originalSrc.includes("googleusercontent.com")) {
    // Google images sometimes fail due to CORS or other restrictions
    // Skip retry and go straight to fallback
    applyImageFallback(imgElement, name);
    return;
  }

  // Try to load with cache busting first if not already attempted
  if (!originalSrc.includes("t=")) {
    imgElement.src = addCacheBusting(originalSrc);

    // Set a one-time event listener to handle if the retry also fails
    imgElement.addEventListener(
      "error",
      (e) => {
        const element = e.target as HTMLImageElement;
        applyImageFallback(element, name);
      },
      { once: true }
    );
  } else {
    // Already tried with cache busting, use fallback
    applyImageFallback(imgElement, name);
  }
};

/**
 * Helper function to apply the fallback UI when an image fails to load
 * @param imgElement The image element that failed to load
 * @param name The name to use for the fallback letter
 */
const applyImageFallback = (
  imgElement: HTMLImageElement,
  name: string = "?"
): void => {
  imgElement.style.display = "none";

  // Replace with fallback if parent exists
  if (imgElement.parentElement) {
    const letter = name.charAt(0).toUpperCase();
    imgElement.parentElement.innerHTML = `
      <div class="w-full h-full flex items-center justify-center bg-primary text-primary-content">
        <span class="text-lg font-bold">${letter}</span>
      </div>
    `;
  }
};
