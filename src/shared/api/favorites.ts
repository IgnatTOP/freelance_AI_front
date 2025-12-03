/**
 * API для работы с избранным
 */

import api from "../lib/api/axios";
import type {
  Favorite,
  FavoriteTargetType,
  AddFavoriteRequest,
  IsFavoriteResponse,
} from "@/src/entities/favorite/model/types";

/**
 * Добавить в избранное
 */
export const addFavorite = async (data: AddFavoriteRequest): Promise<Favorite> => {
  const response = await api.post<Favorite>("/favorites", data);
  return response.data;
};

/**
 * Получить список избранного
 */
export const getFavorites = async (params?: {
  type?: FavoriteTargetType;
  limit?: number;
  offset?: number;
}): Promise<Favorite[]> => {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append("type", params.type);
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<Favorite[]>(`/favorites?${searchParams.toString()}`);
  return response.data;
};

/**
 * Проверить, в избранном ли объект
 */
export const isFavorite = async (
  type: FavoriteTargetType,
  id: string
): Promise<IsFavoriteResponse> => {
  const response = await api.get<IsFavoriteResponse>(`/favorites/${type}/${id}`);
  return response.data;
};

/**
 * Удалить из избранного
 */
export const removeFavorite = async (
  type: FavoriteTargetType,
  id: string
): Promise<void> => {
  await api.delete(`/favorites/${type}/${id}`);
};
