/**
 * Типы данных для сущности Portfolio
 */

export interface MediaFile {
  id: string;
  user_id?: string;
  file_path: string;
  file_type: string;
  file_size: number;
  is_public: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_media_id?: string;
  ai_tags: string[];
  external_link?: string;
  created_at: string;
  media?: MediaFile[];
}

export interface CreatePortfolioItemRequest {
  title: string;
  description?: string;
  cover_media_id?: string;
  ai_tags?: string[];
  external_link?: string;
  media_ids?: string[];
}

export interface UpdatePortfolioItemRequest {
  title: string;
  description?: string;
  cover_media_id?: string;
  ai_tags?: string[];
  external_link?: string;
  media_ids?: string[];
}

export interface PortfolioItemWithMedia extends PortfolioItem {
  media: MediaFile[];
}

