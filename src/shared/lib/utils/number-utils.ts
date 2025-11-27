/**
 * Утилиты для работы с числами
 */

/**
 * Форматирует число с разделителями тысяч (пробелы)
 * @param value - число для форматирования
 * @returns отформатированная строка или пустая строка
 */
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
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

