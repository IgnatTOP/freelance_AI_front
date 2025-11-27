/**
 * API для работы со статистикой
 */

import api from "../lib/api/axios";

export interface StatsResponse {
  orders: {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
    total_proposals: number;
  };
  proposals: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  balance: number;
  average_rating: number;
  total_reviews: number;
  completion_rate: number;
  response_time_hours: number;
}

/**
 * Получить статистику пользователя
 */
export const getStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>("/stats");
  return response.data;
};

