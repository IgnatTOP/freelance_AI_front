/**
 * Типы данных для сущности Order
 */

export type OrderStatus = "draft" | "published" | "in_progress" | "completed" | "cancelled";

export type SkillLevel = "junior" | "middle" | "senior";

export interface OrderRequirement {
  skill: string;
  level: SkillLevel;
}

export interface OrderAttachment {
  id: string;
  url?: string;
  type?: string;
  filename?: string;
  media_id?: string;
  media?: {
    id: string;
    file_path: string;
    file_type: string;
  };
}

export interface Order {
  id: string;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  status: OrderStatus;
  deadline_at?: string;
  created_at: string;
  updated_at: string;
  client_id: number | string;
  proposals_count?: number;
  requirements?: OrderRequirement[];
  attachments?: OrderAttachment[];
  attachment_ids?: string[];
  summary?: string;
  ai_summary?: string; // Альтернативное название для summary
}

export interface CreateOrderRequest {
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  deadline_at?: string;
  requirements?: OrderRequirement[];
  attachment_ids?: string[];
}

export interface UpdateOrderRequest {
  title?: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  deadline_at?: string;
  status?: OrderStatus;
  requirements?: OrderRequirement[];
  attachment_ids?: string[];
}

export interface OrderListParams {
  search?: string;
  status?: OrderStatus;
  skills?: string | string[]; // Навыки через запятую или массив
  budget_min?: number;
  budget_max?: number;
  sort_by?: string; // Поле сортировки (default: created_at)
  sort_order?: "asc" | "desc"; // Порядок сортировки (default: desc)
  limit?: number;
  offset?: number;
}

export interface OrderListResponse {
  data: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface MyOrdersResponse {
  as_client: Order[];
  as_freelancer: Order[];
}

