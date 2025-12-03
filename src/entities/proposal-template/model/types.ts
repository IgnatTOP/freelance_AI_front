/**
 * Типы данных для шаблонов откликов
 */

export interface ProposalTemplate {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProposalTemplateRequest {
  title: string;
  content: string;
}

export interface UpdateProposalTemplateRequest {
  title?: string;
  content?: string;
}
