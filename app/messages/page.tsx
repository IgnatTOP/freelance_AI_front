"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, InputAdornment, Avatar, Badge, Stack } from "@mui/material";
import { Search, MessageSquare, User, Briefcase } from "lucide-react";
import { getMyConversations } from "@/src/shared/api/conversations";
import { useAuth } from "@/src/shared/lib/hooks";
import { websocketService } from "@/src/shared/lib/notifications/websocket.service";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import { PageContainer, EmptyState, StyledCard, LoadingState } from "@/src/shared/ui";
import { iconSize } from "@/src/shared/lib/constants/design";
import type { ConversationListItem } from "@/src/entities/conversation/model/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.locale("ru");

function ConversationItem({ conv, onClick }: { conv: ConversationListItem; onClick: () => void }) {
  const avatarUrl = conv.other_user.photo_url ? getMediaUrl(conv.other_user.photo_url) : null;
  const hasUnread = conv.unread_count && conv.unread_count > 0;

  return (
    <StyledCard interactive onClick={onClick}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Badge badgeContent={hasUnread ? conv.unread_count : 0} color="error">
          <Avatar src={avatarUrl || undefined} sx={{ width: 44, height: 44, bgcolor: "var(--primary-10)" }}>
            {conv.other_user.display_name?.[0]?.toUpperCase() || <User size={18} />}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontWeight: hasUnread ? 600 : 500, fontSize: 14 }}>
              {conv.other_user.display_name}
            </Typography>
            {conv.last_message && (
              <Typography sx={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                {dayjs(conv.last_message.created_at).fromNow()}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
            <Briefcase size={11} style={{ color: "var(--text-muted)" }} />
            <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>{conv.order_title}</Typography>
          </Stack>

          {conv.last_message && (
            <Typography
              sx={{
                fontSize: 13,
                color: hasUnread ? "var(--text)" : "var(--text-muted)",
                fontWeight: hasUnread ? 500 : 400,
                mt: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {conv.last_message.content}
            </Typography>
          )}
        </Box>
      </Stack>
    </StyledCard>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [search, setSearch] = useState("");

  const loadConversations = useCallback(async () => {
    try {
      const data = await getMyConversations();
      setConversations(data || []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    loadConversations();
    websocketService.connect().catch(() => {});

    const unsub = websocketService.on("chat.message", (wsMsg) => {
      const data = wsMsg.data;
      if (data?.conversation && data?.message) {
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === data.conversation.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              last_message: { content: data.message.content, created_at: data.message.created_at },
              unread_count: (updated[idx].unread_count || 0) + 1,
            };
            const [moved] = updated.splice(idx, 1);
            return [moved, ...updated];
          }
          loadConversations();
          return prev;
        });
      }
    });

    return () => unsub();
  }, [authLoading, loadConversations]);

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.order_title.toLowerCase().includes(q) || c.other_user.display_name.toLowerCase().includes(q);
  });

  return (
    <PageContainer title="Сообщения" subtitle={`${conversations.length} диалогов`}>
      {/* Search */}
      <StyledCard sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={iconSize.md} /></InputAdornment>,
          }}
        />
      </StyledCard>

      {/* List */}
      {loading ? (
        <LoadingState type="list" count={3} height={72} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={search ? "Ничего не найдено" : "Нет сообщений"}
          description={search ? "Попробуйте другой запрос" : "Диалоги появятся после отклика на заказ"}
        />
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((conv) => (
            <ConversationItem key={conv.id} conv={conv} onClick={() => router.push(`/messages/${conv.id}`)} />
          ))}
        </Stack>
      )}
    </PageContainer>
  );
}
