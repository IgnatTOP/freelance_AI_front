/**
 * API для работы с выводом средств
 */

import api from "../lib/api/axios";
import type {
  Withdrawal,
  CreateWithdrawalRequest,
} from "@/src/entities/payment/model/types";

/**
 * Создать заявку на вывод средств
 */
export const createWithdrawal = async (data: CreateWithdrawalRequest): Promise<Withdrawal> => {
  const response = await api.post<Withdrawal>("/withdrawals", data);
  return response.data;
};

/**
 * Получить список заявок на вывод
 */
export const getWithdrawals = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<Withdrawal[]> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<Withdrawal[]>(`/withdrawals?${searchParams.toString()}`);
  return response.data;
};
