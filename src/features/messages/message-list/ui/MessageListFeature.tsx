"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, Card, Skeleton, TextField, Box, InputAdornment } from "@mui/material";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { ConversationCard } from "./ConversationCard";
import { getMyConversations } from "@/src/shared/api/conversations";
import { useAuth } from "@/src/shared/lib/hooks/useAuth";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import type { ConversationListItem } from "@/src/entities/conversation/model/types";

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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
          Сообщения
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          Общайтесь с заказчиками и исполнителями
        </Typography>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по сообщениям..."
          size="medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
      </Card>

      {/* Conversations List */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={100} />
          ))}
        </Box>
      ) : filteredConversations.length === 0 ? (
        <Card sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {search ? "Не найдено по запросу" : "Нет сообщений"}
            </Typography>
            {!search && (
              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Начните новый диалог с другим пользователем
              </Typography>
            )}
          </Box>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredConversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </Box>
      )}
    </motion.div>
  );
}

