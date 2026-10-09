/**
 * Format ISO date string into readable Indian standard format
 * e.g., '2026-03-28T14:20:00Z' -> '28 Mar 2026, 02:20 PM'
 */
export function formatDate(dateString, includeTime = true) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(includeTime
        ? {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }
        : {}),
    };

    return new Intl.DateTimeFormat('en-IN', options).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format relative time (e.g. '2 hours ago', '3 days ago')
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString, false);
  } catch {
    return formatDate(dateString, false);
  }
}
