/**
 * API для работы с каталогом (категории и навыки)
 */

import api from "../lib/api/axios";
import type {
  CategoriesResponse,
  CategoryDetailResponse,
  SkillsResponse,
} from "@/src/entities/catalog/model/types";

/**
 * Получить список категорий
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get<CategoriesResponse>("/catalog/categories");
  return response.data;
};

/**
 * Получить категорию по slug
 */
export const getCategoryBySlug = async (slug: string): Promise<CategoryDetailResponse> => {
  const response = await api.get<CategoryDetailResponse>(`/catalog/categories/${slug}`);
  return response.data;
};

/**
 * Получить список навыков
 */
export const getSkills = async (categoryId?: string): Promise<SkillsResponse> => {
  const searchParams = new URLSearchParams();
  if (categoryId) searchParams.append("category_id", categoryId);
  
  const response = await api.get<SkillsResponse>(`/catalog/skills?${searchParams.toString()}`);
  return response.data;
};
