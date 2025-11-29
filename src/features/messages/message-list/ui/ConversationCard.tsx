"use client";

import { Card, Badge, Avatar, Typography, useTheme } from "@mui/material";
import { User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ConversationListItem } from "@/src/entities/conversation/model/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";
import { getMediaUrl } from "@/src/shared/lib/api/axios";
import { Box } from "@mui/material";

dayjs.extend(relativeTime);
dayjs.locale("ru");

interface ConversationCardProps {
  conversation: ConversationListItem;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const router = useRouter();
  const theme = useTheme();

  const avatarUrl = conversation.other_user.photo_url
    ? getMediaUrl(conversation.other_user.photo_url)
    : null;

  const hasUnread = conversation.unread_count && conversation.unread_count > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={() => router.push(`/messages/${conversation.id}`)}
        sx={{
          marginBottom: 1,
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2 }}>
          <Badge badgeContent={hasUnread ? conversation.unread_count : 0} color="error">
            <Avatar
              src={avatarUrl || undefined}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.main,
              }}
            >
              {conversation.other_user.display_name?.charAt(0).toUpperCase() || <User size={20} />}
            </Avatar>
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                  {conversation.other_user.display_name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                  <Briefcase size={12} style={{ opacity: 0.6 }} />
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    {conversation.order_title}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {conversation.last_message && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.7,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {conversation.last_message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.6,
                    ml: 1,
                    flexShrink: 0
                  }}
                >
                  {dayjs(conversation.last_message.created_at).fromNow()}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
}

