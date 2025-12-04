/**
 * Типы данных для сущности Order
 */

export type OrderStatus = "draft" | "published" | "in_progress" | "pending_completion" | "completed" | "cancelled";

export type SkillLevel = "junior" | "middle" | "senior";

export interface OrderRequirement {
  id?: string;
  skill: string;
  level: SkillLevel;
}

export interface OrderAttachment {
  id: string;
  media_id?: string;
  media?: {
    id: string;
    url?: string;
    file_path?: string;
    filename?: string;
    file_type?: string;
  };
}

export interface Order {
  id: string;
  client_id: string;
  freelancer_id?: string;
  category_id?: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  final_amount?: number;
  status: OrderStatus;
  deadline_at?: string;
  ai_summary?: string;
  best_recommendation_proposal_id?: string;
  best_recommendation_justification?: string;
  created_at: string;
  updated_at: string;
  proposals_count?: number;
  requirements?: OrderRequirement[];
  attachments?: OrderAttachment[];
}

export interface CreateOrderRequest {
  title: string;
  description: string;
  category_id?: string;
  budget_min?: number;
  budget_max?: number;
  deadline_at?: string;
  requirements?: Array<{ skill: string; level: SkillLevel }>;
  attachment_ids?: string[];
}

export interface UpdateOrderRequest {
  title?: string;
  description?: string;
  category_id?: string;
  budget_min?: number;
  budget_max?: number;
  deadline_at?: string;
  status?: OrderStatus;
  requirements?: Array<{ skill: string; level: SkillLevel }>;
  attachment_ids?: string[];
}

export interface OrderListParams {
  status?: OrderStatus;
  category_id?: string;
  search?: string;
  skills?: string;
  budget_min?: number;
  budget_max?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface OrderListResponse {
  data: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more?: boolean;
  };
}

export interface MyOrdersResponse {
  as_client?: Order[];
  as_freelancer?: Order[];
}
