/**
 * API для работы с профилем
 */

import api from "../lib/api/axios";
import type { 
  Profile, 
  UpdateProfileRequest, 
  User, 
  UserProfileResponse,
  PublicUserResponse,
} from "@/src/entities/user/model/types";

// Extended response that includes profile fields at top level for convenience
export interface ProfileResponse extends UserProfileResponse {
  // Convenience fields from profile
  skills?: string[];
  experience_level?: string;
  bio?: string;
}

/**
 * Получить текущий профиль (полный ответ с user, profile, stats)
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<UserProfileResponse>("/profile");
  const data = response.data;
  
  // Add convenience fields from profile
  return {
    ...data,
    skills: data.profile?.skills,
    experience_level: data.profile?.experience_level,
    bio: data.profile?.bio,
  };
};

/**
 * Обновить профиль
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<Profile> => {
  const response = await api.put<Profile>("/profile", data);
  return response.data;
};

/**
 * Изменить роль пользователя
 */
export const updateRole = async (role: "client" | "freelancer"): Promise<User> => {
  const response = await api.put<User>("/users/me/role", { role });
  return response.data;
};

/**
 * Получить профиль другого пользователя
 */
export const getUserProfile = async (userId: string): Promise<PublicUserResponse> => {
  const response = await api.get<PublicUserResponse>(`/users/${userId}`);
  return response.data;
};
