/**
 * API для поиска фрилансеров
 */

import api from "../lib/api/axios";

export interface FreelancerSearchResult {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  hourly_rate?: number;
  experience_level?: string;
  skills?: string[];
  location?: string;
  photo_id?: string;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export interface FreelancerSearchParams {
  q?: string;
  skills?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  experience_level?: string;
  location?: string;
  min_rating?: number;
  limit?: number;
  offset?: number;
}

/**
 * Поиск фрилансеров
 */
export const searchFreelancers = async (
  params?: FreelancerSearchParams
): Promise<FreelancerSearchResult[]> => {
  const searchParams = new URLSearchParams();
  
  if (params?.q) searchParams.append("q", params.q);
  if (params?.skills) searchParams.append("skills", params.skills);
  if (params?.min_hourly_rate !== undefined) {
    searchParams.append("min_hourly_rate", String(params.min_hourly_rate));
  }
  if (params?.max_hourly_rate !== undefined) {
    searchParams.append("max_hourly_rate", String(params.max_hourly_rate));
  }
  if (params?.experience_level) searchParams.append("experience_level", params.experience_level);
  if (params?.location) searchParams.append("location", params.location);
  if (params?.min_rating !== undefined) {
    searchParams.append("min_rating", String(params.min_rating));
  }
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<FreelancerSearchResult[]>(
    `/freelancers/search?${searchParams.toString()}`
  );
  return response.data;
};
