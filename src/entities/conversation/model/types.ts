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

export interface MessageAttachment {
  id: string;
  message_id: string;
  media_id: string;
  created_at: string;
  media: {
    id: string;
    file_path: string;
    file_type: string;
    file_size: number;
    is_public: boolean;
    created_at: string;
  };
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  author_type: "client" | "freelancer" | "system" | "assistant";
  author_id: string | null;
  content: string;
  parent_message_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

export interface CreateMessageRequest {
  content: string;
  parent_message_id?: string;
  attachment_ids?: string[];
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

