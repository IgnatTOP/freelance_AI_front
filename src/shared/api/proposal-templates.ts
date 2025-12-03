/**
 * API для работы с шаблонами откликов
 */

import api from "../lib/api/axios";
import type {
  ProposalTemplate,
  CreateProposalTemplateRequest,
  UpdateProposalTemplateRequest,
} from "@/src/entities/proposal-template/model/types";

/**
 * Создать шаблон отклика
 */
export const createProposalTemplate = async (
  data: CreateProposalTemplateRequest
): Promise<ProposalTemplate> => {
  const response = await api.post<ProposalTemplate>("/proposal-templates", data);
  return response.data;
};

/**
 * Получить список шаблонов
 */
export const getProposalTemplates = async (): Promise<ProposalTemplate[]> => {
  const response = await api.get<ProposalTemplate[]>("/proposal-templates");
  return response.data;
};

/**
 * Обновить шаблон
 */
export const updateProposalTemplate = async (
  id: string,
  data: UpdateProposalTemplateRequest
): Promise<ProposalTemplate> => {
  const response = await api.put<ProposalTemplate>(`/proposal-templates/${id}`, data);
  return response.data;
};

/**
 * Удалить шаблон
 */
export const deleteProposalTemplate = async (id: string): Promise<void> => {
  await api.delete(`/proposal-templates/${id}`);
};
