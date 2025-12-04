/**
 * Типы данных для сущности Notification
 */

export type NotificationType = 
  | "new_proposal"
  | "proposal_accepted"
  | "proposal_rejected"
  | "new_message"
  | "order_completed"
  | "order_cancelled";

export interface NotificationPayload {
  type: NotificationType;
  order_id?: string;
  order_title?: string;
  freelancer_name?: string;
  message?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  user_id: string;
  payload: NotificationPayload;
  is_read: boolean;
  created_at: string;
}
