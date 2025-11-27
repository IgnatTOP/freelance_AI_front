/**
 * Форматирование времени относительно текущего момента
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "только что";
  if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ч назад`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "вчера";
  if (diffInDays < 7) return `${diffInDays} дн назад`;

  return time.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Форматирование даты
 */
export function formatDate(
  dateString: string,
  options?: {
    includeYear?: boolean;
    locale?: string;
  }
): string {
  const date = new Date(dateString);
  const { includeYear = false, locale = "ru-RU" } = options || {};

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    ...(includeYear && { year: "numeric" }),
  });
}

/**
 * Безопасный парсинг JSON
 */
export function safeJsonParse<T>(data: string | object | null | undefined, fallback: T): T {
  if (!data) return fallback;

  if (typeof data === 'object') {
    return data as T;
  }

  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}
