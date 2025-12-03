/**
 * Типы данных для платежей и Escrow
 */

export interface UserBalance {
  user_id: string;
  available: number;
  frozen: number;
  updated_at: string;
}

export type EscrowStatus = "held" | "released" | "refunded" | "disputed";

export interface Escrow {
  id: string;
  order_id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  status: EscrowStatus;
  created_at: string;
  released_at?: string;
}

export type TransactionType = "deposit" | "withdrawal" | "escrow_hold" | "escrow_release" | "escrow_refund";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Transaction {
  id: string;
  user_id: string;
  order_id?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description?: string;
  created_at: string;
  completed_at?: string;
}

export interface DepositRequest {
  amount: number;
}

export interface CreateEscrowRequest {
  order_id: string;
  freelancer_id: string;
  amount: number;
}

export type WithdrawalStatus = "pending" | "processing" | "completed" | "rejected";

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: WithdrawalStatus;
  card_last4?: string;
  bank_name?: string;
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  card_last4: string;
  bank_name: string;
}
