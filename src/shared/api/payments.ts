/**
 * API для работы с платежами и Escrow
 */

import api from "../lib/api/axios";
import type {
  UserBalance,
  Escrow,
  Transaction,
  DepositRequest,
  CreateEscrowRequest,
} from "@/src/entities/payment/model/types";

/**
 * Получить баланс пользователя
 */
export const getBalance = async (): Promise<UserBalance> => {
  const response = await api.get<UserBalance>("/payments/balance");
  return response.data;
};

/**
 * Пополнить баланс
 */
export const deposit = async (data: DepositRequest): Promise<Transaction> => {
  const response = await api.post<Transaction>("/payments/deposit", data);
  return response.data;
};

/**
 * Создать Escrow (защищённую сделку)
 */
export const createEscrow = async (data: CreateEscrowRequest): Promise<Escrow> => {
  const response = await api.post<Escrow>("/payments/escrow", data);
  return response.data;
};

/**
 * Получить Escrow по заказу
 */
export const getEscrowByOrder = async (orderId: string): Promise<Escrow> => {
  const response = await api.get<Escrow>(`/payments/escrow/${orderId}`);
  return response.data;
};

/**
 * Получить историю транзакций
 */
export const getTransactions = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{ transactions: Transaction[] }> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));
  
  const response = await api.get<{ transactions: Transaction[] }>(
    `/payments/transactions?${searchParams.toString()}`
  );
  return response.data;
};
