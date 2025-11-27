/**
 * API для работы с портфолио
 */

import api from "../lib/api/axios";
import type {
  PortfolioItem,
  PortfolioItemWithMedia,
  CreatePortfolioItemRequest,
  UpdatePortfolioItemRequest,
} from "@/src/entities/portfolio/model/types";

/**
 * Получить список элементов портфолио текущего пользователя
 */
export const getMyPortfolio = async (): Promise<PortfolioItem[]> => {
  const response = await api.get<PortfolioItem[]>("/portfolio");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Получить публичное портфолио пользователя
 */
export const getUserPortfolio = async (userId: string): Promise<PortfolioItemWithMedia[]> => {
  const response = await api.get<PortfolioItemWithMedia[]>(`/users/${userId}/portfolio`);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Получить элемент портфолио по ID
 */
export const getPortfolioItem = async (id: string): Promise<PortfolioItemWithMedia> => {
  const response = await api.get<PortfolioItemWithMedia>(`/portfolio/${id}`);
  return response.data;
};

/**
 * Создать элемент портфолио
 */
export const createPortfolioItem = async (
  data: CreatePortfolioItemRequest
): Promise<PortfolioItem> => {
  const response = await api.post<PortfolioItem>("/portfolio", data);
  return response.data;
};

/**
 * Обновить элемент портфолио
 */
export const updatePortfolioItem = async (
  id: string,
  data: UpdatePortfolioItemRequest
): Promise<PortfolioItemWithMedia> => {
  const response = await api.put<PortfolioItemWithMedia>(`/portfolio/${id}`, data);
  return response.data;
};

/**
 * Удалить элемент портфолио
 */
export const deletePortfolioItem = async (id: string): Promise<void> => {
  await api.delete(`/portfolio/${id}`);
};
