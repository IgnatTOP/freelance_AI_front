/**
 * API для работы со спорами
 */

import api from "../lib/api/axios";
import type { Dispute, CreateDisputeRequest } from "@/src/entities/dispute/model/types";

/**
 * Открыть спор по заказу
 */
export const createDispute = async (
  orderId: string,
  data: CreateDisputeRequest
): Promise<Dispute> => {
  const response = await api.post<Dispute>(`/orders/${orderId}/dispute`, data);
  return response.data;
};

/**
 * Получить спор по заказу
 */
export const getOrderDispute = async (orderId: string): Promise<Dispute> => {
  const response = await api.get<Dispute>(`/orders/${orderId}/dispute`);
  return response.data;
};

/**
 * Получить список моих споров
 */
export const getMyDisputes = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<Dispute[]> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<Dispute[]>(`/disputes?${searchParams.toString()}`);
  return response.data;
};
