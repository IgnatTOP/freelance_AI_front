import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирует число как валюту в рублях
 * @param amount - сумма для форматирования
 * @param options - опции форматирования
 * @returns отформатированная строка с символом рубля
 */
export function formatCurrency(
  amount: number,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options || {};

  const formatted = amount.toLocaleString("ru-RU", {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return showSymbol ? `${formatted} ₽` : formatted;
}

/**
 * Форматирует диапазон цен в рублях
 * @param min - минимальная цена
 * @param max - максимальная цена
 * @returns отформатированная строка диапазона
 */
export function formatPriceRange(min?: number, max?: number): string {
  if (!min && !max) return "Не указан";
  if (min && max && min === max) return formatCurrency(min);
  if (min && max) return `${formatCurrency(min, { showSymbol: false })} - ${formatCurrency(max)}`;
  return `От ${formatCurrency(min || max || 0)}`;
}

/**
 * Экспорт утилит для работы с заказами
 */
export * from "./order-utils";

/**
 * Экспорт утилит для работы с числами
 */
export * from "./utils/number-utils";

/**
 * Экспорт валидаций форм
 */
export * from "./utils/form-validations";

/**
 * Экспорт утилит для обработки ошибок
 */
export * from "./utils/error-handler";

/**
 * Экспорт общих констант
 */
export * from "./utils/constants";