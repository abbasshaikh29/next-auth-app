/**
 * Utility functions for image optimization
 */

/**
 * Determines if an image should be loaded with priority
 * @param index The index of the image in a list
 * @param isVisible Whether the image is in the viewport
 * @param isCritical Whether the image is critical for the page
 * @returns Whether the image should be loaded with priority
 */
export const shouldPrioritizeImage = (
  index: number = 0,
  isVisible: boolean = false,
  isCritical: boolean = false
): boolean => {
  // Always prioritize critical images (e.g., hero images, logos)
  if (isCritical) return true;
  
  // Prioritize visible images that are in the first few positions
  if (isVisible && index < 3) return true;
  
  return false;
};

/**
 * Generates appropriate sizes attribute for responsive images
 * @param containerWidth The width of the container in pixels or CSS value
 * @param breakpoints Optional custom breakpoints
 * @returns A sizes attribute string
 */
export const getResponsiveSizes = (
  containerWidth: string | number,
  breakpoints?: { [key: string]: string }
): string => {
  // Default breakpoints if none provided
  const defaultBreakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  };
  
  const bp = breakpoints || defaultBreakpoints;
  
  // Convert numeric width to string with px
  const width = typeof containerWidth === 'number' 
    ? `${containerWidth}px` 
    : containerWidth;
  
  // Build the sizes string
  return `
    (max-width: ${bp.sm}) 100vw,
    (max-width: ${bp.md}) 50vw,
    (max-width: ${bp.lg}) 33vw,
    ${width}
  `.trim().replace(/\s+/g, ' ');
};

/**
 * Creates a simple color placeholder for an image
 * @param color The background color in hex format
 * @returns A data URL for a placeholder
 */
export const createColorPlaceholder = (color: string = '#f1f1f1'): string => {
  // Encode the color for use in SVG
  const encodedColor = color.replace('#', '%23');
  
  // Create a simple SVG with the specified color
  return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" fill="${encodedColor}"></svg>`;
};

/**
 * Determines if an image URL is from a specific provider
 * @param url The image URL to check
 * @param provider The provider to check for (e.g., 'googleusercontent', 's3.amazonaws')
 * @returns Whether the image is from the specified provider
 */
export const isImageFromProvider = (
  url: string,
  provider: string
): boolean => {
  if (!url) return false;
  return url.includes(provider);
};

/**
 * Gets appropriate image dimensions based on the container size
 * @param containerWidth The width of the container in pixels
 * @param aspectRatio The aspect ratio (width/height) of the image
 * @returns An object with width and height
 */
export const getImageDimensions = (
  containerWidth: number,
  aspectRatio: number = 1
): { width: number; height: number } => {
  const width = Math.round(containerWidth);
  const height = Math.round(width / aspectRatio);
  
  return { width, height };
};
