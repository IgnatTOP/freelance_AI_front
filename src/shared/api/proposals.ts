/**
 * API для работы с предложениями (откликами)
 */

import api from "../lib/api/axios";

export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Proposal {
  id: string;
  order_id: string;
  freelancer_id: string;
  cover_letter: string;
  proposed_amount?: number;
  status: ProposalStatus;
  ai_feedback?: string;
  created_at: string;
  updated_at?: string;
  freelancer?: {
    display_name?: string;
    skills?: string[];
    experience_level?: string;
    photo_id?: string;
  };
  order?: {
    id: string;
    title: string;
    status: string;
    client_id: string;
  };
}

export interface CreateProposalRequest {
  cover_letter: string;
  amount?: number;
}

export interface ProposalListResponse {
  proposals: Proposal[];
  best_recommendation_proposal_id?: string;
  recommendation_justification?: string;
  // Legacy field for backward compatibility
  best_recommendation?: {
    proposal_id: string;
    justification: string;
  };
}

export interface UpdateProposalStatusResponse {
  proposal: Proposal;
  conversation?: {
    id: string;
    order_id: string;
    client_id: string;
    freelancer_id: string;
  };
  order?: {
    id: string;
    title: string;
    status: string;
  };
}

/**
 * Создать предложение на заказ
 */
export const createProposal = async (
  orderId: string,
  data: CreateProposalRequest
): Promise<Proposal> => {
  const response = await api.post<Proposal>(`/orders/${orderId}/proposals`, data);
  return response.data;
};

/**
 * Получить предложения на заказ
 */
export const getOrderProposals = async (
  orderId: string
): Promise<ProposalListResponse> => {
  const response = await api.get<ProposalListResponse | Proposal[]>(`/orders/${orderId}/proposals`);
  const data = response.data;
  
  // Если пришел массив, оборачиваем в ProposalListResponse
  if (Array.isArray(data)) {
    return { proposals: data };
  }
  
  return data;
};

/**
 * Получить своё предложение на заказ
 */
export const getMyProposal = async (orderId: string): Promise<Proposal> => {
  const response = await api.get<Proposal>(`/orders/${orderId}/my-proposal`);
  return response.data;
};

/**
 * Получить все свои предложения
 */
export const getMyProposals = async (): Promise<Proposal[]> => {
  const response = await api.get<Proposal[]>("/proposals/my");
  return response.data;
};

/**
 * Изменить статус предложения
 */
export const updateProposalStatus = async (
  orderId: string,
  proposalId: string,
  status: "accepted" | "rejected" | "withdrawn"
): Promise<UpdateProposalStatusResponse> => {
  const response = await api.put<UpdateProposalStatusResponse>(
    `/orders/${orderId}/proposals/${proposalId}/status`,
    { status }
  );
  return response.data;
};
