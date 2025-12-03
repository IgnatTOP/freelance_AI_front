/**
 * Типы данных для отзывов
 */

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  // Дополнительные поля для отображения
  reviewer?: {
    id: string;
    display_name?: string;
    photo_id?: string;
  };
  order?: {
    id: string;
    title: string;
  };
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export interface UserReviewsResponse {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
}
