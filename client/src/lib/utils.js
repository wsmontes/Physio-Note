import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to localized string
 */
export function formatDate(date, locale = 'en-US') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date, locale = 'en-US') {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = new Date(date) - new Date();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (Math.abs(days) < 1) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (Math.abs(hours) < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return rtf.format(minutes, 'minute');
    }
    return rtf.format(hours, 'hour');
  }
  
  if (Math.abs(days) < 30) {
    return rtf.format(days, 'day');
  }
  
  const months = Math.floor(days / 30);
  return rtf.format(months, 'month');
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get initials from name
 */
export function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}
