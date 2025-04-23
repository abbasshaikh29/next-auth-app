/**
 * Utility functions for handling URLs in text content
 */

/**
 * Regular expression to detect URLs in text
 * This pattern matches common URL formats including http, https, ftp, and www
 */
const URL_REGEX = /(https?:\/\/|www\.)[^\s]+(\.[^\s]+)+/g;

/**
 * Checks if a string is a valid URL
 * @param str - The string to check
 * @returns boolean - True if the string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  try {
    if (str.startsWith('www.')) {
      str = 'http://' + str;
    }
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Ensures a URL has a protocol (http:// or https://)
 * @param url - The URL to normalize
 * @returns string - The normalized URL with protocol
 */
export const normalizeUrl = (url: string): string => {
  if (url.startsWith('www.')) {
    return 'https://' + url;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
};

/**
 * Converts URLs in text to clickable links
 * @param text - The text containing URLs
 * @returns React elements array with clickable links
 */
export const parseTextWithLinks = (text: string): { type: string; content: string }[] => {
  if (!text) return [];
  
  // Find all URLs in the text
  const matches = text.match(URL_REGEX);
  
  if (!matches || matches.length === 0) {
    // No URLs found, return as regular text
    return [{ type: 'text', content: text }];
  }
  
  // Split the text by URLs and create an array of text and link elements
  const result: { type: string; content: string }[] = [];
  let lastIndex = 0;
  
  matches.forEach(match => {
    const matchIndex = text.indexOf(match, lastIndex);
    
    // Add text before the URL
    if (matchIndex > lastIndex) {
      result.push({ 
        type: 'text', 
        content: text.substring(lastIndex, matchIndex) 
      });
    }
    
    // Add the URL as a link
    result.push({ 
      type: 'link', 
      content: match 
    });
    
    lastIndex = matchIndex + match.length;
  });
  
  // Add any remaining text after the last URL
  if (lastIndex < text.length) {
    result.push({ 
      type: 'text', 
      content: text.substring(lastIndex) 
    });
  }
  
  return result;
};
