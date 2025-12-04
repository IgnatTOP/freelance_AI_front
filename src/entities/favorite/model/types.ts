/**
 * Типы данных для избранного
 */

export type FavoriteTargetType = "order" | "freelancer";

export interface Favorite {
  id: string;
  user_id: string;
  target_type: FavoriteTargetType;
  target_id: string;
  created_at: string;
}

export interface AddFavoriteRequest {
  target_type: FavoriteTargetType;
  target_id: string;
}

export interface IsFavoriteResponse {
  is_favorite: boolean;
}
