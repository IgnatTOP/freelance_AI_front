/**
 * Типы данных для споров
 */

export type DisputeStatus = "open" | "under_review" | "resolved_client" | "resolved_freelancer" | "cancelled";

export interface Dispute {
  id: string;
  escrow_id: string;
  order_id: string;
  initiator_id: string;
  reason: string;
  status: DisputeStatus;
  resolution?: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
}

export interface CreateDisputeRequest {
  reason: string;
}
