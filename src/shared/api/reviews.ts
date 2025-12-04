/**
 * API для работы с отзывами
 */

import api from "../lib/api/axios";
import type {
  Review,
  CreateReviewRequest,
  UserReviewsResponse,
} from "@/src/entities/review/model/types";

/**
 * Создать отзыв на заказ
 */
export const createReview = async (
  orderId: string,
  data: CreateReviewRequest
): Promise<Review> => {
  const response = await api.post<Review>(`/orders/${orderId}/reviews`, data);
  return response.data;
};

/**
 * Получить отзывы по заказу
 */
export const getOrderReviews = async (orderId: string): Promise<{ reviews: Review[] }> => {
  const response = await api.get<{ reviews: Review[] }>(`/orders/${orderId}/reviews`);
  return response.data;
};

/**
 * Получить отзывы о пользователе
 */
export const getUserReviews = async (
  userId: string,
  params?: { limit?: number; offset?: number }
): Promise<UserReviewsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<UserReviewsResponse>(
    `/users/${userId}/reviews?${searchParams.toString()}`
  );
  return response.data;
};

/**
 * Проверить возможность оставить отзыв
 */
export const canReview = async (orderId: string): Promise<{ can_review: boolean }> => {
  const response = await api.get<{ can_review: boolean }>(`/orders/${orderId}/can-review`);
  return response.data;
};
