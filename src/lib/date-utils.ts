/**
 * Formats a date as a relative time string (e.g., "2h ago", "3d ago", "2mo ago")
 * @param date The date to format (Date object or date string)
 * @returns A string representing the relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Calculate the difference in milliseconds
  const diffMs = now.getTime() - dateObj.getTime();
  
  // Convert to seconds, minutes, hours, days, months, years
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  // Return the appropriate string based on the time difference
  if (diffSeconds < 60) {
    return diffSeconds <= 0 ? 'just now' : `${diffSeconds}s ago`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  } else {
    return `${diffYears}y ago`;
  }
}
