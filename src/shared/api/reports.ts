/**
 * API для работы с жалобами
 */

import api from "../lib/api/axios";
import type { Report, CreateReportRequest } from "@/src/entities/report/model/types";

/**
 * Подать жалобу
 */
export const createReport = async (data: CreateReportRequest): Promise<Report> => {
  const response = await api.post<Report>("/reports", data);
  return response.data;
};

/**
 * Получить мои жалобы
 */
export const getMyReports = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<Report[]> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<Report[]>(`/reports?${searchParams.toString()}`);
  return response.data;
};
