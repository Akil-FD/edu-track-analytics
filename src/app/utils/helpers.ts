
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  }) as T;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours === 0 && minutes === 0) {
    return `${secs}s`;
  }

  if (hours === 0) {
    return `${minutes}m ${secs}s`;
  }

  if (minutes === 0 && secs === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m ${secs}s`;
}