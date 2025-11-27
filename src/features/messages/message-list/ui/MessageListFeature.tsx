"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, Card, Skeleton, Empty, Input, Space } from "antd";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { ConversationCard } from "./ConversationCard";
import { getMyConversations } from "@/src/shared/api/conversations";
import { useAuth } from "@/src/shared/lib/hooks/useAuth";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import type { ConversationListItem } from "@/src/entities/conversation/model/types";

const { Title, Text } = Typography;

export function MessageListFeature() {
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [search, setSearch] = useState("");

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyConversations();
      setConversations(data);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadConversations();
      
      // Подключаемся к WebSocket для обновлений в реальном времени
      const connectWebSocket = async () => {
        try {
          await websocketService.connect();
        } catch (error) {
          // Silently handle connection errors - they're expected if backend is down
          // WebSocket will automatically attempt to reconnect
        }
      };

      connectWebSocket();

      // Подписываемся на новые сообщения для обновления списка
      const unsubscribeChat = websocketService.on("chat.message", (wsMessage) => {
        const chatData = wsMessage.data;
        if (chatData?.conversation && chatData?.message) {
          // Обновляем список чатов
          setConversations((prev) => {
            const conversationId = chatData.conversation.id;
            const existingIndex = prev.findIndex((c) => c.id === conversationId);
            
            if (existingIndex >= 0) {
              // Обновляем существующий чат
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                last_message: {
                  content: chatData.message.content,
                  created_at: chatData.message.created_at,
                },
                unread_count: (updated[existingIndex].unread_count || 0) + 1,
              };
              // Перемещаем в начало списка
              const [moved] = updated.splice(existingIndex, 1);
              return [moved, ...updated];
            } else {
              // Если чата нет в списке, перезагружаем список
              loadConversations();
            }
            return prev;
          });
        }
      });

      return () => {
        unsubscribeChat();
      };
    }
  }, [authLoading, loadConversations]);


  const filteredConversations = conversations.filter((conv) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      conv.order_title.toLowerCase().includes(searchLower) ||
      conv.other_user.display_name.toLowerCase().includes(searchLower) ||
      conv.last_message?.content.toLowerCase().includes(searchLower)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-0">Сообщения</Title>
        <Text className="text-foreground-tertiary">
          Общайтесь с заказчиками и исполнителями
        </Text>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          placeholder="Поиск по сообщениям..."
          size="large"
          prefix={<Search size={18} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
      </Card>

      {/* Conversations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 2 }} />
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <Card>
          <Empty
            description={search ? "Не найдено по запросу" : "Нет сообщений"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

