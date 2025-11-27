/**
 * API для работы с профилем
 */

import api from "../lib/api/axios";
import type { Profile, UpdateProfileRequest } from "@/src/entities/user/model/types";
import type { User } from "@/src/shared/lib/auth/auth.service";

/**
 * Получить текущий профиль
 */
export const getProfile = async (): Promise<Profile> => {
  const response = await api.get<Profile>("/profile");
  return response.data;
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

