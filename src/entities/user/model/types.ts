/**
 * Типы данных для сущности User
 */

export type UserRole = "client" | "freelancer" | "admin";
export type ExperienceLevel = "junior" | "middle" | "senior";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface Profile {
  user_id: string;
  display_name: string;
  bio?: string;
  hourly_rate?: number;
  experience_level?: ExperienceLevel;
  skills?: string[];
  location?: string;
  photo_id?: string;
  ai_summary?: string;
  phone?: string;
  telegram?: string;
  website?: string;
  company_name?: string;
  inn?: string;
  updated_at?: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  hourly_rate?: number;
  experience_level?: ExperienceLevel;
  skills?: string[];
  location?: string;
  photo_id?: string;
  phone?: string;
  telegram?: string;
  website?: string;
  company_name?: string;
  inn?: string;
}

export interface UserStats {
  total_orders?: number;
  completed_orders?: number;
  average_rating?: number;
  total_reviews?: number;
}

export interface UserProfileResponse {
  user: User;
  profile: Profile;
  stats?: UserStats;
}

export interface PublicUserResponse {
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
  profile: {
    display_name?: string;
    bio?: string;
    skills?: string[];
    experience_level?: ExperienceLevel;
  };
  stats?: UserStats;
}
