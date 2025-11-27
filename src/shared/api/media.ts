/**
 * API для работы с медиа файлами
 */

import api from "../lib/api/axios";
import type { UploadMediaResponse } from "@/src/entities/media/model/types";

/**
 * Загрузить фото
 */
export const uploadPhoto = async (file: File): Promise<UploadMediaResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UploadMediaResponse>("/media/photos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Удалить медиа файл
 */
export const deleteMedia = async (id: string): Promise<void> => {
  await api.delete(`/media/${id}`);
};

