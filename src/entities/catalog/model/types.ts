/**
 * Типы данных для каталога (категории и навыки)
 */

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category_id?: string;
  is_active: boolean;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryDetailResponse {
  category: Category;
  skills: Skill[];
}

export interface SkillsResponse {
  skills: Skill[];
}
