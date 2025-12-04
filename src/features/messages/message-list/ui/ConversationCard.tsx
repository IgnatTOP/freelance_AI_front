"use client";

import { Card, Badge, Avatar, Typography, Box, Stack } from "@mui/material";
import { User, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ConversationListItem } from "@/src/entities/conversation/model/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import { radius, iconSize } from "@/src/shared/lib/constants/design";

dayjs.extend(relativeTime);
dayjs.locale("ru");

interface ConversationCardProps {
  conversation: ConversationListItem;
}

const cardSx = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: `${radius.lg}px`,
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": { borderColor: "var(--primary)" },
};

export function ConversationCard({ conversation }: ConversationCardProps) {
  const router = useRouter();

  const avatarUrl = conversation.other_user.photo_url
    ? getMediaUrl(conversation.other_user.photo_url)
    : null;

  const hasUnread = conversation.unread_count && conversation.unread_count > 0;

  return (
    <Card onClick={() => router.push(`/messages/${conversation.id}`)} sx={cardSx}>
      <Stack direction="row" spacing={2} sx={{ p: 2 }}>
        <Badge badgeContent={hasUnread ? conversation.unread_count : 0} color="error">
          <Avatar src={avatarUrl || undefined} sx={{ width: 44, height: 44, bgcolor: "var(--primary-10)", color: "var(--primary)" }}>
            {conversation.other_user.display_name?.charAt(0).toUpperCase() || <User size={iconSize.lg} />}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: hasUnread ? 600 : 500, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {conversation.other_user.display_name}
            </Typography>
            {conversation.last_message && (
              <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11, ml: 1, flexShrink: 0 }}>
                {dayjs(conversation.last_message.created_at).fromNow()}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
            <Briefcase size={iconSize.xs} style={{ color: "var(--text-muted)" }} />
            <Typography variant="caption" sx={{ color: "var(--text-muted)", fontSize: 11 }}>{conversation.order_title}</Typography>
          </Stack>

          {conversation.last_message && (
            <Typography variant="body2" sx={{ color: hasUnread ? "var(--text)" : "var(--text-muted)", fontWeight: hasUnread ? 500 : 400, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {conversation.last_message.content}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
