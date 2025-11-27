import { AxiosError } from "axios";

/**
 * Извлекает сообщение об ошибке из AxiosError
 */
export function getErrorMessage(error: AxiosError): string {
  // Проверяем наличие сообщения в response.data
  if (error.response?.data) {
    const data = error.response.data as any;
    
    // Если есть message в data
    if (data.message) {
      return data.message;
    }
    
    // Если есть error в data
    if (data.error) {
      return typeof data.error === "string" ? data.error : data.error.message || "Произошла ошибка";
    }
    
    // Если data - строка
    if (typeof data === "string") {
      return data;
    }
  }

  // Проверяем message в самом error
  if (error.message) {
    return error.message;
  }

  // Стандартные сообщения по статус кодам
  const statusMessages: Record<number, string> = {
    400: "Неверный запрос",
    401: "Требуется авторизация",
    403: "Доступ запрещен",
    404: "Ресурс не найден",
    409: "Конфликт данных",
    422: "Ошибка валидации",
    429: "Слишком много запросов",
    500: "Внутренняя ошибка сервера",
    502: "Ошибка шлюза",
    503: "Сервис недоступен",
    504: "Таймаут шлюза",
  };

  if (error.response?.status && statusMessages[error.response.status]) {
    return statusMessages[error.response.status];
  }

  return "Произошла неизвестная ошибка";
}

/**
 * Определяет, нужно ли показывать тост для запроса
 */
export function shouldShowToast(config: any): boolean {
  // Если в конфиге явно указано не показывать тост
  if (config?.skipToast === true) {
    return false;
  }

  // Не показываем тосты для определенных эндпоинтов
  const skipEndpoints = [
    "/auth/refresh",
    "/notifications",
    "/notifications/unread-count",
  ];

  const url = config?.url || "";
  return !skipEndpoints.some((endpoint) => url.includes(endpoint));
}

/**
 * Определяет тип тоста на основе HTTP метода и статуса
 */
export function getToastTypeForRequest(
  method: string,
  status: number
): "success" | "error" | "info" {
  if (status >= 200 && status < 300) {
    // Для успешных запросов определяем тип по методу
    if (method === "POST") return "success";
    if (method === "PUT" || method === "PATCH") return "success";
    if (method === "DELETE") return "success";
    return "info";
  }
  return "error";
}

/**
 * Получает заголовок тоста на основе HTTP метода
 */
export function getToastTitleForRequest(
  method: string,
  status: number,
  isError: boolean
): string {
  if (isError) {
    return "Ошибка";
  }

  const methodTitles: Record<string, string> = {
    GET: "Данные загружены",
    POST: "Успешно создано",
    PUT: "Успешно обновлено",
    PATCH: "Успешно обновлено",
    DELETE: "Успешно удалено",
  };

  return methodTitles[method] || "Успешно";
}

