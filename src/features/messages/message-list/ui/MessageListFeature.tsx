"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, Card, Skeleton, TextField, Box, InputAdornment, Stack } from "@mui/material";
import { Search, MessageSquare } from "lucide-react";
import { ConversationCard } from "./ConversationCard";
import { getMyConversations } from "@/src/shared/api/conversations";
import { useAuth } from "@/src/shared/lib/hooks/useAuth";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import { EmptyState } from "@/src/shared/ui";
import { radius, iconSize } from "@/src/shared/lib/constants/design";
import type { ConversationListItem } from "@/src/entities/conversation/model/types";

const cardSx = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: `${radius.lg}px`,
};

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

      const connectWebSocket = async () => {
        try {
          await websocketService.connect();
        } catch (error) {
          // Silently handle
        }
      };
      connectWebSocket();

      const unsubscribeChat = websocketService.on("chat.message", (wsMessage) => {
        const chatData = wsMessage.data;
        if (chatData?.conversation && chatData?.message) {
          setConversations((prev) => {
            const conversationId = chatData.conversation.id;
            const existingIndex = prev.findIndex((c) => c.id === conversationId);

            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                last_message: {
                  content: chatData.message.content,
                  created_at: chatData.message.created_at,
                },
                unread_count: (updated[existingIndex].unread_count || 0) + 1,
              };
              const [moved] = updated.splice(existingIndex, 1);
              return [moved, ...updated];
            } else {
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
    <>
      {/* Search */}
      <Card sx={{ ...cardSx, mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по сообщениям..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={iconSize.md} />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Conversations List */}
      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: `${radius.lg}px` }} />
          ))}
        </Stack>
      ) : filteredConversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={search ? "Не найдено" : "Нет сообщений"}
          description={search ? "Попробуйте другой запрос" : "Начните диалог с пользователем"}
        />
      ) : (
        <Stack spacing={2}>
          {filteredConversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </Stack>
      )}
    </>
  );
}
