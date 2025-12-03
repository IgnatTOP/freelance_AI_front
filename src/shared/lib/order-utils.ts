/**
 * Утилиты для работы с заказами
 */

import type { OrderStatus } from "@/src/entities/order/model/types";

/**
 * Цвета статусов для Ant Design Tag
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus | string, string> = {
  draft: "gray",
  published: "green",
  in_progress: "blue",
  pending_completion: "orange",
  completed: "default",
  cancelled: "red",
};

/**
 * Лейблы статусов на русском
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus | string, string> = {
  draft: "Черновик",
  published: "Опубликован",
  in_progress: "В работе",
  pending_completion: "Ожидает подтверждения",
  completed: "Завершен",
  cancelled: "Отменен",
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
