/**
 * Утилиты для работы с заказами
 */

import type { OrderStatus } from "@/src/entities/order/model/types";

/**
 * Цвета статусов для Ant Design Tag
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus | string, string> = {
  published: "green",
  in_progress: "blue",
  completed: "default",
  cancelled: "red",
  draft: "gray",
};

/**
 * Лейблы статусов на русском
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus | string, string> = {
  published: "Опубликован",
  in_progress: "В работе",
  completed: "Завершен",
  cancelled: "Отменен",
  draft: "Черновик",
};

/**
 * Получить цвет статуса
 */
export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] || "default";
}

/**
 * Получить лейбл статуса
 */
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}

