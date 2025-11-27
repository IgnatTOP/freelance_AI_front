/**
 * Типы данных для сущности User
 */

export type UserRole = "client" | "freelancer" | "admin";

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface Profile {
  user_id: number;
  display_name: string;
  bio?: string;
  hourly_rate?: number;
  experience_level?: string;
  skills?: string[];
  location?: string;
  photo_id?: number;
  ai_summary?: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  hourly_rate?: number;
  experience_level?: string;
  skills?: string[];
  location?: string;
  photo_id?: number;
}

