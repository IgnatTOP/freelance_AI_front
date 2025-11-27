/**
 * Типы данных для сущности Media
 */

export interface Media {
  id: string;
  url: string;
  type: string;
  filename: string;
  size?: number;
  created_at: string;
}

export interface UploadMediaResponse {
  id: string;
  user_id?: string;
  file_path: string;
  file_type: string;
  file_size: number;
  is_public: boolean;
  created_at: string;
}

