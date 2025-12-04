/**
 * Утилиты для работы с числами
 */

/**
 * Форматирует число с разделителями тысяч (пробелы)
 * @param value - число для форматирования
 * @param showZero - показывать ли 0 как "0" (по умолчанию true)
 * @returns отформатированная строка или пустая строка
 */
export function formatNumber(value: number | string | undefined | null, showZero: boolean = true): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '';
  }
  // Если showZero = false и значение 0, возвращаем пустую строку
  if (!showZero && numValue === 0) {
    return '';
  }
  return `${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Парсит отформатированное число (убирает пробелы)
 * @param value - строка с отформатированным числом
 * @returns число или пустая строка
 */
export function parseFormattedNumber(value: string | undefined | null): string {
  if (!value) {
    return '';
  }
  return value.replace(/\s?/g, "");
}

