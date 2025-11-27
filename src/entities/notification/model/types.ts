/**
 * Типы данных для сущности Notification
 */

export type NotificationType =
  | "order_created"
  | "proposal_sent"
  | "proposal_accepted"
  | "message_received"
  | "order_completed"
  | "profile_updated";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface NotificationCount {
  count: number;
}

