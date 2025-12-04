/**
 * Типы данных для жалоб
 */

export type ReportTargetType = "user" | "order" | "message" | "review";
export type ReportStatus = "pending" | "reviewed" | "action_taken" | "dismissed";

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface CreateReportRequest {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description?: string;
}
