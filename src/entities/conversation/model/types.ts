/**
 * Типы данных для сущности Conversation
 */

export interface Conversation {
  id: string;
  order_id: string;
  client_id: string;
  freelancer_id: string;
}

export interface ConversationListItem {
  id: string;
  order_id: string;
  order_title: string;
  other_user: {
    id: string;
    display_name: string;
    photo_id?: string;
    photo_url?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  author_type: "client" | "freelancer";
  author_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateMessageRequest {
  content: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface MessagesResponse {
  conversation: Conversation;
  messages: Message[];
  order?: {
    id: string;
    title: string;
    description?: string;
    status?: string;
    budget_min?: number;
    budget_max?: number;
    deadline_at?: string;
    created_at?: string;
    updated_at?: string;
    client_id?: string;
    requirements?: Array<{
      id: string;
      skill: string;
      level: string;
    }>;
    attachments?: Array<{
      id: string;
      media_id: string;
      media?: {
        id: string;
        file_path: string;
        file_type: string;
      };
    }>;
    accepted_proposal?: {
      id: string;
      proposed_amount?: number;
      cover_letter: string;
    };
  };
  freelancer?: {
    id: string;
    display_name: string;
    photo_id?: string;
    proposal?: {
      id: string;
      cover_letter: string;
      proposed_amount?: number;
    };
  };
  other_user?: {
    id: string;
    display_name: string;
    photo_id?: string;
    photo_url?: string;
  };
}

export interface ListMessagesParams {
  limit?: number;
  offset?: number;
}

