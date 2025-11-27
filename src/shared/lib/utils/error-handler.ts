/**
 * Утилиты для обработки ошибок API
 */

import { AxiosError } from "axios";
import { toastService } from "../toast";

/**
 * Извлекает сообщение об ошибке из ответа API
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Произошла ошибка"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Произошла неизвестная ошибка";
}

/**
 * Обрабатывает ошибку и показывает сообщение пользователю
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = "Произошла ошибка"
): void {
  const errorMessage = getErrorMessage(error);
  toastService.error(errorMessage || defaultMessage);
  console.error("API Error:", error);
}

/**
 * Обрабатывает ошибку и возвращает сообщение (без показа пользователю)
 */
export function getApiErrorMessage(
  error: unknown,
  defaultMessage: string = "Произошла ошибка"
): string {
  const errorMessage = getErrorMessage(error);
  console.error("API Error:", error);
  return errorMessage || defaultMessage;
}

