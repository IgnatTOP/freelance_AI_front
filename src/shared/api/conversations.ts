/**
 * API для работы с чатами и сообщениями
 */

import api from "../lib/api/axios";
import type {
  ConversationListItem,
  MessagesResponse,
  CreateMessageRequest,
  UpdateMessageRequest,
  ListMessagesParams,
} from "@/src/entities/conversation/model/types";

/**
 * Получить список чатов текущего пользователя
 */
export const getMyConversations = async (): Promise<ConversationListItem[]> => {
  const response = await api.get<ConversationListItem[]>("/conversations/my");
  return response.data;
};

/**
 * Получить чат по заказу (только если есть accepted proposal)
 */
export const getOrderChat = async (orderId: string): Promise<MessagesResponse> => {
  const response = await api.get<MessagesResponse>(`/orders/${orderId}/chat`);
  return response.data;
};

/**
 * Получить чат с участником по заказу (старый метод, для обратной совместимости)
 */
export const getConversation = async (
  orderId: string,
  participantId: string
): Promise<MessagesResponse> => {
  const response = await api.get<MessagesResponse>(
    `/orders/${orderId}/conversations/${participantId}`
  );
  return response.data;
};

/**
 * Получить сообщения чата
 */
export const getMessages = async (
  conversationId: string,
  params?: ListMessagesParams
): Promise<MessagesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.offset) searchParams.append("offset", String(params.offset));

  const response = await api.get<MessagesResponse>(
    `/conversations/${conversationId}/messages?${searchParams.toString()}`
  );
  return response.data;
};

/**
 * Отправить сообщение
 */
export const sendMessage = async (
  conversationId: string,
  data: CreateMessageRequest
): Promise<{ message: any }> => {
  const response = await api.post(`/conversations/${conversationId}/messages`, data);
  return response.data;
};

/**
 * Редактировать сообщение
 */
export const updateMessage = async (
  conversationId: string,
  messageId: string,
  data: UpdateMessageRequest
): Promise<void> => {
  await api.put(`/conversations/${conversationId}/messages/${messageId}`, data);
};

/**
 * Удалить сообщение
 */
export const deleteMessage = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/messages/${messageId}`);
};

/**
 * Добавить реакцию на сообщение
 */
export const addReaction = async (
  conversationId: string,
  messageId: string,
  emoji: string
): Promise<{ reaction: any }> => {
  const response = await api.post(
    `/conversations/${conversationId}/messages/${messageId}/reactions`,
    { emoji }
  );
  return response.data;
};

/**
 * Удалить реакцию на сообщение
 */
export const removeReaction = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/messages/${messageId}/reactions`);
};

