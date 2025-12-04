/**
 * API для работы с уведомлениями
 */

import api from "../lib/api/axios";
import type { Notification } from "@/src/entities/notification/model/types";

/**
 * Получить список уведомлений
 */
export const getNotifications = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<Notification[]> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<Notification[]>(`/notifications?${searchParams.toString()}`);
  return response.data;
};

/**
 * Получить количество непрочитанных уведомлений
 */
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>("/notifications/unread/count");
  return response.data;
};

/**
 * Получить уведомление по ID
 */
export const getNotification = async (id: string): Promise<Notification> => {
  const response = await api.get<Notification>(`/notifications/${id}`);
  return response.data;
};

/**
 * Отметить уведомление как прочитанное
 */
export const markAsRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

/**
 * Отметить все уведомления как прочитанные
 */
export const markAllAsRead = async (): Promise<void> => {
  await api.put("/notifications/read-all");
};

/**
 * Удалить уведомление
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
